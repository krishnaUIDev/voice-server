import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export interface User {
    id: string;
    name: string;
    isMuted: boolean;
}

export interface Room {
    id: string;
    name: string;
    users: User[];
}

export interface Message {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
}

export const useVoice = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    // WebRTC specific state
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const remoteStreams = useRef<Map<string, MediaStream>>(new Map());

    // Initialize Socket once
    useEffect(() => {
        const savedName = localStorage.getItem('pulao_username');
        if (savedName) {
            setUserName(savedName);
        } else {
            const randomName = `User${Math.floor(Math.random() * 1000)}`;
            setUserName(randomName);
            localStorage.setItem('pulao_username', randomName);
        }

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('roomsList', (roomsList: Room[]) => {
            setRooms(roomsList);
        });

        newSocket.on('roomCreated', (room: Room) => {
            setCurrentRoom(room);
            setMessages([]);
        });

        newSocket.on('roomUpdated', (room: Room) => {
            setCurrentRoom(room);
        });

        newSocket.on('messageReceived', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // WebRTC Signaling Handlers
        newSocket.on('webrtc-offer', async ({ offer, from }) => {
            console.log('Received offer from', from);
            const pc = createPeerConnection(newSocket, from);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            newSocket.emit('webrtc-answer', { answer, to: from });
        });

        newSocket.on('webrtc-answer', async ({ answer, from }) => {
            console.log('Received answer from', from);
            const pc = peerConnections.current.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        newSocket.on('webrtc-candidate', async ({ candidate, from }) => {
            console.log('Received candidate from', from);
            const pc = peerConnections.current.get(from);
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        newSocket.emit('getRooms');

        return () => {
            newSocket.close();
            peerConnections.current.forEach(pc => pc.close());
        };
    }, []); // Empty dependency array ensures socket is created only once

    // Effect to handle RTC connections when users change
    useEffect(() => {
        if (!currentRoom || !socket) return;

        const me = socket.id;
        const currentUsers = currentRoom.users.map(u => u.id);

        // Initiate call to anyone we don't have a peer connection for
        currentUsers.forEach(userId => {
            if (userId !== me && !peerConnections.current.has(userId)) {
                console.log('Initiating call to', userId);
                initiateCall(socket, userId);
            }
        });

        // Cleanup connections for users who left
        peerConnections.current.forEach((pc, userId) => {
            if (!currentUsers.includes(userId)) {
                console.log('User left, closing connection to', userId);
                pc.close();
                peerConnections.current.delete(userId);
                document.getElementById(`audio-${userId}`)?.remove();
            }
        });
    }, [currentRoom?.users.length, socket?.id]);

    const startLocalStream = async () => {
        if (localStream) return localStream;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            return null;
        }
    };

    const createPeerConnection = (sock: Socket, targetUserId: string) => {
        if (peerConnections.current.has(targetUserId)) {
            peerConnections.current.get(targetUserId)?.close();
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate to', targetUserId);
                sock.emit('webrtc-candidate', { candidate: event.candidate, to: targetUserId });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${targetUserId}: ${pc.connectionState}`);
        };

        pc.ontrack = (event) => {
            console.log('Received remote track from', targetUserId);
            const remoteStream = event.streams[0];

            let audio = document.getElementById(`audio-${targetUserId}`) as HTMLAudioElement;
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = `audio-${targetUserId}`;
                audio.autoplay = true;
                document.body.appendChild(audio);
            }
            audio.srcObject = remoteStream;

            // Handle autoplay block
            audio.play().catch(err => {
                console.warn('Playback failed, waiting for user interaction:', err);
                const playOnInteract = () => {
                    audio.play();
                    window.removeEventListener('click', playOnInteract);
                };
                window.addEventListener('click', playOnInteract);
            });
        };

        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        peerConnections.current.set(targetUserId, pc);
        return pc;
    };

    const initiateCall = async (sock: Socket, targetUserId: string) => {
        const pc = createPeerConnection(sock, targetUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sock.emit('webrtc-offer', { offer, to: targetUserId });
    };

    const updateUserName = useCallback((name: string) => {
        setUserName(name);
        localStorage.setItem('pulao_username', name);
    }, []);

    const createRoom = useCallback(async (name: string) => {
        await startLocalStream();
        socket?.emit('createRoom', { name, userName });
    }, [socket, userName, localStream]);

    const joinRoom = useCallback(async (roomId: string) => {
        await startLocalStream();
        socket?.emit('joinRoom', { roomId, userName });
        setMessages([]);
    }, [socket, userName, localStream]);

    const leaveRoom = useCallback((roomId: string) => {
        socket?.emit('leaveRoom', { roomId });
        setCurrentRoom(null);
        setMessages([]);
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        const audios = document.querySelectorAll('audio[id^="audio-"]');
        audios.forEach(a => a.remove());
    }, [socket]);

    const toggleMute = useCallback((roomId: string) => {
        if (localStream) {
            const track = localStream.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
            }
        }
        socket?.emit('toggleMute', { roomId });
    }, [socket, localStream]);

    const sendMessage = useCallback((roomId: string, message: string) => {
        socket?.emit('sendMessage', { roomId, message, userName });
    }, [socket, userName]);

    return {
        rooms,
        currentRoom,
        userName,
        messages,
        updateUserName,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleMute,
        sendMessage,
        socket,
    };
};
