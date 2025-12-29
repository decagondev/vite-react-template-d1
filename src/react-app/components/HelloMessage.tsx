/**
 * HelloMessage Component
 * Single Responsibility: Display hello message from API
 * Handles loading and error states
 */
import { useEffect, useState } from "react";

interface HelloResponse {
	message: string;
}

interface ErrorResponse {
	error: string;
}

export function HelloMessage() {
	const [message, setMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchHelloMessage = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch("/api/hello");
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = (await response.json()) as HelloResponse | ErrorResponse;
				
				if ("error" in data) {
					throw new Error(data.error);
				}

				setMessage(data.message);
			} catch (err) {
				const errorMessage = err instanceof Error 
					? err.message 
					: "Failed to fetch hello message";
				setError(errorMessage);
				console.error("Error fetching hello message:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchHelloMessage();
	}, []);

	if (loading) {
		return (
			<div className="hello-message">
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="hello-message error">
				<p>Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="hello-message">
			<h2>{message}</h2>
		</div>
	);
}

