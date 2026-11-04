# Tech stack

Major versions are the target. Exact versions get pinned at install time (`save-exact=true` in `.npmrc`) and recorded in the root `package-lock.json`. Check each library's current major on npm when installing; if a newer major exists, use it unless it drops React 18 or Node 22 support.

## Repository layout (npm workspaces)

```
finsight-fullstack/
├── package.json        root: "workspaces": ["frontend", "backend", "database"], shared scripts
├── package-lock.json   one lockfile for all three
├── .env                one env file (gitignored), loaded with node --env-file
├── frontend/           @finsight/frontend  React SPA, deployed to Vercel
├── backend/            @finsight/backend   Express API, deployed to Render
│   └── node-core/      standalone syllabus demos, no dependencies
├── database/           @finsight/database  Sequelize + Mongoose: connections, models, migrations, seeders
└── docs/               planning/ and report/
```

`backend` depends on `@finsight/database` (`"@finsight/database": "*"` through workspaces). The database package owns everything about storage, and the backend owns HTTP. Neither the frontend nor node-core imports the database.

## Runtime

| Technology | Version | Purpose | Why | Syllabus | Rejected |
|---|---|---|---|---|---|
| Node.js | 22 LTS (maintenance until 2027-04-30); `engines: ">=22"` so the local Node 24 also works | Runs backend, database CLI, tooling | Supported LTS line; built-in `fetch`, `--env-file`, `--watch`, `node:test` | M4.1 | Node 20 (end of life 2026-04-30) |
| npm workspaces | npm 10+ | Monorepo with one lockfile | Built into npm; no extra tool | M4.12, M4.13 | Turborepo, pnpm, Lerna (more tooling than 3 packages need) |

## Frontend (`frontend/`)

| Technology | Version | Purpose | Why | Syllabus | Rejected |
|---|---|---|---|---|---|
| React | 18 | UI | Decided; FinSight already uses 18.3 | M3 | React 19 (keep FinSight parity) |
| Vite | current major | Dev server, build | Fast, simple config, dev proxy for `/api` | — | Next.js (syllabus asks for React Router), CRA (deprecated) |
| React Router | 7 (library mode) | Routing, protected routes | Syllabus topic; supports React 18 | M3.14 | TanStack Router |
| Context API + `useReducer` | built in | Global auth state, expense list state | Covers M3.11, M3.12 and M3.15 with no dependency; the app's global state is small | M3.11, M3.12, M3.15 | Redux Toolkit (adds a store for two pieces of state) |
| CSS (FinSight `globals.css`) | — | All existing styling | Keeps the look identical | — | Tailwind (would change markup) |
| CSS Modules | built into Vite | Styles for new pieces only (pagination numbers, edit form extras) | Syllabus topic; scoped names | M3.16 | — |
| styled-components | 6 | One component: `BudgetRing` | Syllabus topic, kept to one place | M3.17 | Emotion |
| @fontsource/dm-sans, @fontsource/manrope | current | Self-hosted fonts | Same fonts as FinSight's Google Fonts import, no outside origin, simpler CSP | — | Google Fonts CDN |

## Backend (`backend/`)

| Technology | Version | Purpose | Why | Syllabus | Rejected |
|---|---|---|---|---|---|
| Express | 5 | HTTP framework | Syllabus; v5 forwards rejected promises to the error handler | M5.1 to M5.3 | Fastify, Koa |
| helmet | 8 | Security headers + CSP | One line for a dozen headers | M5.2 | Hand-set headers |
| cors | 2 | Origin allowlist with credentials | Standard | M6.6 | — |
| cookie-parser | 1 | Read the auth cookie | Standard | M5.2 | — |
| express-rate-limit | current | Global, login, register and AI limits | Small, in-memory store is enough for one Render instance | M5.2 | Redis-backed limiter (no Redis on free tier) |
| zod | 4 | Validation of body, params, query and env | One schema gives validation and parsed types | M5.4 | express-validator, Joi |
| jsonwebtoken | 9 | Sign and verify JWT (HS256) | Syllabus, most documented | M5.8 | jose |
| bcryptjs | 3 | Password hashing, cost 12 | Pure JS, so no native build failures on Windows laptops; same bcrypt algorithm and hash format | M5.9 | `bcrypt` native (node-gyp issues), argon2 (not in syllabus) |
| pino + pino-http | current | Structured JSON logs with redaction | Fast, built-in `redact` | M5.7 | morgan (text only, no redaction) |
| Node built-in `fetch` | Node 22 | Groq calls | No SDK needed for one endpoint | M2.22 | groq-sdk |

## Database (`database/`)

| Technology | Version | Purpose | Why | Syllabus | Rejected |
|---|---|---|---|---|---|
| PostgreSQL (Supabase free tier) | Postgres 15+ (Supabase-managed) | Users, categories, expenses, budgets | Decided; relational data with constraints | M6.1 | Supabase Auth / Data API (we use only Postgres) |
| Sequelize | 6 | ORM, migrations, seeders | Syllabus | M6.2 | Prisma, Knex, Drizzle |
| pg | 8 | Postgres driver for Sequelize | Required by Sequelize | M6.1 | — |
| sequelize-cli | 6 | Run migrations and seeders | Standard with Sequelize | M6.2 | — |
| MongoDB Atlas (M0 free) | MongoDB 8 (Atlas-managed) | `chat_logs` (AI usage) and `audit_logs` (auth events) | Append-only, schemaless-ish log data fits documents; covers the NoSQL topic honestly | M6.3 | Logging these to Postgres (loses the topic) |
| Mongoose | 8 or later | ODM: schemas, validation, TTL index | Syllabus | M6.4 | Native MongoDB driver |

## AI

| Technology | Version | Purpose | Why | Syllabus | Rejected |
|---|---|---|---|---|---|
| Groq API | OpenAI-compatible chat completions | Short budgeting tips | Free tier, fast | M2.22 | OpenAI, Gemini (paid or slower) |
| Model `llama-3.1-8b-instant` (env `GROQ_MODEL`) | — | Small fast model | Lower latency and rate-limit cost than 70B | — | `llama-3.3-70b-versatile` (FinSight's) |

## Testing and quality

| Technology | Version | Purpose | Why | Syllabus | Rejected |
|---|---|---|---|---|---|
| Jest + Supertest | Jest 30, Supertest 7 | Backend API tests against `app.js` | Decided; Supertest needs no running server. ESM needs `NODE_OPTIONS=--experimental-vm-modules` | — | Mocha |
| Vitest + React Testing Library | current | Frontend unit and component tests | Shares Vite config | — | Jest on the frontend |
| Playwright | 1.x | Visual comparison of FinSight vs the new app; one end-to-end flow | Screenshot API and multiple browsers | — | Cypress |
| ESLint (flat config) + eslint-plugin-react-hooks + eslint-plugin-react | 9 or later | Lint; bans `dangerouslySetInnerHTML` | Standard | — | — |
| Prettier | 3 | Formatting | Avoids style arguments in PRs | — | — |

## DevOps and hosting

| Technology | Purpose | Notes | Syllabus |
|---|---|---|---|
| Git + GitHub | Source control, PRs, branch protection | `name/topic` branches, Conventional Commits | — |
| GitHub Actions | CI: lint, test, `npm audit` on every PR; weekly health ping | Actions pinned to SHAs | — |
| Dependabot | Dependency update PRs | npm weekly, actions monthly | — |
| Vercel (Hobby) | Hosts `frontend/` | Root directory `frontend/`; `vercel.json` rewrites `/api/*` to Render | M6.8 |
| Render (free web service) | Hosts `backend/` | `render.yaml` at the repo root, build `npm ci -w backend -w database`, start `npm start -w backend` | M6.9 |
| Supabase (free) | Postgres | Session pooler URI (IPv4), CA-verified TLS, RLS on, Data API off | M6.1 |
| MongoDB Atlas (M0) | MongoDB | Least-privilege user; IP allowlist `0.0.0.0/0` (Render has no static IP) | M6.3 |
