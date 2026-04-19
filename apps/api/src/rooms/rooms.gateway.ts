import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface User {
    id: string;
    name: string;
    isMuted: boolean;
}

interface Room {
    id: string;
    name: string;
    ownerId: string;
    users: User[];
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private rooms: Map<string, Room> = new Map();

    private leaveAllRooms(client: Socket) {
        this.rooms.forEach((room, roomId) => {
            const userIndex = room.users.findIndex(u => u.id === client.id);
            if (userIndex !== -1) {
                room.users.splice(userIndex, 1);
                client.leave(roomId);

                // If owner leaves and room is empty, or just notifying others
                if (room.users.length === 0) {
                    this.rooms.delete(roomId);
                } else {
                    this.server.to(roomId).emit('roomUpdated', room);
                }
            }
        });
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.leaveAllRooms(client);
        this.server.emit('roomsList', Array.from(this.rooms.values()));
    }

    @SubscribeMessage('createRoom')
    handleCreateRoom(@MessageBody() data: { name: string; userName?: string }, @ConnectedSocket() client: Socket) {
        const rooms = Array.from(this.rooms.values());
        console.log(`User ${client.id} attempting to create room. Current rooms:`, rooms.map(r => r.ownerId));

        const existingOwnedRoom = rooms.find(r => r.ownerId === client.id);
        if (existingOwnedRoom) {
            console.log(`Blocked: User ${client.id} already owns room ${existingOwnedRoom.id}`);
            client.emit('error', { message: 'You already have an active room.' });
            return;
        }

        this.leaveAllRooms(client);

        const roomId = Math.random().toString(36).substring(7);
        const newRoom: Room = {
            id: roomId,
            name: data.name,
            ownerId: client.id,
            users: [{ id: client.id, name: data.userName || 'Anonymous', isMuted: false }],
        };
        this.rooms.set(roomId, newRoom);
        client.join(roomId);
        client.emit('roomCreated', newRoom);
        this.server.emit('roomsList', Array.from(this.rooms.values()));
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { roomId: string; userName?: string }, @ConnectedSocket() client: Socket) {
        const room = this.rooms.get(data.roomId);
        if (room) {
            // Rule: Clean leave any other rooms before joining
            this.leaveAllRooms(client);

            room.users.push({ id: client.id, name: data.userName || 'Anonymous', isMuted: false });
            client.join(data.roomId);
            this.server.to(data.roomId).emit('roomUpdated', room);
            this.server.emit('roomsList', Array.from(this.rooms.values()));
        }
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        const room = this.rooms.get(data.roomId);
        if (room) {
            const userIndex = room.users.findIndex(u => u.id === client.id);
            if (userIndex !== -1) {
                room.users.splice(userIndex, 1);
                client.leave(data.roomId);
                this.server.to(data.roomId).emit('roomUpdated', room);
                this.server.emit('roomsList', Array.from(this.rooms.values()));
            }
        }
    }

    @SubscribeMessage('toggleMute')
    handleToggleMute(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        const room = this.rooms.get(data.roomId);
        if (room) {
            const user = room.users.find(u => u.id === client.id);
            if (user) {
                user.isMuted = !user.isMuted;
                this.server.to(data.roomId).emit('roomUpdated', room);
            }
        }
    }

    @SubscribeMessage('sendMessage')
    handleSendMessage(@MessageBody() data: { roomId: string; message: string; userName: string }, @ConnectedSocket() client: Socket) {
        this.server.to(data.roomId).emit('messageReceived', {
            id: Math.random().toString(36).substring(7),
            userId: client.id,
            userName: data.userName,
            text: data.message,
            timestamp: new Date().toISOString(),
        });
    }

    @SubscribeMessage('webrtc-offer')
    handleOffer(@MessageBody() data: { roomId: string; offer: any; to: string }, @ConnectedSocket() client: Socket) {
        this.server.to(data.to).emit('webrtc-offer', {
            offer: data.offer,
            from: client.id,
        });
    }

    @SubscribeMessage('webrtc-answer')
    handleAnswer(@MessageBody() data: { roomId: string; answer: any; to: string }, @ConnectedSocket() client: Socket) {
        this.server.to(data.to).emit('webrtc-answer', {
            answer: data.answer,
            from: client.id,
        });
    }

    @SubscribeMessage('webrtc-candidate')
    handleCandidate(@MessageBody() data: { roomId: string; candidate: any; to: string }, @ConnectedSocket() client: Socket) {
        this.server.to(data.to).emit('webrtc-candidate', {
            candidate: data.candidate,
            from: client.id,
        });
    }

    @SubscribeMessage('getRooms')
    handleGetRooms(@ConnectedSocket() client: Socket) {
        client.emit('roomsList', Array.from(this.rooms.values()));
    }
}
