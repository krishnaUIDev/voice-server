"use client";

export default function Notifications() {
    return (
        <div className="p-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-[#343330]">Notifications</h2>
                </header>
                <div className="py-24 flex flex-col items-center bg-card rounded-[3rem] border border-zinc-200 shadow-sm">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm border border-zinc-200 text-3xl">🔔</div>
                    <p className="text-2xl font-black text-zinc-300 mb-2 tracking-tight">Inbox is empty</p>
                    <p className="text-zinc-400 font-bold">We'll let you know when something interesting happens.</p>
                </div>
            </div>
        </div>
    );
}
