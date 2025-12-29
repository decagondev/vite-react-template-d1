/**
 * Environment types with D1 database binding
 * Following Interface Segregation Principle - small, specific interface
 */
export interface Env {
	DB: D1Database;
}

