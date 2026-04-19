"use client";

import { useState, useEffect } from "react";
import { useVoiceContext } from "../context/VoiceContext";
import { RoomCard } from "../components/RoomCard";

export default function Home() {
  const { rooms, joinRoom, createRoom, isCreating, setIsCreating } = useVoiceContext();
  const [newRoomName, setNewRoomName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      createRoom(newRoomName);
      setNewRoomName("");
      setIsCreating(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-[#343330]">All rooms</h2>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            <button className="text-highlight-text border-b-[2px] border-highlight-text pb-1">Following</button>
            <button className="text-zinc-400 hover:text-zinc-900 pb-1">All</button>
          </div>
        </header>

        {isCreating && (
          <div className="mb-10 p-10 bg-card rounded-[3rem] shadow-xl border border-zinc-200 relative overflow-hidden group">
            <h3 className="text-xl font-black mb-6 tracking-tight text-[#343330]">Launch a discussion</h3>
            <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-4">
              <input
                autoFocus
                type="text"
                placeholder="Topic of the room..."
                className="flex-1 bg-zinc-50 px-8 py-5 rounded-[2rem] text-lg font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all border border-zinc-200"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#344fe3] px-12 py-5 rounded-[2rem] font-black text-white shadow-xl shadow-blue-500/30 hover:bg-[#2e45c7] active:scale-95 transition-all text-base"
              >
                Go Live 🚀
              </button>
            </form>
            <button onClick={() => setIsCreating(false)} className="absolute top-10 right-10 text-zinc-300 hover:text-zinc-900 text-3xl leading-none transition-colors">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="group transform transition-all hover:scale-[1.01]">
              <RoomCard
                name={room.name}
                userCount={room.users.length}
                onClick={() => joinRoom(room.id)}
              />
            </div>
          ))}
          {rooms.length === 0 && !isCreating && (
            <div className="col-span-full py-24 flex flex-col items-center">
              <div className="w-20 h-20 bg-card rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm border border-zinc-200 text-3xl">🎙️</div>
              <p className="text-2xl font-black text-zinc-300 mb-4 tracking-tight">No active rooms at the moment</p>
              <button onClick={() => setIsCreating(true)} className="text-[#344fe3] font-black hover:underline text-lg">Be the one to start the conversation!</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
