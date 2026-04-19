"use client";

import React, { useState } from 'react';
import { useVoiceContext } from "../context/VoiceContext";

export const CreateRoomModal = () => {
    const { isCreating, setIsCreating, createRoom } = useVoiceContext();
    const [name, setName] = useState("");

    if (!isCreating) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            createRoom(name);
            setName("");
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                onClick={() => setIsCreating(false)}
            />

            <div className="relative w-full max-w-xl bg-[#f4f2e9] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <header className="px-12 pt-12 pb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-black tracking-tight text-[#343330]">Launch a discussion</h2>
                    <button
                        onClick={() => setIsCreating(false)}
                        className="text-3xl text-zinc-400 hover:text-zinc-900 leading-none transition-colors"
                    >
                        ×
                    </button>
                </header>

                <div className="px-12 pb-12">
                    <p className="text-zinc-500 font-bold text-sm mb-8 leading-relaxed">
                        Give your room a topic so people know what you're talking about! 🎙️
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="relative group">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Topic of the room..."
                                className="w-full bg-white px-8 py-6 rounded-[2.2rem] text-xl font-bold shadow-sm outline-none border border-zinc-200 focus:ring-8 ring-blue-500/5 focus:border-[#344fe3] transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 items-center">
                            <button
                                type="submit"
                                className="flex-1 bg-[#344fe3] text-white py-6 rounded-[2.2rem] font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-[#2e45c7] active:scale-[0.98] transition-all"
                            >
                                Go Live 🚀
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-10 py-6 rounded-[2.2rem] font-black text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-zinc-100/50 p-6 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Room will be visible to everyone online
                    </span>
                </div>
            </div>
        </div>
    );
};
