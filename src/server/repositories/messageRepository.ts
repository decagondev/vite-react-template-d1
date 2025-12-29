/**
 * Message Repository
 * Following Dependency Inversion Principle - depends on abstraction (D1Database)
 * Single Responsibility: Data access layer for messages
 */
import type { D1Database } from "@cloudflare/workers-types";

/**
 * Repository interface for message operations
 * Interface Segregation: Small, specific interface
 */
export interface IMessageRepository {
	/**
	 * Get the hello message from the database
	 * @returns Promise resolving to the message content
	 */
	getHelloMessage(): Promise<string>;
	
	/**
	 * Create or update the hello message
	 * @param content - The message content to set
	 * @returns Promise resolving to the created/updated message content
	 */
	createOrUpdateMessage(content: string): Promise<string>;
}

/**
 * Implementation of MessageRepository using D1 database
 */
export class MessageRepository implements IMessageRepository {
	constructor(private readonly db: D1Database) {}

	async getHelloMessage(): Promise<string> {
		try {
			const result = await this.db
				.prepare("SELECT content FROM messages WHERE id = 1")
				.first<{ content: string }>();

			if (!result || !result.content) {
				// If no message exists, create a default one
				return await this.createOrUpdateMessage("Hello World from D1!");
			}

			return result.content;
		} catch (error) {
			console.error("Error fetching hello message:", error);
			// Check if it's a table not found error
			if (error instanceof Error && error.message.includes("no such table")) {
				throw new Error("Database table not found. Please run migrations.");
			}
			throw new Error("Failed to fetch message from database");
		}
	}

	async createOrUpdateMessage(content: string): Promise<string> {
		try {
			// First, try to update existing message
			const updateResult = await this.db
				.prepare("UPDATE messages SET content = ? WHERE id = 1")
				.bind(content)
				.run();

			// If no rows were updated, insert a new one
			if (updateResult.meta.changes === 0) {
				await this.db
					.prepare("INSERT OR IGNORE INTO messages (id, content) VALUES (1, ?)")
					.bind(content)
					.run();
			}

			return content;
		} catch (error) {
			console.error("Error creating/updating message:", error);
			if (error instanceof Error && error.message.includes("no such table")) {
				throw new Error("Database table not found. Please run migrations.");
			}
			throw new Error("Failed to create/update message in database");
		}
	}
}

