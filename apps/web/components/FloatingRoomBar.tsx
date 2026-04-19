"use client";

import React from 'react';
import { useVoiceContext } from '../context/VoiceContext';

export const FloatingRoomBar = () => {
    const { currentRoom, toggleMute, leaveRoom, socket } = useVoiceContext();

    if (!currentRoom) return null;

    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 animate-in slide-in-from-bottom duration-700 z-50">
            <div className="bg-white rounded-[3rem] p-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-zinc-100 flex items-center gap-8">
                <div className="flex items-center gap-4 bg-zinc-50 pr-8 p-1 rounded-full border border-zinc-100">
                    <div className="w-14 h-14 bg-zinc-200 rounded-full flex items-center justify-center text-xl font-black border-2 border-white shadow-sm overflow-hidden text-zinc-800">
                        {currentRoom.users[0]?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <h4 className="font-black text-[15px] text-[#343330] line-clamp-1">{currentRoom.name}</h4>
                        <p className="text-[11px] font-bold text-zinc-500">{currentRoom.users.length} user together with you</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <button className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-xl hover:bg-zinc-100 transition-all border border-zinc-100 active:scale-90">😊</button>
                    <button
                        onClick={() => toggleMute(currentRoom.id)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all border border-zinc-100 active:scale-90 shadow-sm ${currentRoom.users.find(u => u.id === socket?.id)?.isMuted ? "bg-red-500 text-white border-red-400" : "bg-zinc-50 hover:bg-zinc-100"
                            }`}
                    >
                        {currentRoom.users.find(u => u.id === socket?.id)?.isMuted ? "🔇" : "🎙️"}
                    </button>
                    <button className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-xl hover:bg-zinc-100 transition-all border border-zinc-100 active:scale-90 shadow-sm">👤+</button>
                    <button
                        onClick={() => leaveRoom(currentRoom.id)}
                        className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl hover:bg-red-100 transition-all border border-red-100 active:scale-90 shadow-sm"
                    >
                        ✌️
                    </button>
                </div>
            </div>
        </div>
    );
};
