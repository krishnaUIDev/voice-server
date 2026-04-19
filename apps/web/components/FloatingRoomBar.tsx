"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useVoiceContext } from "../context/VoiceContext";

export const FloatingRoomBar = () => {
    const {
        currentRoom,
        toggleMute,
        leaveRoom,
        socket,
        messages,
        sendMessage,
        userName,
        isViewExpanded,
        setIsViewExpanded
    } = useVoiceContext();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isChatOpen) scrollToBottom();
    }, [messages, isChatOpen]);

    if (!currentRoom || isViewExpanded) return null;

    const myUser = currentRoom.users.find(u => u.id === socket?.id);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageText.trim()) {
            sendMessage(currentRoom.id, messageText);
            setMessageText("");
        }
    };

    return (
        <>
            {/* Chat Drawer */}
            {isChatOpen && (
                <div className="fixed bottom-36 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-[#f4f2e9] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] border border-zinc-200 overflow-hidden flex flex-col h-[500px]">
                        <header className="px-10 py-6 border-b border-zinc-200/50 flex justify-between items-center bg-zinc-50/50">
                            <h3 className="font-black text-lg text-[#343330]">Room Chat</h3>
                            <button onClick={() => setIsChatOpen(false)} className="text-2xl text-zinc-400 hover:text-zinc-900 leading-none">×</button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.sender === userName ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1 px-2">{msg.sender}</span>
                                    <div className={`px-5 py-3 rounded-[1.5rem] font-bold text-sm shadow-sm border ${msg.sender === userName
                                        ? 'bg-[#344fe3] text-white border-blue-400'
                                        : 'bg-white text-zinc-800 border-zinc-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-6 bg-white/50 border-t border-zinc-200/50 flex gap-3">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Say something..."
                                className="flex-1 bg-white px-6 py-3 rounded-[1.2rem] font-bold text-sm outline-none border border-zinc-200 focus:ring-4 ring-blue-500/10 transition-all"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                            />
                            <button type="submit" className="bg-[#344fe3] text-white w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black shadow-lg shadow-blue-500/20 active:scale-90 transition-all">
                                ➔
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 animate-in slide-in-from-bottom duration-700 z-50">
                <div className="bg-[#15202b] rounded-[3rem] p-5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-8">
                    <div
                        className="flex items-center gap-4 bg-white/5 pr-8 p-1 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setIsViewExpanded(true)}
                    >
                        <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-black border-2 border-white/10 shadow-sm overflow-hidden text-white">
                            {currentRoom.users[0]?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-black text-[15px] text-white line-clamp-1">{currentRoom.name}</h4>
                            <p className="text-[11px] font-bold text-zinc-400">{currentRoom.users.length} {currentRoom.users.length === 1 ? 'user' : 'users'} in room</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border border-white/5 active:scale-90 shadow-sm ${isChatOpen ? 'bg-[#344fe3] text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                        >
                            💬
                        </button>
                        <button
                            onClick={() => toggleMute(currentRoom.id)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border border-white/5 active:scale-90 shadow-sm ${myUser?.isMuted ? "bg-red-500 text-white border-red-400 font-bold" : "bg-white/5 hover:bg-white/10 text-white"}`}
                        >
                            {myUser?.isMuted ? "🔇" : "🎙️"}
                        </button>
                        <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition-all border border-white/5 active:scale-90 shadow-sm text-white">👤+</button>
                        <button
                            onClick={() => leaveRoom(currentRoom.id)}
                            className="w-14 h-14 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xl hover:bg-red-600/30 transition-all border border-red-600/10 active:scale-90 shadow-sm"
                        >
                            ✌️
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
