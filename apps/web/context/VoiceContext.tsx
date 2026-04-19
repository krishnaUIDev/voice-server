"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

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

interface Message {
    sender: string;
    text: string;
    timestamp: string;
}

interface VoiceContextType {
    rooms: Room[];
    currentRoom: Room | null;
    userName: string;
    messages: Message[];
    socket: Socket | null;
    isCreating: boolean;
    setIsCreating: (val: boolean) => void;
    createRoom: (name: string) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    toggleMute: (roomId: string) => void;
    updateUserName: (name: string) => void;
    sendMessage: (roomId: string, text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [userName, setUserName] = useState<string>("Anonymous");
    const [messages, setMessages] = useState<Message[]>([]);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
    const currentRoomRef = useRef<Room | null>(null);

    useEffect(() => {
        currentRoomRef.current = currentRoom;
    }, [currentRoom]);

    useEffect(() => {
        const s = io("http://localhost:4000");
        setSocket(s);

        const storedName = localStorage.getItem("userName");
        if (storedName) {
            setUserName(storedName);
            s.emit("updateUserName", storedName);
        }

        s.on("roomsList", (updatedRooms: Room[]) => {
            setRooms(updatedRooms);
            const cur = currentRoomRef.current;
            if (cur) {
                const updated = updatedRooms.find(r => r.id === cur.id);
                if (updated) setCurrentRoom(updated);
            }
        });

        s.on("roomUpdated", (updatedRoom: Room) => {
            const cur = currentRoomRef.current;
            if (cur?.id === updatedRoom.id) {
                setCurrentRoom(updatedRoom);
            }
            setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        });

        s.on("newMessage", (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        s.on("webrtc-offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
            const pc = createPeerConnection(from, s);
            if (pc.signalingState !== "stable") return;
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            s.emit("webrtc-answer", { answer, to: from });
        });

        s.on("webrtc-answer", async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
            const pc = peersRef.current[from];
            if (pc && pc.signalingState === "have-local-offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        s.on("webrtc-candidate", async ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {
            const pc = peersRef.current[from];
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        s.on("roomCreated", (newRoom: Room) => {
            setCurrentRoom(newRoom);
        });

        s.on("error", (error: { message: string }) => {
            alert(error.message);
        });

        return () => {
            s.disconnect();
        };
    }, []); // Only once on mount

    const createPeerConnection = (targetId: string, s: Socket) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
            ],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                s.emit("webrtc-candidate", { candidate: event.candidate, to: targetId });
            }
        };

        pc.ontrack = (event) => {
            if (!audioRefs.current[targetId]) {
                const audio = new Audio();
                audio.autoplay = true;
                audioRefs.current[targetId] = audio;

                // Autoplay workaround
                const playAudio = () => {
                    audio.play().catch(e => console.log("Audio play failed:", e));
                    document.removeEventListener('click', playAudio);
                };
                document.addEventListener('click', playAudio);
            }
            audioRefs.current[targetId].srcObject = event.streams[0];
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        peersRef.current[targetId] = pc;
        return pc;
    };

    const clearLocalRoomState = useCallback(() => {
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        Object.values(audioRefs.current).forEach(audio => {
            audio.srcObject = null;
            audio.remove();
        });
        audioRefs.current = {};
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    }, []);

    const createRoom = useCallback((name: string) => {
        clearLocalRoomState();
        socket?.emit("createRoom", { name });
    }, [socket, clearLocalRoomState]);

    const joinRoom = useCallback(async (roomId: string) => {
        if (!socket) return;
        try {
            clearLocalRoomState();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            socket.emit("joinRoom", { roomId });

            const room = rooms.find(r => r.id === roomId);
            if (room) {
                setCurrentRoom(room);
                room.users.forEach(user => {
                    if (user.id !== socket.id) {
                        const pc = createPeerConnection(user.id, socket);
                        pc.createOffer().then(offer => {
                            pc.setLocalDescription(offer);
                            socket.emit("webrtc-offer", { offer, to: user.id });
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Failed to join room:", e);
        }
    }, [socket, rooms]);

    const leaveRoom = useCallback((roomId: string) => {
        socket?.emit("leaveRoom", { roomId });
        setCurrentRoom(null);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        Object.values(audioRefs.current).forEach(audio => {
            audio.srcObject = null;
            audio.remove();
        });
        audioRefs.current = {};
    }, [socket]);

    const toggleMute = useCallback((roomId: string) => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                socket?.emit("toggleMute", { roomId });
            }
        }
    }, [socket]);

    const updateUserName = useCallback((name: string) => {
        setUserName(name);
        localStorage.setItem("userName", name);
        socket?.emit("updateUserName", name);
    }, [socket]);

    const sendMessage = useCallback((roomId: string, text: string) => {
        socket?.emit("sendMessage", { roomId, text });
    }, [socket]);

    const [isCreating, setIsCreating] = useState<boolean>(false);

    return (
        <VoiceContext.Provider value={{
            rooms,
            currentRoom,
            userName,
            messages,
            socket,
            isCreating,
            setIsCreating,
            createRoom,
            joinRoom,
            leaveRoom,
            toggleMute,
            updateUserName,
            sendMessage
        }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoiceContext = () => {
    const context = useContext(VoiceContext);
    if (context === undefined) {
        throw new Error("useVoiceContext must be used within a VoiceProvider");
    }
    return context;
};
