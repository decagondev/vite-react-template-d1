/**
 * Hello Service
 * Single Responsibility: Business logic for hello operations
 * Dependency Inversion: Depends on IMessageRepository abstraction
 */
import type { IMessageRepository } from "../repositories/messageRepository.js";

/**
 * Service for hello world operations
 */
export class HelloService {
	constructor(private readonly messageRepository: IMessageRepository) {}

	/**
	 * Get the hello message
	 * @returns Promise resolving to the hello message
	 */
	async getHelloMessage(): Promise<string> {
		return this.messageRepository.getHelloMessage();
	}

	/**
	 * Create or update the hello message
	 * @param content - The message content to set
	 * @returns Promise resolving to the created/updated message content
	 */
	async createOrUpdateMessage(content: string): Promise<string> {
		if (!content || content.trim().length === 0) {
			throw new Error("Message content cannot be empty");
		}
		return this.messageRepository.createOrUpdateMessage(content.trim());
	}
}

