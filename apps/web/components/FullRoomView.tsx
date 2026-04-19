"use client";

import React from 'react';
import { useVoiceContext } from '../context/VoiceContext';

export const FullRoomView = () => {
    const {
        currentRoom,
        setIsViewExpanded,
        isViewExpanded,
        leaveRoom,
        toggleMute,
        socket,
        userName
    } = useVoiceContext();

    if (!currentRoom || !isViewExpanded) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-end lg:items-center lg:justify-end pointer-events-none">
            {/* Backdrop Blur - only clickable to dismiss */}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 pointer-events-auto ${isViewExpanded ? "opacity-100" : "opacity-0"}`}
                onClick={() => setIsViewExpanded(false)}
            />

            <div className={`
                relative flex flex-col bg-[#15202b] shadow-2xl overflow-hidden border-white/10 pointer-events-auto transition-all duration-500 transform
                /* Mobile: Bottom Sheet */
                w-full h-[90vh] rounded-t-[3rem] border-t slide-in-from-bottom
                /* Desktop: Right Sidebar */
                lg:h-full lg:w-[450px] lg:rounded-l-[2.5rem] lg:rounded-tr-none lg:border-l lg:border-t-0
                ${isViewExpanded ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-x-full"}
            `}>
                {/* Pull Bar (Mobile only) */}
                <div className="lg:hidden w-12 h-1.5 bg-zinc-600/50 rounded-full mx-auto mt-4 mb-2" />

                {/* Header */}
                <header className="px-6 lg:px-8 py-6 flex justify-between items-center bg-[#15202b]/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
                    <button
                        onClick={() => setIsViewExpanded(false)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8 text-white lg:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className="flex-1 text-center px-4">
                        <h1 className="text-lg lg:text-xl font-black text-white truncate italic tracking-tight">
                            {currentRoom.name}
                        </h1>
                    </div>

                    <button
                        onClick={() => {
                            leaveRoom(currentRoom.id);
                            setIsViewExpanded(false);
                        }}
                        className="px-5 py-1.5 bg-red-600/20 text-red-400 font-black rounded-full hover:bg-red-600/30 transition-all text-[11px] uppercase tracking-widest"
                    >
                        Leave
                    </button>
                </header>

                {/* Participant Grid */}
                <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-4">
                        {currentRoom.users.map((user) => {
                            const isHost = user.id === currentRoom.ownerId;
                            const isMe = user.socketId === socket?.id;

                            return (
                                <div key={user.id} className="flex flex-col items-center group">
                                    <div className="relative mb-3">
                                        <div className={`w-16 h-16 sm:w-20 rounded-full flex items-center justify-center text-2xl font-black shadow-inner border-2 transition-transform group-hover:scale-105 ${isHost ? "bg-[#344fe3] text-white border-blue-400" : "bg-zinc-800 text-zinc-300 border-zinc-700"
                                            }`}>
                                            {user.name?.charAt(0).toUpperCase() || "A"}
                                        </div>
                                        {/* Verification Badge Style (Host/Speaker icon) */}
                                        <div className="absolute -bottom-1 -right-1 bg-[#15202b] rounded-full p-1 border border-white/10">
                                            {isHost ? (
                                                <div className="bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
                                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                </div>
                                            ) : (
                                                <div className="bg-zinc-700 rounded-full w-5 h-5 flex items-center justify-center">
                                                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3zM7 8V5a3 3 0 016 0v3a3 3 0 01-6 0z" /><path d="M5 9V8a1 1 0 00-2 0v1a7 7 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-1.07A7 7 0 0017 9V8a1 1 0 10-2 0v1a5 5 0 01-10 0z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        {user.isMuted && (
                                            <div className="absolute top-0 right-0 bg-red-500 rounded-full w-6 h-6 border-2 border-[#15202b] flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-white text-[13px] font-black truncate w-full text-center px-1">
                                        {user.name} {isMe && "(You)"}
                                    </h3>
                                    <p className="text-[#8899a6] text-[11px] font-bold mt-1">
                                        {isHost ? "Host" : "Speaker"}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Controls */}
                <footer className="p-6 lg:p-8 bg-zinc-900/50 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-4">
                        <button
                            onClick={() => toggleMute(currentRoom.id)}
                            className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${currentRoom.users.find(u => u.socketId === socket?.id)?.isMuted
                                ? "bg-red-500 text-white"
                                : "bg-white/10 text-white hover:bg-white/20"
                                }`}
                        >
                            <svg className="w-7 h-7 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                {currentRoom.users.find(u => u.socketId === socket?.id)?.isMuted && (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" className="text-white/40" />
                                )}
                            </svg>
                        </button>
                    </div>

                    <div className="flex gap-4 lg:gap-6">
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <svg className="w-7 h-7 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                        <button className="text-zinc-500 hover:text-white transition-colors">
                            <svg className="w-7 h-7 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
