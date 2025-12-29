# Hello World D1 - Full-Stack Cloudflare Application

A production-ready "Hello World" application demonstrating a full-stack setup with React, Vite, Hono, Cloudflare Workers, and Cloudflare D1 database. Built with SOLID principles and clean architecture.

![Tech Stack](https://img.shields.io/badge/React-19.2.1-blue) ![Vite](https://img.shields.io/badge/Vite-6.0-646CFF) ![Hono](https://img.shields.io/badge/Hono-4.11.1-FF6B6B) ![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20D1-F6821F)

## 🎯 What This Application Does

This application demonstrates a complete full-stack integration:
- **Frontend**: React component fetches and displays a message from the D1 database
- **Backend**: Hono API endpoint (`/api/hello`) queries the D1 database
- **Database**: Cloudflare D1 stores the "Hello World" message
- **Architecture**: Clean, modular code following SOLID principles

## ✨ Features

- 🔥 **Hot Module Replacement (HMR)** for rapid development
- 📦 **TypeScript** support throughout
- 🏗️ **SOLID Architecture** with Repository pattern and Service layer
- 💾 **Cloudflare D1** database integration
- ⚡ **Edge Deployment** on Cloudflare Workers
- 🎨 **Modern UI** with gradient design and smooth animations
- 🛡️ **Error Handling** in both frontend and backend
- 📝 **Type Safety** with full TypeScript coverage

## 🚀 Quick Start

> 📖 **New to this template?** Check out the [Complete Setup Guide](./docs/setup.md) for detailed step-by-step instructions on creating a new repository, setting up Cloudflare, and deploying to production.

### Prerequisites

- **Node.js** 18+ installed
- **Cloudflare account** (free tier works)
- **Wrangler CLI** (included in dependencies)

### Installation

1. **Clone and install dependencies:**

```bash
git clone <your-repo-url>
cd vite-react-template-d1
npm install
```

2. **Create D1 Database:**

```bash
npx wrangler d1 create hello-world-db
```

This will output a database ID. Copy it and update `wrangler.json`:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "hello-world-db",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

3. **Run Database Migrations:**

**Local development:**
```bash
npx wrangler d1 execute hello-world-db --local --file=migrations/0001_initial.sql
```

**Production:**
```bash
npx wrangler d1 execute hello-world-db --remote --file=migrations/0001_initial.sql
```

4. **Start Development Server:**

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your app!

## 📁 Project Structure

```
vite-react-template-d1/
├── src/
│   ├── server/                 # Backend modules (SOLID architecture)
│   │   ├── db/
│   │   │   └── connection.ts  # Database connection abstraction
│   │   ├── repositories/
│   │   │   └── messageRepository.ts  # Data access layer (Repository pattern)
│   │   ├── services/
│   │   │   └── helloService.ts       # Business logic layer
│   │   ├── routes/
│   │   │   └── hello.ts              # API route handlers
│   │   └── types/
│   │       └── env.ts                # TypeScript type definitions
│   ├── react-app/              # Frontend React application
│   │   ├── components/
│   │   │   └── HelloMessage.tsx      # Hello message component
│   │   ├── App.tsx                   # Main application component
│   │   └── App.css                    # Application styles
│   └── worker/
│       └── index.ts                  # Cloudflare Worker entry point
├── migrations/
│   └── 0001_initial.sql              # Database schema migration
├── wrangler.json                      # Cloudflare Workers configuration
└── package.json
```

## 🏗️ Architecture

This application follows **SOLID principles**:

### Single Responsibility Principle
- Each module has one clear purpose
- `MessageRepository` handles only data access
- `HelloService` contains only business logic
- Routes handle only HTTP concerns

### Dependency Inversion Principle
- Services depend on repository **interfaces**, not implementations
- `HelloService` uses `IMessageRepository` interface
- Easy to swap implementations or add testing mocks

### Repository Pattern
```typescript
// Interface (abstraction)
interface IMessageRepository {
  getHelloMessage(): Promise<string>;
}

// Implementation
class MessageRepository implements IMessageRepository {
  // D1 database implementation
}
```

### Service Layer
```typescript
class HelloService {
  constructor(private readonly messageRepository: IMessageRepository) {}
  // Business logic here
}
```

## 🔌 API Endpoints

### `GET /api/hello`

Returns the hello message from the D1 database.

**Response:**
```json
{
  "message": "Hello World from D1!"
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch hello message"
}
```

## 💾 Database Schema

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL DEFAULT 'Hello World from D1!'
);
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Cloudflare Workers
npm run deploy

# Generate Cloudflare types
npm run cf-typegen

# Run type checking
npm run check

# Lint code
npm run lint
```

### Database Operations

**Query local database:**
```bash
npx wrangler d1 execute hello-world-db --local --command "SELECT * FROM messages"
```

**Query production database:**
```bash
npx wrangler d1 execute hello-world-db --remote --command "SELECT * FROM messages"
```

**Monitor Worker logs:**
```bash
npx wrangler tail
```

## 🚀 Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Apply Production Migrations

Make sure your `wrangler.json` has the correct production database ID, then:

```bash
npx wrangler d1 execute hello-world-db --remote --file=migrations/0001_initial.sql
```

### 3. Deploy to Cloudflare Workers

```bash
npm run deploy
```

Your application will be live at: `https://vite-react-template-d1.<your-subdomain>.workers.dev`

## 🧪 Testing the Application

### Test the API Endpoint

```bash
# Local
curl http://localhost:5173/api/hello

# Production (after deployment)
curl https://your-worker.workers.dev/api/hello
```

### Expected Response

```json
{
  "message": "Hello World from D1!"
}
```

## 📝 Configuration

### `wrangler.json`

Key configuration for Cloudflare Workers:

```json
{
  "name": "vite-react-template-d1",
  "main": "./src/worker/index.ts",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "hello-world-db",
      "database_id": "your-database-id"
    }
  ]
}
```

### Environment Variables

No environment variables required for basic setup. The D1 database is bound via `wrangler.json`.

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: "Failed to fetch hello message"

**Solutions**:
1. Verify database ID in `wrangler.json` matches your D1 database
2. Ensure migrations have been run: `npx wrangler d1 execute hello-world-db --local --file=migrations/0001_initial.sql`
3. Check that the database binding name matches (`DB`)

### Migration Errors

**Problem**: "Invalid uuid" error when deploying

**Solution**: Make sure `wrangler.json` has only one database entry with a valid UUID (not "local")

### Build Errors

**Problem**: TypeScript compilation errors

**Solution**: Regenerate Cloudflare types:
```bash
npm run cf-typegen
```

## 📚 Learn More

### Documentation

- 📖 [Complete Setup Guide](./docs/setup.md) - Step-by-step guide from template to production deployment
- 📋 [Product Requirements Document](./docs/PRD.md) - Detailed requirements and implementation status

### External Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Hono Documentation](https://hono.dev/)

## 🎓 Key Concepts Demonstrated

1. **Full-Stack Integration**: React frontend + Hono backend + D1 database
2. **SOLID Principles**: Clean architecture with separation of concerns
3. **Repository Pattern**: Abstraction layer for data access
4. **Type Safety**: Full TypeScript coverage
5. **Error Handling**: Comprehensive error handling patterns
6. **Edge Computing**: Deployment on Cloudflare's global network

## 📄 License

This project is based on the Cloudflare Vite React template.

## 🤝 Contributing

This is a demonstration project. Feel free to fork and extend it for your own use!

---

**Built with ❤️ using React, Vite, Hono, and Cloudflare Workers**
