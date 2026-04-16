export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-slate-900 text-white">
            <h1 className="text-6xl font-bold text-orange-400">Voice Server</h1>
            <p className="mt-3 text-2xl">The Premium Voice Experience</p>
            <div className="mt-6 flex flex-wrap items-center justify-around max-w-4xl sm:w-full">
                <div className="p-6 mt-6 text-left border w-92 rounded-xl hover:text-orange-400 focus:text-orange-400">
                    <h3 className="text-2xl font-bold">Real-time Stats &rarr;</h3>
                    <p className="mt-4 text-xl">Connect to the API to see real-time updates.</p>
                </div>
            </div>
        </main>
    );
}
