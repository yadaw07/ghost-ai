## Current Phase

- Feature 05

## Current Goal

- Prisma foundation — project data models, Prisma client singleton, and first database migration.

## Completed

- Feature 01: Design System — shadcn/ui installed and configured for Tailwind v4, dark theme tokens matched in globals.css, Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea components added to components/ui/, lucide-react installed, lib/utils.ts cn() helper in place. All components import without errors; no default light styling appears.
- Feature 02: add a top navbar and a sliding project sidebar.
- Feature 03: Authentication — Clerk provider integrated, sign-in & sign-up pages with clean layout, protected routes, UserButton added to editor, proxy.ts placeholder added.
- Feature 04: Project dialogs — create, rename, delete dialogs implemented with mock project data and UI actions.
- Feature 05: Prisma foundation — Project and ProjectCollaborator models added, Prisma 7 client singleton configured for Accelerate/direct PostgreSQL connections, and initial database migration created.
- Feature 06: Implemented backend API routes for project CRUD with authentication and ownership checks, Prisma client used for DB operations.
- Feature 07: Wired editor home sidebar and dialogs to real project API; server component fetches owned and shared projects, passes data to client component; create/rename/delete actions navigate or refresh appropriately.

## In Progress

- None.

## Next Up

- None.

## Open Questions

- None yet.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Prisma models are organized using Prisma's multi-file schema structure under prisma/models/.
- Clerk user IDs are stored directly as Project.ownerId; no local User model is introduced.

## Session Notes

- Fixed TypeScript errors in ProjectDialogs and updated sidebar behavior to keep it open while dialogs are active.
- Using Next.js 16.3.4 with React 19 and Tailwind CSS v4.
- shadcn version 4.21.0 was used; it auto-detected Tailwind v4.
- lucide-react 1.42.0 installed as a direct dependency.
- Feature 05 added the Prisma project data layer with Project and ProjectCollaborator models, Prisma client singleton, and initial migration.
