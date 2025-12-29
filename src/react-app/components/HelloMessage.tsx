/**
 * HelloMessage Component
 * Single Responsibility: Display and manage hello message from API
 * Handles loading, error states, and message creation/updates
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
	const [newMessage, setNewMessage] = useState<string>("");
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);

	const fetchHelloMessage = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch("/api/hello");
			
			if (!response.ok) {
				const errorData = (await response.json()) as ErrorResponse;
				throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
			}

			const data = (await response.json()) as HelloResponse | ErrorResponse;
			
			if ("error" in data) {
				throw new Error(data.error);
			}

			setMessage(data.message);
			setNewMessage(data.message);
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

	useEffect(() => {
		fetchHelloMessage();
	}, []);

	const handleSaveMessage = async () => {
		if (!newMessage.trim()) {
			setError("Message cannot be empty");
			return;
		}

		try {
			setSaving(true);
			setError(null);

			const response = await fetch("/api/hello", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content: newMessage.trim() }),
			});

			if (!response.ok) {
				const errorData = (await response.json()) as ErrorResponse;
				throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
			}

			const data = (await response.json()) as HelloResponse | ErrorResponse;
			
			if ("error" in data) {
				throw new Error(data.error);
			}

			setMessage(data.message);
			setIsEditing(false);
		} catch (err) {
			const errorMessage = err instanceof Error 
				? err.message 
				: "Failed to save message";
			setError(errorMessage);
			console.error("Error saving message:", err);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setNewMessage(message);
		setIsEditing(false);
		setError(null);
	};

	if (loading) {
		return (
			<div className="hello-message">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="hello-message">
			{error && (
				<div className="error-message">
					<p>Error: {error}</p>
				</div>
			)}
			
			{!isEditing ? (
				<>
					<h2>{message || "No message set"}</h2>
					<button 
						className="edit-button"
						onClick={() => setIsEditing(true)}
						disabled={saving}
					>
						Edit Message
					</button>
				</>
			) : (
				<div className="edit-form">
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="Enter your message..."
						className="message-input"
						disabled={saving}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSaveMessage();
							} else if (e.key === "Escape") {
								handleCancel();
							}
						}}
					/>
					<div className="button-group">
						<button
							className="save-button"
							onClick={handleSaveMessage}
							disabled={saving || !newMessage.trim()}
						>
							{saving ? "Saving..." : "Save"}
						</button>
						<button
							className="cancel-button"
							onClick={handleCancel}
							disabled={saving}
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

