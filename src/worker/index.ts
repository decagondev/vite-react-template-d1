import { Hono } from "hono";
import helloRouter from "../server/routes/hello.js";
import type { Env } from "../server/types/env.js";

const app = new Hono<{ Bindings: Env }>();

// Mount API routes
app.route("/api", helloRouter);

// Legacy endpoint for backward compatibility
app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
