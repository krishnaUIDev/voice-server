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
    id: string; // Persistent peer ID
    socketId: string; // Ephemeral connection ID
    name: string;
    isMuted: boolean;
}

interface Room {
    id: string; // Unique UUID
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
    private onlineUsers: Map<string, string> = new Map(); // id -> name

    private leaveAllRooms(client: Socket) {
        console.log(`[Backend] Cleaning up rooms for client ${client.id}`);
        this.rooms.forEach((room, roomId) => {
            const userIndex = room.users.findIndex(u => u.socketId === client.id);
            if (userIndex !== -1) {
                console.log(`[Backend] Removing user ${client.id} from room ${roomId}`);
                room.users.splice(userIndex, 1);
                client.leave(roomId);

                if (room.users.length === 0) {
                    console.log(`[Backend] Deleting empty room ${roomId}`);
                    this.rooms.delete(roomId);
                } else {
                    this.server.to(roomId).emit('roomUpdated', room);
                }
            }
        });
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.onlineUsers.set(client.id, 'Anonymous');

        // Immediate sync
        client.emit('roomsList', Array.from(this.rooms.values()));
        this.server.emit('onlineUsersList', Array.from(this.onlineUsers.entries()).map(([id, name]) => ({ id, name })));
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.onlineUsers.delete(client.id);
        this.leaveAllRooms(client);
        this.server.emit('roomsList', Array.from(this.rooms.values()));
        this.server.emit('onlineUsersList', Array.from(this.onlineUsers.entries()).map(([id, name]) => ({ id, name })));
    }

    @SubscribeMessage('updateUserName')
    handleUpdateUserName(@MessageBody() data: { name: string; userId?: string }, @ConnectedSocket() client: Socket) {
        this.onlineUsers.set(client.id, data.name);
        this.server.emit('onlineUsersList', Array.from(this.onlineUsers.entries()).map(([id, name]) => ({ id, name })));

        // Also update their name in any rooms they are in
        this.rooms.forEach((room, roomId) => {
            const user = room.users.find(u => u.socketId === client.id);
            if (user) {
                user.name = data.name;
                this.server.to(roomId).emit('roomUpdated', room);
            }
        });
        this.server.emit('roomsList', Array.from(this.rooms.values()));
    }

    @SubscribeMessage('createRoom')
    handleCreateRoom(@MessageBody() data: { name: string; userId: string; userName?: string }, @ConnectedSocket() client: Socket) {
        const rooms = Array.from(this.rooms.values());
        const existingOwnedRoom = rooms.find(r => r.ownerId === data.userId);
        if (existingOwnedRoom) {
            client.emit('error', { message: 'You already have an active room.' });
            return;
        }

        this.leaveAllRooms(client);

        const userName = data.userName || this.onlineUsers.get(client.id) || 'Anonymous';
        const roomId = Math.random().toString(36).substring(2, 11) + '-' + Math.random().toString(36).substring(2, 11);
        const newRoom: Room = {
            id: roomId,
            name: data.name,
            ownerId: data.userId,
            users: [{ id: data.userId, socketId: client.id, name: userName, isMuted: false }],
        };
        this.rooms.set(roomId, newRoom);
        client.join(roomId);
        client.emit('roomCreated', newRoom);
        this.server.emit('roomsList', Array.from(this.rooms.values()));
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { roomId: string; userId: string; userName?: string }, @ConnectedSocket() client: Socket) {
        const room = this.rooms.get(data.roomId);
        if (room) {
            this.leaveAllRooms(client);

            const userName = data.userName || this.onlineUsers.get(client.id) || 'Anonymous';
            // Avoid duplicate userId if it already exists (e.g. stale entry)
            room.users = room.users.filter(u => u.id !== data.userId);

            room.users.push({ id: data.userId, socketId: client.id, name: userName, isMuted: false });
            client.join(data.roomId);
            this.server.to(data.roomId).emit('roomUpdated', room);
            this.server.emit('roomsList', Array.from(this.rooms.values()));
        }
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
        const room = this.rooms.get(data.roomId);
        if (room) {
            const userIndex = room.users.findIndex(u => u.socketId === client.id);
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
            const user = room.users.find(u => u.socketId === client.id);
            if (user) {
                user.isMuted = !user.isMuted;
                this.server.to(data.roomId).emit('roomUpdated', room);
            }
        }
    }

    @SubscribeMessage('sendMessage')
    handleSendMessage(@MessageBody() data: { roomId: string; text: string }, @ConnectedSocket() client: Socket) {
        const userName = this.onlineUsers.get(client.id) || 'Anonymous';
        console.log(`[Backend] Message from ${userName} in room ${data.roomId}: ${data.text}`);
        console.log(`[Backend] Client ${client.id} is in rooms:`, Array.from(client.rooms));

        const message = {
            sender: userName,
            text: data.text,
            timestamp: new Date().toISOString(),
        };

        this.server.to(data.roomId).emit('newMessage', message);
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
