"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVoiceContext } from '../context/VoiceContext';

export const Sidebar = () => {
    const { userName, setIsCreating, onlineUsers } = useVoiceContext();
    const pathname = usePathname();

    const navItems = [
        { icon: '🌐', label: 'All rooms', href: '/', id: 'rooms' },
        { icon: '📅', label: 'Schedule', href: '/schedule', id: 'schedule' },
        { icon: '🏠', label: 'Clubs', href: '/clubs', id: 'clubs' },
        { icon: '🔔', label: 'Notifications', href: '/notifications', id: 'notifications' },
        { icon: '⚙️', label: 'Settings', href: '/settings', id: 'settings' },
    ];

    return (
        <aside className="w-64 flex flex-col bg-sidebar border-r border-zinc-200 p-6 h-full overflow-y-auto">
            <div className="flex flex-col gap-1 mb-8">
                <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black shadow-lg mb-3 overflow-hidden">
                    {userName?.charAt(0).toUpperCase() || "A"}
                </div>
                <h2 className="text-lg font-black tracking-tight text-[#343330] leading-none">{userName || "Anonymous"}</h2>
                <p className="text-zinc-500 font-bold text-[10px]">@{userName?.toLowerCase().replace(/\s/g, '') || "anonymous"}</p>
            </div>

            <nav className="flex flex-col gap-2 mb-8">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-[1.2rem] font-bold transition-all text-[13px] ${pathname === item.href ? "bg-highlight text-highlight-text shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
                    >
                        <span className="text-lg">{item.icon}</span> {item.label}
                        {pathname === item.href && <span className="ml-auto bg-green-500 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-black">+</span>}
                    </Link>
                ))}
            </nav>

            <div className="flex flex-col gap-6">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-2">Online Now ({onlineUsers.length})</p>
                    <div className="flex flex-col gap-4 px-2">
                        {onlineUsers.slice(0, 10).map(user => (
                            <div key={user.id} className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-[1rem] bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-zinc-600 text-[10px]">
                                        {user.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                                </div>
                                <span className="text-xs font-black text-zinc-600 group-hover:text-zinc-900">{user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full bg-[#344fe3] hover:bg-[#2e45c7] text-white font-black py-4 rounded-[1.8rem] transition-all shadow-xl shadow-blue-500/20 text-xs"
                >
                    + Start Room
                </button>
            </div>
        </aside>
    );
};
