## Current Phase

- Feature 27 (TBD).

## Current Goal

- (To be defined based on the next feature).

## Completed

- Feature 01: Design System — shadcn/ui installed and configured for Tailwind v4, dark theme tokens matched in globals.css, Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea components added to components/ui/, lucide-react installed, lib/utils.ts cn() helper in place. All components import without errors; no default light styling appears.
- Feature 02: add a top navbar and a sliding project sidebar.
- Feature 03: Authentication — Clerk provider integrated, sign-in & sign-up pages with clean layout, protected routes, UserButton added to editor, proxy.ts placeholder added.
- Feature 04: Project dialogs — create, rename, delete dialogs implemented with mock project data and UI actions.
- Feature 05: Prisma foundation — Project and ProjectCollaborator models added, Prisma 7 client singleton configured for Accelerate/direct PostgreSQL connections, and initial database migration created.
- Feature 06: Implemented backend API routes for project CRUD with authentication and ownership
  checks, Prisma client used for DB operations.
- Feature 07: Wired editor home sidebar and dialogs to real project API; server component fetches owned and shared projects, passes data to client component; create/rename/delete actions navigate or refresh appropriately.
- Feature 08: Workspace shell page with access checks under `/editor/[roomId]`.
- Feature 09: Share dialog added to the workspace. Owners can invite, list, remove collaborators, and copy the project link; collaborators can view the list and remove themselves. Collaborator emails are enriched with Clerk display names and avatars when available.
- Feature 10: Liveblocks setup — typed presence and user metadata, cached Node client, and authenticated room-token endpoint implemented.
- Feature 11: Base Canvas — implemented collaborative React Flow canvas foundation with Liveblocks synchronization, shared types, and basic canvas UI (MiniMap, dot-grid).
- Feature 12: Shape Panel — Add a draggable shape toolbar to the canvas for creating new nodes.
- Feature 13: Node Shape — Implemented proper shape rendering (CSS and SVG) and add a ghost preview during drag-and-drop from the shape panel.
- Feature 14: Node Editing — Added resizing handles and inline double-click label editing for canvas nodes.
- Feature 15: Node Color Toolbar — Adding a floating toolbar to change node background and text colors.
- Feature 16: Replace the default canvas edges with custom edges that feel easier to follow, easier to click, and support inline labels.
- Feature 17: Canvas Ergonomics — Added floating control bar for zoom and undo/redo, implemented keyboard shortcuts for zoom and history, and removed the minimap.
- Feature 18: Starter Template Library — Added three predefined templates, lightweight SVG previews, navbar import entry point, and collaborative replacement imports with automatic fit view.
- Feature 19: Presence Avatars and Live Cursors — Added a canvas-only presence stack, collaborator avatar overflow handling, current-user filtering, and live cursor broadcasting with Liveblocks presence updates while keeping the shared editor/navbar unchanged.
- Feature 20: AI Sidebar Shell — Implement the floating AI chat sidebar with a tabbed layout for the AI Architect and Specs, including empty states, starter chips, and a demo spec card.
- Feature 21: Canvas Autosave — Implement canvas state persistence using Vercel Blob and Prisma, including autosave hooks and status indicators.
- Feature 22: Design Agent API — implemented backend flow for design generation using Trigger.dev, including task triggering, run tracking via Prisma TaskRun model, and run-scoped token issuance.
- Feature 23: Design Agent Logic — Implement full AI design agent logic in `trigger/design-agent.ts` using Gemini to generate architecture and update the collaborative canvas via Liveblocks.
- Feature 24: AI Presence State — Add shared AI activity indicators so everyone in the room can see when generation is in progress. This unit is only for UI, presence, and realtime status signals.
- Feature 25: Sidebar Chat Feed — Implement real-time room chat in the AI sidebar using a dedicated Liveblocks `ai-chat` feed.
- Feature 26: Design Agent Frontend — Wired up AI sidebar to submit design prompts, track real-time run status via `@trigger.dev/react-hooks`, and display status updates in a compact UI strip.

## In Progress

- None .

## Next Up

- Feature 27 (TBD).

## Open Questions

- None yet.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/\* files after shadcn installation.
- Prisma models are organized using Prisma's multi-file schema structure under prisma/models/.
- Clerk user IDs are stored directly as Project.ownerId; no local User model is introduced.

## Session Notes

- Fixed TypeScript errors in ProjectDialogs and updated sidebar behavior to keep it open while dialogs are active.
- Using Next.js 16.3.4 with React 19 and Tailwind CSS v4.
- shadcn version 4.21.0 was used; it auto-detected Tailwind v4.
- lucide-react 1.42.0 installed as a direct dependency.
- Feature 05 added the Prisma project data layer with Project and ProjectCollaborator models, Prisma client singleton, and initial migration.
- Feature 09 follow-up: Share dialog now shows the Clerk-enriched project owner before collaborators with an Owner badge.
- Feature 17 follow-up: Project sidebar now overlays the canvas, with canvas controls rendered beneath it.
- Feature 19 follow-up: Liveblocks presence is now aligned with the spec using a `thinking` field and canvas-only presence UI that excludes the current Clerk user.
