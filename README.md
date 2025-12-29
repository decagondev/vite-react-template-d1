# React + Vite + Hono + Cloudflare Workers + D1

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/vite-react-template)

This template provides a minimal setup for building a React application with TypeScript and Vite, designed to run on Cloudflare Workers. It features hot module replacement, ESLint integration, Cloudflare D1 database integration, and the flexibility of Workers deployments.

![React + TypeScript + Vite + Cloudflare Workers](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fc7b4b62-442b-4769-641b-ad4422d74300/public)

<!-- dash-content-start -->

🚀 Supercharge your web development with this powerful stack:

- [**React**](https://react.dev/) - A modern UI library for building interactive interfaces
- [**Vite**](https://vite.dev/) - Lightning-fast build tooling and development server
- [**Hono**](https://hono.dev/) - Ultralight, modern backend framework
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - Edge computing platform for global deployment
- [**Cloudflare D1**](https://developers.cloudflare.com/d1/) - Serverless SQL database

### ✨ Key Features

- 🔥 Hot Module Replacement (HMR) for rapid development
- 📦 TypeScript support out of the box
- 🛠️ ESLint configuration included
- ⚡ Zero-config deployment to Cloudflare's global network
- 🎯 API routes with Hono's elegant routing
- 🔄 Full-stack development setup
- 🔎 Built-in Observability to monitor your Worker
- 💾 **Cloudflare D1 database integration with modular, SOLID-compliant architecture**
- 🏗️ **Clean architecture**: Repository pattern, service layer, and separation of concerns

### 🎯 Hello World D1 Application

This application demonstrates a full-stack "Hello World" implementation:
- **Frontend**: React component that fetches and displays a message from the D1 database
- **Backend**: Modular Hono API with `/api/hello` endpoint
- **Database**: D1 database storing the hello message
- **Architecture**: Follows SOLID principles with clear separation of concerns

<!-- dash-content-end -->

## Getting Started

To start a new project with this template, run:

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template
```

A live deployment of this template is available at:
[https://react-vite-template.templates.workers.dev](https://react-vite-template.templates.workers.dev)

## Development

### Prerequisites

- Node.js 18+ installed
- Cloudflare account (for D1 database)

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Create D1 Database:**

Create a D1 database using Wrangler CLI:

```bash
npx wrangler d1 create hello-world-db
```

This will output a database ID. Update `wrangler.json` with your actual database ID (replace `"local"` in the `database_id` field for production).

3. **Run Migrations Locally:**

Apply the initial migration to set up the database schema:

```bash
npx wrangler d1 execute hello-world-db --local --file=migrations/0001_initial.sql
```

4. **Start the development server:**

```bash
npm run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

The app will display "Hello World from D1!" fetched from the D1 database via the `/api/hello` endpoint.

## Production

### Build

Build your project for production:

```bash
npm run build
```

Preview your build locally:

```bash
npm run preview
```

### Database Migrations

Before deploying, apply migrations to your production D1 database:

```bash
npx wrangler d1 execute hello-world-db --file=migrations/0001_initial.sql
```

**Important**: Make sure to update `wrangler.json` with your production database ID before deploying.

### Deploy

Deploy your project to Cloudflare Workers:

```bash
npm run build && npm run deploy
```

### Monitor

Monitor your workers:

```bash
npx wrangler tail
```

## Project Structure

The project follows SOLID principles and modular design:

```
src/
├── server/              # Backend modules
│   ├── db/             # Database connection
│   ├── repositories/   # Data access layer (Repository pattern)
│   ├── services/       # Business logic layer
│   ├── routes/         # API route handlers
│   └── types/          # TypeScript type definitions
├── react-app/          # Frontend React application
│   ├── components/     # React components
│   └── ...
└── worker/             # Cloudflare Worker entry point
```

### Architecture Highlights

- **Repository Pattern**: `MessageRepository` abstracts database access
- **Service Layer**: `HelloService` contains business logic
- **Dependency Inversion**: Services depend on repository interfaces, not implementations
- **Single Responsibility**: Each module has a clear, single purpose
- **Error Handling**: Comprehensive error handling in API and frontend

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/)
- [Hono Documentation](https://hono.dev/)
