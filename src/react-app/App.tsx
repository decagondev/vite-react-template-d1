// src/App.tsx

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
import honoLogo from "./assets/hono.svg";
import { HelloMessage } from "./components/HelloMessage";
import "./App.css";

function App() {

	return (
		<>
			<div className="header">
				<h1>Hello World from D1</h1>
				<p className="subtitle">React + Vite + Hono + Cloudflare D1</p>
			</div>
			
			{/* Hello World from D1 - Main Feature */}
			<div className="card hello-card">
				<HelloMessage />
			</div>

			<div className="tech-stack">
				<p className="tech-label">Powered by:</p>
				<div className="logos">
					<a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
						<img src={viteLogo} className="logo" alt="Vite logo" />
					</a>
					<a href="https://react.dev" target="_blank" rel="noopener noreferrer">
						<img src={reactLogo} className="logo react" alt="React logo" />
					</a>
					<a href="https://hono.dev/" target="_blank" rel="noopener noreferrer">
						<img src={honoLogo} className="logo cloudflare" alt="Hono logo" />
					</a>
					<a href="https://workers.cloudflare.com/" target="_blank" rel="noopener noreferrer">
						<img
							src={cloudflareLogo}
							className="logo cloudflare"
							alt="Cloudflare logo"
						/>
					</a>
				</div>
			</div>
		</>
	);
}

export default App;
