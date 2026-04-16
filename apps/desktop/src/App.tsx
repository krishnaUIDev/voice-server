import { useState } from 'react';
import './App.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="cardamom-container">
            <h1>🌱 Cardamom</h1>
            <p>A premium Electron app for the Pulao workspace.</p>

            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    Count is {count}
                </button>
            </div>

            <div className="versions">
                Running on Node <span id="node-version"></span>,
                Chromium <span id="chromium-version"></span>,
                and Electron <span id="electron-version"></span>.
            </div>

            <p className="read-the-docs">
                Part of the Pulao monorepo.
            </p>
        </div>
    );
}

export default App;
