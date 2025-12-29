# Complete Setup Guide: From Template to Production

This guide walks you through the complete process of setting up a new project from this template, creating a Cloudflare D1 database, and deploying to production.

## Table of Contents

1. [Creating a New Repository from Template](#1-creating-a-new-repository-from-template)
2. [Setting Up Cloudflare Project](#2-setting-up-cloudflare-project)
3. [Local Development Setup](#3-local-development-setup)
4. [Creating and Migrating Database Tables](#4-creating-and-migrating-database-tables)
5. [Deploying to Production](#5-deploying-to-production)
6. [Adding New Tables and Migrations](#6-adding-new-tables-and-migrations)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Creating a New Repository from Template

### Step 1.1: Fork or Clone the Template

**Option A: Fork on GitHub**
1. Go to the template repository on GitHub
2. Click the "Fork" button in the top right
3. Choose your account/organization
4. Name your new repository (e.g., `my-d1-app`)

**Option B: Use GitHub Template**
1. Click "Use this template" on the repository page
2. Select "Create a new repository"
3. Name your repository
4. Choose public or private
5. Click "Create repository from template"

**Option C: Clone Locally**
```bash
git clone <template-repo-url>
cd vite-react-template-d1
git remote remove origin
git remote add origin <your-new-repo-url>
git push -u origin main
```

### Step 1.2: Clone Your New Repository

```bash
git clone <your-new-repo-url>
cd <your-repo-name>
```

---

## 2. Setting Up Cloudflare Project

### Step 2.1: Create Cloudflare Account

1. Go to [cloudflare.com](https://www.cloudflare.com)
2. Sign up or log in
3. Navigate to the Workers & Pages dashboard

### Step 2.2: Create D1 Database

```bash
# Create a new D1 database
npx wrangler d1 create <your-database-name>

# Example:
npx wrangler d1 create my-app-db
```

**Output will look like:**
```
✅ Successfully created DB 'my-app-db' in region WEUR

Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "my-app-db"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Important:** Copy the `database_id` - you'll need it in the next step.

### Step 2.3: Update wrangler.json

Update `wrangler.json` with your database configuration:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-project-name",
  "main": "./src/worker/index.ts",
  "compatibility_date": "2025-10-08",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true,
  "assets": {
    "directory": "./dist/client",
    "not_found_handling": "single-page-application"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-app-db",
      "database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  ]
}
```

**Key changes:**
- Update `name` to your project name
- Update `database_name` to match your database
- Update `database_id` with the ID from Step 2.2

### Step 2.4: Authenticate Wrangler

```bash
# Login to Cloudflare
npx wrangler login

# This will open a browser window for authentication
```

---

## 3. Local Development Setup

### Step 3.1: Install Dependencies

```bash
npm install
```

### Step 3.2: Generate TypeScript Types

```bash
npm run cf-typegen
```

This generates `worker-configuration.d.ts` with proper D1 types.

### Step 3.3: Run Initial Migration Locally

```bash
# Apply the initial migration to local database
npx wrangler d1 execute <your-database-name> --local --file=migrations/0001_initial.sql

# Example:
npx wrangler d1 execute my-app-db --local --file=migrations/0001_initial.sql
```

**Expected output:**
```
🌀 Executing on local database my-app-db...
🚣 2 commands executed successfully.
```

### Step 3.4: Verify Local Database

```bash
# Check that the table was created
npx wrangler d1 execute <your-database-name> --local --command "SELECT * FROM messages"

# Example:
npx wrangler d1 execute my-app-db --local --command "SELECT * FROM messages"
```

**Expected output:**
```json
{
  "results": [
    {
      "id": 1,
      "content": "Hello World from D1!"
    }
  ],
  "success": true
}
```

### Step 3.5: Start Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

---

## 4. Creating and Migrating Database Tables

### Step 4.1: Create a New Migration File

Create a new migration file in the `migrations/` directory:

```bash
# Create a new migration file
touch migrations/0002_add_users_table.sql
```

**Naming convention:** `000X_description.sql` (sequential numbers)

### Step 4.2: Write Migration SQL

Edit `migrations/0002_add_users_table.sql`:

```sql
-- Migration: Add users table
-- Created: 2025-01-01

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### Step 4.3: Apply Migration Locally

```bash
npx wrangler d1 execute <your-database-name> --local --file=migrations/0002_add_users_table.sql

# Example:
npx wrangler d1 execute my-app-db --local --file=migrations/0002_add_users_table.sql
```

### Step 4.4: Verify Local Migration

```bash
# Check table structure
npx wrangler d1 execute <your-database-name> --local --command "PRAGMA table_info(users)"

# Check all tables
npx wrangler d1 execute <your-database-name> --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Step 4.5: Update Repository and Service (Example)

**Create `src/server/repositories/userRepository.ts`:**

```typescript
/**
 * User Repository
 * Single Responsibility: Data access layer for users
 */
import type { D1Database } from "@cloudflare/workers-types";

export interface IUserRepository {
  createUser(email: string, name: string): Promise<{ id: number; email: string; name: string }>;
  getUserById(id: number): Promise<{ id: number; email: string; name: string } | null>;
  getUserByEmail(email: string): Promise<{ id: number; email: string; name: string } | null>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly db: D1Database) {}

  async createUser(email: string, name: string) {
    const result = await this.db
      .prepare("INSERT INTO users (email, name) VALUES (?, ?) RETURNING *")
      .bind(email, name)
      .first<{ id: number; email: string; name: string }>();

    if (!result) {
      throw new Error("Failed to create user");
    }

    return result;
  }

  async getUserById(id: number) {
    return await this.db
      .prepare("SELECT id, email, name FROM users WHERE id = ?")
      .bind(id)
      .first<{ id: number; email: string; name: string } | null>();
  }

  async getUserByEmail(email: string) {
    return await this.db
      .prepare("SELECT id, email, name FROM users WHERE email = ?")
      .bind(email)
      .first<{ id: number; email: string; name: string } | null>();
  }
}
```

**Create `src/server/services/userService.ts`:**

```typescript
/**
 * User Service
 * Single Responsibility: Business logic for user operations
 */
import type { IUserRepository } from "../repositories/userRepository.js";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(email: string, name: string) {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }
    if (!name || name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }

    // Check if user already exists
    const existing = await this.userRepository.getUserByEmail(email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    return this.userRepository.createUser(email.trim(), name.trim());
  }

  async getUserById(id: number) {
    if (id <= 0) {
      throw new Error("Invalid user ID");
    }
    return this.userRepository.getUserById(id);
  }
}
```

**Create `src/server/routes/users.ts`:**

```typescript
/**
 * Users API Routes
 * Single Responsibility: Handle HTTP requests for user endpoints
 */
import { Hono } from "hono";
import type { Env } from "../types/env.js";
import { getDatabase } from "../db/connection.js";
import { UserRepository } from "../repositories/userRepository.js";
import { UserService } from "../services/userService.js";

const usersRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /api/users
 * Create a new user
 */
usersRouter.post("/users", async (c) => {
  try {
    const body = await c.req.json<{ email?: string; name?: string }>();

    if (!body.email || !body.name) {
      return c.json({ error: "Email and name are required" }, 400);
    }

    const db = getDatabase(c.env);
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);

    const user = await userService.createUser(body.email, body.name);

    return c.json(user, 201);
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";
    return c.json({ error: errorMessage }, 500);
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
usersRouter.get("/users/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));

    if (isNaN(id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const db = getDatabase(c.env);
    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);

    const user = await userService.getUserById(id);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error("Error in GET /api/users/:id:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch user";
    return c.json({ error: errorMessage }, 500);
  }
});

export default usersRouter;
```

**Update `src/worker/index.ts`:**

```typescript
import { Hono } from "hono";
import helloRouter from "../server/routes/hello.js";
import usersRouter from "../server/routes/users.js";
import type { Env } from "../server/types/env.js";

const app = new Hono<{ Bindings: Env }>();

// Mount API routes
app.route("/api", helloRouter);
app.route("/api", usersRouter);

// Legacy endpoint for backward compatibility
app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;
```

---

## 5. Deploying to Production

### Step 5.1: Apply Migrations to Production

**Important:** Always run migrations in order, starting from the first one:

```bash
# Apply initial migration
npx wrangler d1 execute <your-database-name> --remote --file=migrations/0001_initial.sql

# Apply subsequent migrations
npx wrangler d1 execute <your-database-name> --remote --file=migrations/0002_add_users_table.sql

# Example:
npx wrangler d1 execute my-app-db --remote --file=migrations/0001_initial.sql
npx wrangler d1 execute my-app-db --remote --file=migrations/0002_add_users_table.sql
```

**Expected output:**
```
🌀 Executing on remote database my-app-db...
🌀 Processed 2 queries.
🚣 Executed 2 queries in 2.83ms
```

### Step 5.2: Verify Production Database

```bash
# Check production database
npx wrangler d1 execute <your-database-name> --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

# Example:
npx wrangler d1 execute my-app-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Step 5.3: Build the Application

```bash
npm run build
```

### Step 5.4: Deploy to Cloudflare Workers

```bash
npm run deploy
```

Or:

```bash
npx wrangler deploy
```

**Expected output:**
```
Total Upload: XXX.XX KiB / gzip: XX.XX KiB
Uploaded vite-react-template-d1 (X.XX sec)
Published vite-react-template-d1 (X.XX sec)
  https://vite-react-template-d1.<your-subdomain>.workers.dev
```

### Step 5.5: Verify Deployment

```bash
# Test the API endpoint
curl https://<your-worker-url>.workers.dev/api/hello

# Expected response:
# {"message":"Hello World from D1!"}
```

---

## 6. Adding New Tables and Migrations

### Step 6.1: Migration Workflow

**Always follow this order:**

1. **Create migration file** in `migrations/` directory
2. **Test locally** with `--local` flag
3. **Verify** the migration worked
4. **Update code** (repositories, services, routes)
5. **Test locally** again
6. **Apply to production** with `--remote` flag
7. **Deploy** updated code

### Step 6.2: Complete Migration Example

**Create `migrations/0003_add_posts_table.sql`:**

```sql
-- Migration: Add posts table
-- Created: 2025-01-02

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
```

**Apply locally:**
```bash
npx wrangler d1 execute my-app-db --local --file=migrations/0003_add_posts_table.sql
```

**Verify locally:**
```bash
npx wrangler d1 execute my-app-db --local --command "PRAGMA table_info(posts)"
```

**Apply to production:**
```bash
npx wrangler d1 execute my-app-db --remote --file=migrations/0003_add_posts_table.sql
```

### Step 6.3: Migration Best Practices

1. **Always use `IF NOT EXISTS`** for tables and indexes
2. **Use transactions** for multiple related changes:
   ```sql
   BEGIN TRANSACTION;
   CREATE TABLE ...;
   CREATE INDEX ...;
   COMMIT;
   ```
3. **Add rollback scripts** for complex migrations (optional)
4. **Test migrations** on local database first
5. **Document migrations** with comments
6. **Number migrations sequentially** (0001, 0002, 0003...)

### Step 6.4: Useful Wrangler D1 Commands

```bash
# List all tables
npx wrangler d1 execute <db-name> --local --command "SELECT name FROM sqlite_master WHERE type='table'"

# View table structure
npx wrangler d1 execute <db-name> --local --command "PRAGMA table_info(<table-name>)"

# Count rows in table
npx wrangler d1 execute <db-name> --local --command "SELECT COUNT(*) as count FROM <table-name>"

# Query data
npx wrangler d1 execute <db-name> --local --command "SELECT * FROM <table-name> LIMIT 10"

# Execute multiple commands from file
npx wrangler d1 execute <db-name> --local --file=migrations/XXXX_description.sql

# Execute raw SQL command
npx wrangler d1 execute <db-name> --local --command "YOUR SQL HERE"

# For production, add --remote flag
npx wrangler d1 execute <db-name> --remote --command "YOUR SQL HERE"
```

---

## 7. Troubleshooting

### Issue: "Cannot find module '@cloudflare/workers-types'"

**Solution:**
```bash
npm install --save-dev @cloudflare/workers-types
```

### Issue: "Invalid uuid" error when deploying migrations

**Solution:**
- Ensure `wrangler.json` has only one database entry
- Verify `database_id` is a valid UUID (not "local")
- Check that you're using `--remote` flag for production

### Issue: "no such table" error

**Solution:**
```bash
# Run migrations locally first
npx wrangler d1 execute <db-name> --local --file=migrations/0001_initial.sql

# Then run subsequent migrations
npx wrangler d1 execute <db-name> --local --file=migrations/0002_<name>.sql
```

### Issue: Database binding not working

**Solution:**
1. Verify `wrangler.json` has correct database binding:
   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "your-db-name",
       "database_id": "your-db-id"
     }
   ]
   ```
2. Regenerate types:
   ```bash
   npm run cf-typegen
   ```
3. Restart dev server

### Issue: Migration fails partway through

**Solution:**
- D1 automatically rolls back failed migrations
- Check the error message
- Fix the SQL and try again
- For complex migrations, break them into smaller steps

### Issue: Local and remote databases out of sync

**Solution:**
```bash
# Check local database
npx wrangler d1 execute <db-name> --local --command "SELECT name FROM sqlite_master WHERE type='table'"

# Check remote database
npx wrangler d1 execute <db-name> --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

# Apply missing migrations to the database that's behind
```

---

## Quick Reference: Essential Commands

```bash
# Setup
npm install
npm run cf-typegen

# Database - Local
npx wrangler d1 execute <db-name> --local --file=migrations/XXXX.sql
npx wrangler d1 execute <db-name> --local --command "SELECT * FROM table"

# Database - Production
npx wrangler d1 execute <db-name> --remote --file=migrations/XXXX.sql
npx wrangler d1 execute <db-name> --remote --command "SELECT * FROM table"

# Development
npm run dev

# Build & Deploy
npm run build
npm run deploy

# Type Generation
npm run cf-typegen

# Monitoring
npx wrangler tail
```

---

## Next Steps

After completing this setup:

1. ✅ Customize your application code
2. ✅ Add more tables and migrations as needed
3. ✅ Implement authentication (if needed)
4. ✅ Add environment variables for secrets
5. ✅ Set up CI/CD pipeline
6. ✅ Configure custom domain (optional)
7. ✅ Set up monitoring and alerts

---

**Need Help?**

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

