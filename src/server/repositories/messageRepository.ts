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
				return "Hello World from D1!";
			}

			return result.content;
		} catch (error) {
			console.error("Error fetching hello message:", error);
			throw new Error("Failed to fetch message from database");
		}
	}
}

