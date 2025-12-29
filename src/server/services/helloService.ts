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
}

