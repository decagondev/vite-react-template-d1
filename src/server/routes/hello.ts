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
		const errorMessage = error instanceof Error 
			? error.message 
			: "Failed to fetch hello message";
		return c.json(
			{ error: errorMessage },
			500
		);
	}
});

/**
 * POST /api/hello
 * Creates or updates the hello message in D1 database
 * Body: { "content": "Your message here" }
 */
helloRouter.post("/hello", async (c) => {
	try {
		const body = await c.req.json<{ content?: string }>();
		
		if (!body.content) {
			return c.json(
				{ error: "Content is required" },
				400
			);
		}

		const db = getDatabase(c.env);
		const messageRepository = new MessageRepository(db);
		const helloService = new HelloService(messageRepository);

		const message = await helloService.createOrUpdateMessage(body.content);

		return c.json({ message }, 200);
	} catch (error) {
		console.error("Error in POST /api/hello:", error);
		const errorMessage = error instanceof Error 
			? error.message 
			: "Failed to create/update hello message";
		return c.json(
			{ error: errorMessage },
			500
		);
	}
});

export default helloRouter;

