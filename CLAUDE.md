# CLAUDE.md

finsight-fullstack: an expense tracker for the VESIT TE AI&DS Full Stack Development mini project. It ports FinSight to the syllabus stack. The original FinSight lives at `C:\Users\Athang\OneDrive\Desktop\FSD Mini Project\FinSight` (also github.com/aneeshpardikar/FinSight). Use it as a read-only reference and never edit it.

## Stack

React 18 + Vite + React Router 7, Context API + `useReducer` (frontend, Vercel) · Node.js 22 + Express 5 (backend, Render) · Supabase Postgres via Sequelize + MongoDB Atlas via Mongoose (database) · bcryptjs + JWT in an httpOnly cookie · Groq via `fetch`, backend only. Full table: `docs/planning/TECH_STACK.md`.

## Folder map

```
frontend/          React app: src/pages, components, context, hooks, reducers, lib, styles; e2e/
backend/           Express API: src/routes, middleware, schemas, services, lib; app.js, server.js, config.js; tests/
backend/node-core/ Standalone Node core demos (no Express, no deps), one runnable file per topic
database/          @finsight/database: postgres/{models,migrations,seeders,sql}, mongo/{models}, index.js
docs/planning/     Proposal, plan, tech stack, syllabus mapping, security, beyond-syllabus
docs/report/       Report sections (on hold) and diagrams/ (Mermaid)
```

npm workspaces: `frontend`, `backend`, `database`, with one root lockfile. `backend` imports `@finsight/database`. One root `.env` is loaded with `node --env-file=../.env`.

## Commands

These are placeholders until each phase adds them. Run them from the repo root.

| Task | Command | Phase |
|---|---|---|
| Install | `npm ci` | 1 |
| Node core demo | `node backend/node-core/<file>.js` | 1 |
| API dev | `npm run dev -w backend` | 2 |
| Migrate / seed | `npm run db:migrate` / `npm run db:seed` | 3 |
| Frontend dev | `npm run dev -w frontend` | 6 |
| Both | `npm run dev` | 6 |
| Test | `npm test -w backend` (Jest + Supertest), `npm test -w frontend` (Vitest + RTL) | 8 |
| Lint | `npm run lint` | 8 |
| Visual diff | `npx playwright test` in `frontend/` | 8 |

## Conventions

- ES modules everywhere (`"type": "module"`): `import`/`export`, no `require`. Sequelize CLI config, migrations and seeders are the only `.cjs` exceptions.
- No comments in final code. Names carry the meaning; explanations go in `docs/`.
- zod validation on every route that reads `body`, `params` or `query`. Invalid input is rejected, never silently coerced.
- No secrets in code or commits. Config comes from env through `backend/src/config.js`, and `.env.example` lists every key.
- Storage code lives in `database/`; HTTP code lives in `backend/`. The frontend never imports either.
- Keep FinSight's look: `globals.css` class names stay as they are. Use CSS Modules only where the render doesn't change. The view toggles stay visual only.

## Git rules

- Never push to `main`. Work on `name/topic` branches (e.g. `aryan/sequelize-models`).
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`.
- Merge only through a PR with green CI, and fill in the PR template. No reviewer approval is required while Athang is the sole owner.

## Security rules (full plan: docs/planning/SECURITY.md, OWASP Top 10:2025)

- Scope every user-data query by `req.user.id`. Return 404 (not 403) for someone else's id.
- Use Sequelize model methods or bound replacements only; no string-built SQL. In Mongoose, `sanitizeFilter` is on and request objects never go into queries.
- bcrypt cost 12. JWT secret comes from env, with a short expiry. Cookie: `httpOnly; Secure; SameSite=Lax`.
- helmet (with CSP), CORS allowlist, `x-powered-by` off, JSON body size limit, and rate limits on auth and AI.
- Errors go through the central handler with generic messages. No stack traces outside development.
- Never log passwords, tokens, cookies or API keys. The Groq key and DB credentials never reach the frontend.
- No `dangerouslySetInnerHTML`, no state-changing GET routes, and no fetching of user-supplied URLs.

## Syllabus mapping

Whenever a feature that covers a syllabus topic is added, update its row in `docs/planning/SYLLABUS_MAPPING.md` (location, viva demo, status) and the coverage totals at the bottom.
