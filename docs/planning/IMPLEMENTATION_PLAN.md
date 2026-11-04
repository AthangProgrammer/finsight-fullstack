# Implementation plan

Estimates are in evenings (about 3 focused hours) for one person. Topic codes (M1.3 etc.) refer to rows in `SYLLABUS_MAPPING.md`. Once Phase 2 lands, Phases 1, 3 and the UI half of 6 can run in parallel because they live in different workspaces.

**Owners are a proposal.** Swap them freely, but keep one owner per phase so someone is accountable. Every PR needs a reviewer who isn't its author.

| Phase | Name | Workspace(s) | Evenings | Depends on | Proposed owner | Reviewer |
|---|---|---|---|---|---|---|
| 0 | Setup | root, docs | 1 | — | Athang | team |
| 1 | Node core + workspace root | root, `backend/node-core` | 2 | 0 | Om | Athang |
| 2 | Express skeleton | `backend` | 1 | 1 (root package.json) | Athang | Aryan |
| 3 | Database (Postgres + Mongo) | `database` | 3 | 1 | Aryan | Athang |
| 4 | Auth | `backend`, `database` | 2 | 2, 3 | Om | Aryan |
| 5 | REST API | `backend` | 2 | 4 | Aryan | Om |
| 6 | Frontend port | `frontend` | 4 | 2 (UI), 5 (wiring) | Aneesh | Athang |
| 7 | AI insights | `backend`, `database` | 1 | 5 | Om | Aneesh |
| 8 | Hardening + tests | all | 3 | 5, 6, 7 | Athang (backend) + Aneesh (frontend, Playwright) | cross |
| 9 | Deployment + CI | root, hosts | 2 | 8 | Athang | Aryan |
| 10 | Report + demo | `docs/report` | 2 | 9 | **on hold**, all | — |
| | **Total** | | **23** | | Athang 5.5 · Aneesh 5.5 · Aryan 5 · Om 5 (excluding Phase 10) | |

---

## Phase 0: Setup ✅

**Goal:** an agreed plan and a structured, documented repo.
**Tasks:** read FinSight and the syllabus; scaffold `frontend/`, `backend/` (with `node-core/`), `database/` and `docs/`; write `.gitignore`, `.gitattributes`, `.env.example`, `CLAUDE.md`, `README.md` and the PR template; write the planning docs (including `TECH_STACK.md`) and the report skeleton; initialise git.
**Done when:** the team has approved the plan. ✅

## Phase 1: Node core + workspace root

**Goal:** the npm workspace root, plus a standalone `backend/node-core/` folder. Each demo file runs with `node <file>` and prints something a viva examiner can follow.

**Tasks:**
- Root `package.json`:
  - `"private": true`, `"workspaces": ["frontend", "backend", "database"]`, `"engines": { "node": ">=22" }`
  - scripts that forward to workspaces (`dev`, `test`, `lint`, `db:migrate`, `db:seed`)
- `.npmrc` with `save-exact=true` and `engine-strict=true`.
- Minimal `package.json` in each of `frontend`, `backend` and `database` (`name`, `private`, `"type": "module"`), so `npm ci` works from the start.
- `backend/node-core/`: its own `package.json` (`"type": "module"`, `demo:*` scripts, no dependencies) and these files:
  - `01-http-server.js`: a plain `http.createServer` that routes on `req.method` + `new URL(req.url)` and returns JSON, 404s and the right status codes.
  - `02-event-emitter.js`: `BudgetMonitor extends EventEmitter`, emitting `threshold` and `exceeded`; shows `on`, `once` and `off`.
  - `03-fs-path.js`: `path.join/resolve/parse/extname`, and `fs/promises` read/write/mkdir/readdir/stat on a `data/` folder.
  - `04-buffers.js`: `Buffer.from`, utf8/hex/base64 encodings, `₹` as 3 bytes, `Buffer.concat`, `byteLength` vs `length`.
  - `05-csv-stream.js`: `createReadStream` → a custom `Transform` (CSV → object → filter → CSV) → `createWriteStream` via `stream/promises.pipeline`, run on a generated 100k-row file to show constant memory.
  - `06-callback-promise-async.js`: the same "read and total the expenses file" written three ways, plus `util.promisify` and error handling in each.
  - `07-event-loop.js`: the ordering of sync code, `process.nextTick`, microtasks, `setTimeout(0)`, `setImmediate` and I/O callbacks (predict, then run).
  - `08-net-dns.js`: a `net` TCP echo server and client, plus `dns.lookup`/`resolve4` on the deployed hostnames.
  - `09-es5-vs-es6.js`: the same `Expense` logic in ES5 (var, constructor function, prototype, callbacks) and in ES6+ (let/const, class, arrow functions, destructuring, template literals).
  - `REPL.md`: a recorded REPL session (`.help`, `.editor`, `_`, `.save`, `.load`, importing a module, inspecting a `Buffer`), plus `repl.js`, which starts a custom REPL with the `@finsight/database` models in context (completed after Phase 3).
  - `npm-packages.md`: `npm init`, semver, `dependencies` vs `devDependencies`, `npm ci` vs `npm install`, lockfiles, workspaces, `npx`, `npm audit`.

**Syllabus:** M1.2, M1.4, M1.9, M1.10, M2.8, M2.9, M2.14, M4.1 to M4.14.
**Done when:** `npm ci` works at the root; every node-core file runs on a clean checkout; each one has its row filled in `SYLLABUS_MAPPING.md`.
**Estimate:** 2.

## Phase 2: Express skeleton

**Goal:** a running API with the full middleware stack and nothing app-specific yet.

**Tasks:**
- `backend/package.json`:
  - scripts `dev` (`node --env-file=../.env --watch src/server.js`) and `start`
  - dependencies: `express@5`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `zod`, `pino`, `pino-http`
- `src/app.js` builds the app and exports it for Supertest; `src/server.js` listens and handles `SIGTERM`; `src/config.js` validates env with zod and fails fast.
- Middleware, in this order:
  1. `app.disable('x-powered-by')`
  2. `trust proxy` (Vercel → Render hops)
  3. `helmet` with a CSP
  4. `cors` with an allowlist from `CORS_ORIGINS` and `credentials: true`
  5. `express.json({ limit: '10kb' })`
  6. `cookie-parser`
  7. `pino-http`, redacting the cookie and authorization headers and `*.password`
  8. a global `express-rate-limit`
- Routers under `/api`: `health`, plus empty `auth`, `expenses`, `budget`, `categories`, `summary`, `insights` and `export`.
- `GET /healthz` (process is up). `?db=1` gets wired in Phase 3.
- `notFound` returns a JSON 404. The central `errorHandler` maps:
  - zod errors → 400
  - `HttpError` → its status
  - anything else → 500 with a request id, and a stack only in development

**Syllabus:** M5.1, M5.2, M5.3, M5.6, M5.7, M6.6, M6.7.
**Done when:**
- `curl localhost:4000/healthz` returns 200.
- An unknown route returns a JSON 404.
- A thrown error returns a JSON 500 with no stack when `NODE_ENV=production`.
- `curl -I` shows the helmet headers and no `X-Powered-By`.

**Estimate:** 1.

## Phase 3: Database (Postgres + MongoDB)

**Goal:** the `@finsight/database` package owns both databases. The backend only imports it.

**Tasks, Postgres (Sequelize):**
- Supabase project in the Mumbai region; session pooler URI and CA cert go in `.env`.
- `database/postgres/index.js`: a Sequelize instance with `dialectOptions.ssl = { require: true, rejectUnauthorized: true, ca }`, `pool.max: 5`, and logging at debug.
- `database/.sequelizerc` pointing at `postgres/{config.cjs,models,migrations,seeders}`. CLI scripts are `db:migrate`, `db:migrate:undo` and `db:seed`, each run with `--env-file=../.env`.
- Migrations:
  - `users`
  - `categories`
  - `expenses`: FKs to user and category; `amount NUMERIC(12,2) CHECK (amount > 0 AND amount <= 10000000)`; `spent_on DATE`; index on `(user_id, spent_on)`
  - `budgets`: unique `user_id`; `CHECK (monthly_amount >= 0)`
- An RLS migration (`postgres/sql/rls.sql`, applied by a migration) that, for every table:
  - runs `ENABLE ROW LEVEL SECURITY` with no policies
  - runs `REVOKE ALL … FROM anon, authenticated`
  - sets `ALTER DEFAULT PRIVILEGES … REVOKE`
- Models and associations: `User.hasMany(Expense)`, `Expense.belongsTo(Category)`, `User.hasOne(Budget)`. Add model validations, and a `defaultScope` that excludes `password_hash`.
- Seeders: the 7 categories, and a demo user with about 60 expenses over 6 months.

**Tasks, MongoDB (Mongoose):**
- Atlas M0 cluster; app user `finsight_app` with `readWrite` on `finsight` only.
- `database/mongo/index.js`: `connectMongo()` with `mongoose.set('strictQuery', true)` and `mongoose.set('sanitizeFilter', true)`, plus `serverSelectionTimeoutMS: 5000`.
- `mongo/models/ChatLog.js`: `userId`, `questionChars`, `latencyMs`, `source` (enum), `model`, `createdAt`. Indexed on `userId` and `createdAt`.
- `mongo/models/AuditLog.js`: `event` (enum: register, login.success, login.failure, login.locked, logout), `userId`, `ip`, `userAgent`, `createdAt` with a TTL index of 90 days.
- `database/index.js` exports `{ sequelize, models, connectMongo, ChatLog, AuditLog }`.
- `/healthz?db=1` runs `SELECT 1` plus a Mongo `ping`.

**Syllabus:** M6.1, M6.2, M6.3, M6.4, M6.7, M4.11 (finishing `repl.js`).
**Done when:**
- `db:migrate` and `db:migrate:undo:all` both run clean against Supabase.
- Supabase's Security Advisor shows no RLS warnings, and a request with the anon key is denied.
- A `ChatLog` with a bad `source` fails validation.
- The audit TTL index is visible in Atlas.

**Estimate:** 3.

## Phase 4: Auth

**Goal:** our own auth, using bcrypt and a JWT in a cookie.

**Tasks:**
- zod schemas:
  - username: `^[a-zA-Z0-9_]{3,30}$`
  - password: 10 to 72 characters, with at least one letter and one digit
- `POST /api/auth/register` hashes with `bcryptjs` at cost 12 and returns 201. A duplicate username returns 409 with a generic message.
- `POST /api/auth/login`:
  - Compare against a dummy hash when the username doesn't exist, so timing is similar either way.
  - On failure, return the generic "Invalid username or password."
  - On success, sign `{ sub, tv }` with HS256 for 30 minutes and set the cookie with `httpOnly`, `secure`, `sameSite: 'lax'` and `path: '/'`.
- Lockout: after 5 failures, lock for 1, 2, 4… minutes (capped at 30). Add an `express-rate-limit` per IP on login and register.
- `requireAuth`:
  - Verify the token with `algorithms: ['HS256']`.
  - Load the user and check `token_version`.
  - Set `req.user`.
  - Re-issue the token when under 10 minutes remain.
- `POST /api/auth/logout` clears the cookie and bumps `token_version`. `GET /api/auth/me` returns the current user.
- Write auth events to `AuditLog` (fire-and-forget) and to pino. Never record the password.

**Syllabus:** M5.8, M5.9, M2.6 (server side), M2.7 (httpOnly cookie), M6.4.
**Done when:** Supertest covers register, login, logout and me, plus a wrong password, lockout after 5 failures, an expired token, a tampered token, and a token reused after logout.
**Estimate:** 2.

## Phase 5: REST API

**Goal:** the complete resource API the frontend needs.

**Tasks:**
- `GET /api/categories`.
- `GET /api/expenses?page=&limit=&q=&categoryId=&from=&to=&sort=` returns `{ items, page, limit, total }`. `limit` is capped at 50. `q` uses `Op.iLike` with `%` and `_` escaped.
- `POST /api/expenses`, plus `GET`, `PATCH` and `DELETE` on `/api/expenses/:id`. Every lookup uses `{ id, userId: req.user.id }`; anything else returns 404.
- `GET /api/budget` and `PUT /api/budget` (upsert).
- `GET /api/summary?month=YYYY-MM` returns the month's totals, totals by category and a last-6-months series.
- `GET /api/export/expenses.csv` streams a Sequelize query through a `Transform` with `Content-Disposition: attachment`. It guards against CSV injection and is capped at 10k rows.
- `GET /api/export/expenses.xml` returns the same data as escaped XML.

**Syllabus:** M1.2, M1.6, M1.7, M1.9, M1.10, M1.11, M4.8, M5.4, M5.5.
**Done when:** Supertest covers every route, including:
- another user's id → 404
- an invalid body → 400
- `limit=1000` → capped at 50
- CSV and XML exports that parse

**Estimate:** 2.

## Phase 6: Frontend port

**Goal:** the FinSight UI, pixel for pixel, as a routed React app running on the new API.

**Tasks:**
1. **Capture a baseline first.** Run FinSight locally with the same seeded demo data and take Playwright screenshots of every page at 1440×900 and 390×844, saved to `frontend/e2e/baseline/`.
2. **Scaffold** `frontend/` with React 18, Vite and React Router 7. `vite.config.js` proxies `/api` to `localhost:4000`.
3. **Styles:** copy FinSight's `app/globals.css` to `frontend/src/styles/globals.css` unchanged, except the Google Fonts `@import`, which is replaced by `@fontsource/dm-sans` and `@fontsource/manrope` imports in `main.jsx` (same weights: 400/500/600/700 and 600/700/800).
4. **Split `page.js` without changing its markup:**
   - `components/`: `Panel`, `Empty`, `Metric`, `Heading`, `Sidebar`, `Topbar`, `ProtectedRoute`, `BudgetRing` (styled-components)
   - `pages/`: `Dashboard`, `Transactions`, `Analytics`, `Insights`, `Afford`, `Auth`
   - Routes: `/login`, `/register`, `/`, `/transactions`, `/analytics`, `/insights`, `/afford`, and `*` redirecting. Sidebar buttons become `NavLink`s and keep the `active` class.
5. **State and hooks (Context API):**
   - `context/AuthContext.jsx` (`useContext`) and `ProtectedRoute`.
   - `reducers/expensesReducer.js` + `useReducer`, handling `loaded`, `added`, `updated`, `removed`, `filterChanged` and `pageChanged`.
   - `hooks/useApi.js`: `fetch` with `credentials: 'include'`, an `AbortController` on unmount, and logout on a 401.
   - `hooks/useDebounce.js` for search.
6. **Styling and performance:**
   - CSS Modules only for new pieces, and only where the render stays the same.
   - `BudgetRing` is the single styled component.
   - `React.memo`, `useMemo` and `useCallback` where they help.
   - `React.lazy` + `Suspense` for Analytics and Insights.
7. **Module 2 items** live in `frontend/src/lib/` and are each used by a page:
   - `validate.js`: regex validators
   - `cookies.js`: a UI-preference cookie
   - `Expense.js`: `Expense` and `RecurringExpense extends Expense`, used by Afford
   - `months.js`: the `lastMonths` generator and the `MonthRange` iterator, used by the trend chart
   - `theme.js`: `style.setProperty`; the default theme is identical to FinSight's
   - Browser objects: `window.confirm` on delete, `document.title` per route, `Ctrl+K` to focus search, an `online`/`offline` banner
8. **Make the fake parts real** (PROPOSAL §6) without changing their markup, and add edit (PATCH) reusing the add form's markup. The view toggles, chart tabs and "•••" stay visual only.
9. **Rename** "Stockflow" strings to FinSight.

**Syllabus:** all of M3; M2.1 to M2.7, M2.10 to M2.22; M1.8; M6.5.
**Done when:** every route works against the API, and the Playwright screenshots of both apps match per route at both viewports (diff under an agreed threshold, differences reviewed by eye).
**Estimate:** 4.

## Phase 7: AI insights (simple)

**Goal:** one safe, small AI feature.

**Tasks:**
- `backend/src/services/groq.js`:
  - Use `fetch` against the constant URL `https://api.groq.com/openai/v1/chat/completions`.
  - Set `AbortSignal.timeout(8000)`, model from `GROQ_MODEL`, `max_tokens` around 300 and `temperature` 0.3.
- `POST /api/insights` takes `{ question }`, validated with zod to 1 to 300 characters with control characters stripped.
- The backend builds the context itself: this month's budget and total, the top 4 categories, and the days left in the month. It never sends descriptions, usernames or ids.
- The system prompt:
  - makes the model a budgeting assistant for this app only
  - treats the user's message as a question, never as instructions
  - refuses to reveal or change these rules
  - gives no investment, legal or tax advice
  - asks for at most 5 short bullets in ₹
- A per-user rate limit (10 per hour), keyed on `req.user.id`.
- If Groq times out or returns 429 or 5xx, respond 200 with a locally computed tip and `source: 'fallback'`.
- Write a `ChatLog` document (question length, latency, source, model), never the question text.

**Syllabus:** M2.20, M2.21, M2.22, M5.4, M6.4.
**Done when:** Supertest, with Groq mocked, covers success, timeout → fallback, 429 → fallback, input that's too long → 400, and the rate limit → 429. A manual prompt-injection attempt is refused.
**Estimate:** 1.

## Phase 8: Security hardening and tests

**Goal:** prove the security plan and the core paths work.

**Tasks:**
- Go through `SECURITY.md` row by row, and record the test or screenshot that proves each control.
- `npm audit --audit-level=high` comes back clean at the root, which covers all workspaces.
- Backend: Jest + Supertest (with `NODE_OPTIONS=--experimental-vm-modules`) against a test Postgres (a second Supabase project or local Docker) and a test Mongo database (`finsight_test` on Atlas, or `mongodb-memory-server`).
- Frontend: Vitest + React Testing Library for `validate.js`, `months.js`, `Expense.js`, `expensesReducer`, `ProtectedRoute` and the add-expense form.
- Playwright: visual comparison against the Phase 6 baseline, plus one end-to-end flow (login → add expense → see it on the dashboard).
- ESLint (flat config) at the root, with react-hooks and `react/no-danger`.

**Done when:** all tests are green, line coverage of `backend/src` is at least 70%, and every SECURITY.md row has evidence.
**Estimate:** 3.

## Phase 9: Deployment

**Goal:** a live app on free tiers, with CI gating every PR.

**Tasks:**
- Supabase: run the production migrations and only the category seeder; disable the Data API.
- Atlas: confirm the production user, network access and TTL index.
- `render.yaml` at the repo root:
  - web service built with `npm ci -w backend -w database` and started with `npm start -w backend`
  - `healthCheckPath: /healthz`, Node 22
  - secret env vars set with `sync: false`
- `frontend/vercel.json`:
  - rewrite `/api/:path*` to Render
  - fall back to `/index.html` for SPA routes
  - security headers (CSP with `default-src 'self'`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
- On Vercel, set the root directory to `frontend/`. Set `CORS_ORIGINS` to the Vercel URL.
- `.github/workflows/ci.yml` runs on every PR: `npm ci`, lint, then tests per workspace, then `npm audit --audit-level=high`. Actions are pinned by SHA.
- `.github/dependabot.yml`.
- A weekly workflow that hits `/healthz?db=1`.
- Branch protection on `main`: a PR, one approval and passing CI are all required.

**Syllabus:** M6.5 to M6.9, M1.3, M1.5.
**Done when:** the production URL works end to end; `curl -vI` shows TLS and the security headers; and a PR with a failing test is blocked from merging.
**Estimate:** 2.

## Phase 10: Report and demo (on hold)

On hold at the team's request. `docs/report/` keeps its section skeletons and diagrams up to date with design changes, so writing can start whenever the team resumes it. The demo script and viva cheat sheet (a walk through `SYLLABUS_MAPPING.md`) are produced here too.
**Estimate:** 2.
