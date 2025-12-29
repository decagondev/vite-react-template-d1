/**
 * Hello API Routes
 * Single Responsibility: Handle HTTP requests for hello endpoint
 */
import { Hono } from "hono";
import type { Env } from "../types/env.js";
import { getDatabase } from "../db/connection.js";
import { MessageRepository } from "../repositories/messageRepository.js";
import { HelloService } from "../services/helloService.js";

const helloRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /api/hello
 * Returns the hello message from D1 database
 */
helloRouter.get("/hello", async (c) => {
	try {
		const db = getDatabase(c.env);
		const messageRepository = new MessageRepository(db);
		const helloService = new HelloService(messageRepository);

		const message = await helloService.getHelloMessage();

		return c.json({ message });
	} catch (error) {
		console.error("Error in /api/hello:", error);
		return c.json(
			{ error: "Failed to fetch hello message" },
			500
		);
	}
});

export default helloRouter;

