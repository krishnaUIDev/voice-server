"use client";

import { useVoiceContext } from "../../context/VoiceContext";
import { useState } from "react";

export default function Settings() {
    const { userName, updateUserName } = useVoiceContext();
    const [newName, setNewName] = useState(userName);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            updateUserName(newName);
        }
    };

    return (
        <div className="p-10">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-[#343330]">Settings</h2>
                </header>
                <div className="bg-card rounded-[3rem] border border-zinc-200 shadow-sm p-10">
                    <h3 className="text-xl font-black mb-6 text-[#343330]">Profile Identity</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2">Display Name</label>
                            <input
                                type="text"
                                className="bg-zinc-50 px-8 py-4 rounded-[1.5rem] text-lg font-bold outline-none focus:ring-4 ring-blue-500/10 transition-all border border-zinc-200"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#344fe3] text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-blue-500/20 hover:bg-[#2e45c7] transition-all"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
