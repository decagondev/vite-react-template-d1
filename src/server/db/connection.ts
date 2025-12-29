/**
 * Database connection module
 * Single Responsibility: Handle database connection and provide type-safe access
 */
import type { Env } from "../types/env.js";

/**
 * Get the D1 database instance from environment
 * @param env - Environment bindings
 * @returns D1Database instance
 */
export function getDatabase(env: Env): D1Database {
	return env.DB;
}

