# Ghost AI

Ghost AI is a collaborative system-design workspace. Users create architecture diagrams on a shared canvas, work with an AI architect to generate or update diagrams, and can generate Markdown technical specifications from a project graph.

## Features

- Clerk sign-in and sign-up, with project routes protected by authentication and project access checks.
- Project creation, renaming, deletion, and sharing with email-based collaborators.
- Real-time canvas collaboration with node and edge editing, live cursors, collaborator presence, undo/redo, and autosave.
- Importable starter diagrams for microservices, CI/CD, and event-driven systems.
- Background AI architecture generation that applies node and edge updates to the shared canvas.
- Background Markdown specification generation, saved as a project artifact with an authenticated download endpoint.

The Specs tab currently contains placeholder UI; browsing and previewing saved specifications are not implemented in the client.

## Tech Stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript |
| Styling and UI | Tailwind CSS 4, shadcn/ui components, Lucide React |
| Authentication | Clerk |
| Collaborative canvas | Liveblocks, `@xyflow/react` |
| Database | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Background jobs | Trigger.dev 4 |
| AI | Vercel AI SDK with Google Gemini (`@ai-sdk/google`) |
| Artifact storage | Vercel Blob |
| Validation | Zod |

## Project Structure

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js App Router pages, layouts, sign-in/up pages, and API route handlers. |
| `app/editor/` | Project list and project workspace routes. |
| `app/api/` | Project, collaborator, canvas, Liveblocks, AI task, and spec-download endpoints. |
| `components/canvas/` | Collaborative React Flow canvas, shapes, edges, controls, cursors, and presence UI. |
| `components/editor/` | Project navigation, sharing, starter templates, editor shell, and AI sidebar. |
| `components/ui/` | Shared UI primitives. |
| `hooks/` | Canvas autosave, keyboard shortcuts, and project actions/sharing. |
| `lib/` | Prisma client, project access, shared project queries, Liveblocks setup, and utilities. |
| `prisma/` | PostgreSQL schema, model files, and checked-in migrations. |
| `trigger/` | Durable AI design and specification-generation tasks. |
| `types/` | Canvas and task contracts. |
| `context/` | Product, architecture, UI, development notes, and feature specifications. |
| `proxy.ts` | Clerk middleware configuration for application and API requests. |
| `trigger.config.ts` | Trigger.dev project, runtime, retry, and task-directory configuration. |
| `prisma7.config.ts` | Prisma CLI schema, migration, and database URL configuration. |

## Getting Started

### Prerequisites

- Node.js and npm.
- A PostgreSQL database.
- Credentials for Clerk, Liveblocks, Google AI, Trigger.dev, and Vercel Blob for the integrations you want to run.

### Install and configure

```bash
git clone <repository-url>
cd ghost-ai
npm ci
```

Create a local `.env.local` file in the repository root and set the variables listed below. Environment files are ignored by Git. Apply the checked-in database migrations, then start the web application:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The build script generates the Prisma client before building the Next.js application. Trigger.dev jobs also require the configured Trigger.dev project and worker environment; this repository does not define a Trigger.dev command in `package.json`.

## Environment Variables

Set provider credentials in `.env.local`. Do not commit this file or use production credentials in local development.

```dotenv
DATABASE_URL=
GOOGLE_AI_API_KEY=
LIVEBLOCKS_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
TRIGGER_SECRET_KEY=
BLOB_READ_WRITE_TOKEN=
```

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by Prisma and the PostgreSQL driver adapter. |
| `GOOGLE_AI_API_KEY` | Google Gemini access for the design and specification-generation tasks. |
| `LIVEBLOCKS_SECRET_KEY` | Server-side Liveblocks client used for room authorization, feeds, presence, and canvas updates. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk's client-side application configuration. |
| `CLERK_SECRET_KEY` | Clerk's server-side application configuration and user lookups. |
| `TRIGGER_SECRET_KEY` | Authentication for Trigger.dev task operations. |
| `BLOB_READ_WRITE_TOKEN` | Private Vercel Blob reads and writes for canvas snapshots and generated specifications. |

The Clerk, Trigger.dev, and Vercel Blob variables are consumed by their SDK integrations. The application code directly reads `DATABASE_URL`, `GOOGLE_AI_API_KEY`, and `LIVEBLOCKS_SECRET_KEY`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Generate the Prisma client, then build the Next.js application. |
| `npm run start` | Start the built Next.js application. Run `npm run build` first. |
| `npm run lint` | Run ESLint. |

`package-lock.json` is checked in; use npm to install dependencies.

## Architecture / How It Works

The App Router serves the project list and workspace. Clerk identifies users, while server pages and API handlers check project ownership or collaborator access. Project data and relationships are stored in PostgreSQL through Prisma. A project has one Clerk user ID as its owner; collaborators are recorded by email.

Each project workspace uses a Liveblocks room with a React Flow canvas. Liveblocks synchronizes canvas changes and presence between collaborators. Canvas snapshots are autosaved to private Vercel Blob storage at `canvas/{projectId}.json`, with the blob path stored on the project record.

AI requests are submitted through authenticated API routes and run as Trigger.dev tasks. The design task uses Google Gemini to produce canvas changes and applies them to the Liveblocks room. The specification task turns the supplied graph and chat context into Markdown, stores it in private Blob storage under `specs/{projectId}/{uuid}.md`, and records its path in PostgreSQL. `TaskRun` records associate Trigger.dev run IDs with projects and users for authorization of realtime run tokens.

## API

All routes below require a signed-in Clerk user unless otherwise stated. Project and artifact routes additionally perform project access checks.

| Method and route | Purpose and input | Response |
| --- | --- | --- |
| `GET /api/projects` | List projects owned by the current user. | `{ projects }` |
| `POST /api/projects` | Create a project; accepts optional `name` and `id`. | `{ project }` (`201`) |
| `PATCH /api/projects/{projectId}` | Rename an owned project with `{ "name": "..." }`. | `{ id, name }` |
| `DELETE /api/projects/{projectId}` | Delete an owned project. | Empty response (`204`) |
| `GET /api/projects/{projectId}/collaborators` | Get the project owner and enriched collaborator list. | `{ owner, collaborators }` |
| `POST /api/projects/{projectId}/collaborators` | Owner adds a collaborator with `{ "email": "..." }`. | `{ collaborator }` (`201`) |
| `DELETE /api/projects/{projectId}/collaborators/{collaboratorId}` | Owner removes a collaborator. | Empty response (`204`) |
| `GET /api/projects/{projectId}/canvas` | Load a saved canvas; returns empty `nodes` and `edges` when none is saved. | `{ nodes, edges }` |
| `PUT /api/projects/{projectId}/canvas` | Save `{ "nodes": [...], "edges": [...] }` for a project member. | `{ pathname }` |
| `POST /api/liveblocks-auth` | Authorize a Liveblocks room with `{ "room": "<projectId>" }`. | Liveblocks authorization response |
| `POST /api/ai/design` | Start a design task with `{ prompt, roomId, projectId }`. | `{ runId, publicToken }` |
| `POST /api/ai/design/token` | Request a run-scoped token with `{ "runId": "..." }`. | `{ token }` |
| `POST /api/ai/spec` | Start specification generation with `roomId` and optional `chatHistory`, `nodes`, and `edges`. | `{ runId }` |
| `POST /api/ai/spec/token` | Request a run-scoped token with `{ "runId": "..." }`. | `{ token }` |
| `GET /api/projects/{projectId}/specs/{specId}/download` | Download a saved Markdown specification accessible to the user. | Markdown attachment |

There is currently no API endpoint to list saved specifications or retrieve their content for an in-app preview.

## Database

The application uses PostgreSQL through Prisma 7 and the `@prisma/adapter-pg` driver adapter. Set `DATABASE_URL` before running migrations or the application. The Prisma CLI reads the schema and migration directory from `prisma7.config.ts`.

The schema contains:

- `Project`: owner ID, name, status, timestamps, and the saved canvas Blob path.
- `ProjectCollaborator`: project membership by email.
- `ProjectSpec`: generated specification metadata and its Blob path.
- `TaskRun`: Trigger.dev run ID associated with a project and user.

Apply existing migrations with `npx prisma migrate deploy --config prisma7.config.ts`. `npm run build` runs `prisma generate` before the Next.js build.

## Authentication

Clerk provides the sign-in and sign-up interfaces and user identity. The application routes unauthenticated users to `/sign-in`, and project access is checked on workspace pages and relevant API requests. Projects have a single owner; additional access is granted to collaborators whose email is recorded on the project. Liveblocks room authorization is issued only after checking project access.

## Deployment

No Docker files or platform-specific deployment configuration are present. The project provides the standard Next.js production commands: run `npm run build`, then `npm run start`. Production use also requires the configured PostgreSQL database and credentials/services listed under Environment Variables. Trigger.dev tasks use the project configuration in `trigger.config.ts` and require their separate worker setup.

## Contributing

1. Create a branch for your change.
2. Keep changes focused and follow the existing feature and architecture conventions.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Include a concise description of the change and any relevant verification results.
