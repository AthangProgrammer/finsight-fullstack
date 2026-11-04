# CLAUDE.md

Expense tracker for the VESIT TE AI&DS Full Stack Development mini project. Port of FinSight (`../FinSight`, read-only reference) to the syllabus stack.

## Stack

React 18 + Vite + React Router (client, Vercel) · Node.js 20 + Express (server, Render) · Supabase Postgres via Sequelize · bcrypt + JWT in an httpOnly cookie · Groq (server-side only).

## Folder map

```
client/        React app. src/pages, src/components, src/context, src/hooks, src/lib
server/        Express API. src/routes, src/middleware, src/models, src/db, src/services
server/node-core/  Standalone Node core demos (no Express), one runnable file per topic
planning/      Proposal, implementation plan, syllabus mapping, security plan, beyond-syllabus
report-docs/   Report sections; diagrams/ holds Mermaid sources
```

## Commands

Placeholders until each phase adds them.

| Task | Command |
|---|---|
| Install | `npm ci` in `client/` and `server/` (Phase 2/6) |
| Dev server API | `npm run dev` in `server/` (Phase 2) |
| Dev client | `npm run dev` in `client/` (Phase 6) |
| Migrate / seed | `npx sequelize-cli db:migrate` / `db:seed:all` in `server/` (Phase 3) |
| Test | `npm test` in `server/` (Jest + Supertest) and `client/` (Vitest + RTL) (Phase 8) |
| Lint | `npm run lint` (Phase 8) |
| Visual diff | `npx playwright test` in `client/` (Phase 8) |
| Node core demos | `node server/node-core/<file>.js` (Phase 1) |

## Conventions

- ES modules everywhere (`"type": "module"`), `import`/`export`, no `require`.
- No comments in final code. Names carry the meaning; explanations go in planning/ or report-docs/.
- Validation (zod) on every route that reads `body`, `params` or `query`. Reject, don't coerce silently.
- No secrets in code or commits. Config comes from env via one `config` module; `.env.example` lists every key.
- Keep FinSight's look: `globals.css` class names stay; CSS Modules only where the render is unchanged.
- Never edit `../FinSight`.

## Git rules

- Never push to `main`. Work on `name/topic` branches (e.g. `athang/express-skeleton`).
- Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`.
- Merge only through a PR with one reviewer approval and green CI. Fill in the PR template.

## Security rules (full plan: planning/SECURITY.md, OWASP Top 10:2025)

- Scope every user-data query by `req.user.id`; 404 (not 403) on someone else's id.
- Sequelize model methods / bound replacements only. No string-built SQL.
- bcrypt cost 12. JWT secret from env, short expiry, cookie `httpOnly; Secure; SameSite=Lax`.
- helmet (with CSP), CORS allowlist, `x-powered-by` off, JSON body size limit, rate limits on auth and AI.
- Errors: central handler, generic messages, no stack traces outside development.
- Never log passwords, tokens, cookies or API keys. Groq key and DB credentials never reach the client.
- No `dangerouslySetInnerHTML`. No state-changing GET routes. No fetching user-supplied URLs.

## Syllabus mapping

Whenever you add a feature that covers a syllabus topic, update its row in `planning/SYLLABUS_MAPPING.md` (location, viva demo, status) and the coverage totals at the bottom.
