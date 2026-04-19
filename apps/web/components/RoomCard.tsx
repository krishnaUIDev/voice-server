import React from 'react';

interface RoomCardProps {
    name: string;
    userCount: number;
    onClick: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ name, userCount, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-6 rounded-[2rem] bg-card border border-zinc-200 shadow-[0_2px_15px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-1px_rgba(0,0,0,0.08)] transition-all cursor-pointer group flex flex-col gap-4"
        >
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#2a5d38] mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2a5d38]"></span>
                    MISFIT MAFIA
                </div>
                <h3 className="text-lg font-black text-[#343330] leading-tight group-hover:text-blue-600 transition-colors tracking-tight">
                    {name}
                </h3>
            </div>

            <div className="flex flex-col gap-2.5">
                {[1, 2, 3].slice(0, Math.min(userCount, 3)).map((i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[0.8rem] bg-zinc-100 border-[1.5px] border-white flex items-center justify-center text-[11px] font-black shadow-sm overflow-hidden text-zinc-700">
                            {String.fromCharCode(64 + i)}
                        </div>
                        <span className="text-[13px] font-black text-[#343330]">User Name {i}</span>
                        <span className="text-zinc-400 text-[10px]">💬</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs font-black text-zinc-400">
                    <span>{userCount}</span>
                    <span className="text-base">👤</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-zinc-400">
                    <span>{Math.max(1, Math.floor(userCount / 5))}</span>
                    <span className="text-base">🎙️</span>
                </div>
            </div>
        </div>
    );
};
