# Syllabus mapping

Source: TE AI&DS (NEP) 2026-27, Full Stack Development, 6 modules, 39 hours. Each module is split into its individual topics as listed in the syllabus.

**Status values:** `Planned` (in the plan, not built) · `Done` (built and demoable) · `Gap` (not covered).
Update the row whenever a feature covering a topic lands (see `CLAUDE.md`). Paths are relative to the repo root; `nc/` = `server/node-core/`.

## Module 1: Web programming fundamentals

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M1.1 | Working of a web browser | Report §6; DevTools capture of the app loading | Network tab waterfall: DNS → TLS → HTML → JS bundle → `/api/auth/me`; explain parse, DOM, CSSOM, render, JS | 10 | Planned |
| M1.2 | HTTP | `nc/01-http-server.js`; Express routes; API table | `curl -i` a route; point at method, status line, headers, body; 200/201/400/401/404/429 in the API docs | 1, 5 | Planned |
| M1.3 | HTTPS | Production on Vercel + Render; `Secure` cookie | Padlock and certificate in the browser; cookie marked Secure in DevTools → Application | 9 | Planned |
| M1.4 | DNS | `nc/08-net-dns.js` | Run `dns.lookup` / `resolve4` on the Vercel and Render hostnames; `nslookup` for comparison | 1 | Planned |
| M1.5 | TLS | Supabase connection (`ssl.ca`, `rejectUnauthorized`), production HTTPS | `curl -vI https://<app>` shows TLS version, cipher, cert chain; show Sequelize refusing a connection without the CA | 3, 9 | Planned |
| M1.6 | XML introduction | `GET /api/export/expenses.xml` | Download the export, open in the browser, explain elements, attributes, escaping | 5 | Planned |
| M1.7 | JSON introduction | Every API body; `express.json()` | Show a request/response in DevTools; `JSON.parse` failure → 400 | 2, 5 | Planned |
| M1.8 | DOM | Client pages; `document.title`, focus handling | Elements panel: live DOM changing as an expense is added | 6 | Planned |
| M1.9 | URL | `new URL(req.url)` in `nc/01`; query params in `/api/expenses?page=…` | Break a URL into protocol, host, path, query; change `page` and see results change | 1, 5 | Planned |
| M1.10 | URI | API resource paths (`/api/expenses/42`); report §10 | Explain URI vs URL vs URN using our resource paths; `encodeURIComponent` in the search query | 1, 5 | Planned |
| M1.11 | REST API | `server/src/routes/*` | Walk the endpoint table: resources, verbs, statelessness, status codes | 5 | Planned |

## Module 2: JavaScript

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M2.1 | Language constructs | Throughout `client/src/lib/*` | Walk `lib/money.js` / `groupExpenses`: expressions, objects, arrays, spread, destructuring | 6 | Planned |
| M2.2 | Built-in objects | `Intl.NumberFormat`, `Date`, `Map`, `Math`, `JSON`, `RegExp` in `lib/` | Show `money()` with `Intl`, `months.js` with `Date` | 6 | Planned |
| M2.3 | Browser objects (BOM) | `window.confirm` on delete, `location` via router, `navigator.onLine` banner, `history` | Delete an expense → confirm dialog; go offline → banner | 6 | Planned |
| M2.4 | DOM objects | `document.title`, `document.cookie`, `document.documentElement` | Console: inspect the objects the app touches | 6 | Planned |
| M2.5 | Event handling | React `onSubmit`/`onChange`/`onClick` on every form | Add-expense form submit with `preventDefault` | 6 | Planned |
| M2.6 | Form validation | `client/src/lib/validate.js` (regex) + zod on the server | Type an invalid amount / weak password → inline message; bypass with curl → 400 | 4, 6 | Planned |
| M2.7 | Cookies | `client/src/lib/cookies.js` (UI preference); httpOnly auth cookie set by the server | Show `theme` cookie readable in console, auth cookie **not** readable (httpOnly) | 4, 6 | Planned |
| M2.8 | ES5 vs ES6 and differences | `nc/09-es5-vs-es6.js` | Run both halves; diff var/let, function/class, callbacks/promises | 1 | Planned |
| M2.9 | Variables | `let`/`const` across the codebase; ES5 contrast in `nc/09` | Hoisting and block scope demo in `nc/09` | 1, 6 | Planned |
| M2.10 | Conditions | Budget status logic (`safe`/`caution`/`set a budget`) in `Afford` | Change the purchase price across the threshold | 6 | Planned |
| M2.11 | Loops | `for…of` over `MonthRange`, `reduce` in totals | Trend chart built from a loop over months | 6 | Planned |
| M2.12 | Functions | `lib/` helpers (pure functions, default params, closures in `useDebounce`) | Explain `money`, `groupExpenses`, debounce closure | 6 | Planned |
| M2.13 | Events | `keydown` listener (`Ctrl+K` focuses search), `online`/`offline` events | Press `Ctrl+K`; toggle network | 6 | Planned |
| M2.14 | Arrow functions | Handlers and helpers throughout | Contrast `this` in arrow vs function in `nc/09` | 1, 6 | Planned |
| M2.15 | Setting CSS styles using JS | `client/src/lib/theme.js` (`style.setProperty`), dynamic `style={{ width }}` on progress bars | Toggle theme; watch the budget bar width change | 6 | Planned |
| M2.16 | DOM manipulation | `theme.js`, focus management, `document.title` | Toggle theme and inspect `<html style>` | 6 | Planned |
| M2.17 | Classes and inheritance | `client/src/lib/Expense.js`: `Expense`, `RecurringExpense extends Expense` | Afford page projects a recurring bill via `nextOccurrences()`; show `super` and override | 6 | Planned |
| M2.18 | Iterators | `MonthRange` with `[Symbol.iterator]` in `lib/months.js` | `[...new MonthRange(from, to)]` in console | 6 | Planned |
| M2.19 | Generators | `function* lastMonths(n)` in `lib/months.js` | Step through with `.next()` in console | 6 | Planned |
| M2.20 | Promise | `nc/06-callback-promise-async.js`; `Promise.all` loading summary + budget | Run `nc/06`; show the parallel load in the Network tab | 1, 6 | Planned |
| M2.21 | async/await | `useApi`, every server route handler | Walk `useApi` with try/catch/finally | 6 | Planned |
| M2.22 | Fetch | `client/src/hooks/useApi.js`; server `services/groq.js` | Network tab request with `credentials: 'include'`; `AbortController` on unmount | 6, 7 | Planned |

## Module 3: React

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M3.1 | Components | `client/src/components/*`, `pages/*` | Show the `page.js` → components split | 6 | Planned |
| M3.2 | JSX | Every component | Show JSX and the compiled `jsx()` output in Vite's dev source | 6 | Planned |
| M3.3 | Props | `Metric`, `Heading`, `Panel` | Change a prop in React DevTools | 6 | Planned |
| M3.4 | State | Forms, filters, auth mode toggle | Toggle "Create an account" | 6 | Planned |
| M3.5 | Event handling | Forms, delete, nav | Same as M2.5, React side (synthetic events) | 6 | Planned |
| M3.6 | Conditional rendering | Auth vs app, empty states, `CAUTION` vs `YOU CAN AFFORD THIS` | Empty account → empty states | 6 | Planned |
| M3.7 | Lists and keys | Transactions table, recent rows, category bars | Explain `key={expense.id}` | 6 | Planned |
| M3.8 | Forms | Auth, add/edit expense, budget, afford, insights | Controlled inputs in DevTools | 6 | Planned |
| M3.9 | useState | All pages | — | 6 | Planned |
| M3.10 | useEffect | Load summary, document title, keydown listener with cleanup | Show cleanup on route change | 6 | Planned |
| M3.11 | useContext | `client/src/context/AuthContext.jsx` | Logout from sidebar updates every consumer | 6 | Planned |
| M3.12 | useReducer | `client/src/reducers/expensesReducer.js` | Action log while adding/filtering | 6 | Planned |
| M3.13 | Custom hooks | `hooks/useApi.js`, `hooks/useDebounce.js` | Type in search; one request after 300 ms | 6 | Planned |
| M3.14 | React Router | `App.jsx` routes, `NavLink`, `ProtectedRoute`, `*` redirect | Visit `/analytics` logged out → `/login` → back after login | 6 | Planned |
| M3.15 | State management (Redux Toolkit or Context API) | Context API (or RTK slice, per question 4) | React DevTools / Redux DevTools | 6 | Planned |
| M3.16 | CSS Modules | `*.module.css` for pagination and edit modal | Show hashed class names in DOM | 6 | Planned |
| M3.17 | Styled Components | `components/BudgetRing.jsx` (styled-components, props drive the ring) | Ring changes with % used; show generated class | 6 | Planned |
| M3.18 | Memoization | `React.memo(Metric)`, `useMemo` totals, `useCallback` handlers | React Profiler: rows don't re-render on search typing | 6 | Planned |
| M3.19 | Lazy loading | `React.lazy` + `Suspense` for Analytics and Insights | Network tab: chunk loads only on first visit | 6 | Planned |

## Module 4: Node.js (6 h)

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M4.1 | Node.js runtime | `nc/` README; `process.version`, `process.env`, globals | `node -p process.versions` | 1 | Planned |
| M4.2 | Asynchronous programming | `nc/06`, all route handlers | Non-blocking read while a timer ticks | 1 | Planned |
| M4.3 | Callback concept | `nc/06` (callback version, error-first) | Run and trigger the error path | 1 | Planned |
| M4.4 | Event loop | `nc/07-event-loop.js` | Predict the order, then run | 1 | Planned |
| M4.5 | EventEmitter | `nc/02-event-emitter.js` (`BudgetMonitor`) | Add spending past 80% and 100% → events fire | 1 | Planned |
| M4.6 | Networking module | `nc/08-net-dns.js` (`net` TCP echo) | Two terminals: server and client | 1 | Planned |
| M4.7 | Buffers | `nc/04-buffers.js` | `₹` is 3 bytes; hex/base64 round trip | 1 | Planned |
| M4.8 | Streams | `nc/05-csv-stream.js`; `GET /api/export/expenses.csv` | 100k-row file with flat memory; download the CSV export | 1, 5 | Planned |
| M4.9 | File system | `nc/03-fs-path.js` | Create, read, list, stat, delete in `data/` | 1 | Planned |
| M4.10 | path | `nc/03-fs-path.js` | `join` vs `resolve`, `parse` | 1 | Planned |
| M4.11 | REPL | `nc/REPL.md` + `nc/repl.js` (models in context) | Live: `.editor`, `_`, query a model from the REPL | 1, 3 | Planned |
| M4.12 | NPM packages | `nc/npm-packages.md`; `server/package.json` deps | `npm ls`, `npm audit`, semver ranges | 1 | Planned |
| M4.13 | package.json | `nc/package.json`, `server/`, `client/` | Scripts, `type: module`, `engines` | 1 | Planned |
| M4.14 | Basic HTTP server without Express | `nc/01-http-server.js` | `curl` its routes; compare with the Express version | 1 | Planned |

## Module 5: Express (6 h)

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M5.1 | Introduction to Express | `server/src/app.js` | Contrast with `nc/01` | 2 | Planned |
| M5.2 | Middleware | helmet, cors, json, cookie-parser, rate-limit, `requireAuth`, `validate` | Explain order; remove `requireAuth` and show 401 disappears | 2, 4 | Planned |
| M5.3 | Routing | `server/src/routes/*.js` with `express.Router` | Show mount points under `/api` | 2 | Planned |
| M5.4 | RESTful API design | Resource naming, verbs, status codes, pagination envelope | API table in report §10 | 5 | Planned |
| M5.5 | CRUD operations | Expenses (incl. PATCH), budget | Create, read, update, delete live in the UI and with curl | 5 | Planned |
| M5.6 | Error handling | `middleware/errorHandler.js`, `notFound.js`, `HttpError` | Bad id → 404 JSON; forced error → 500 with no stack in prod | 2 | Planned |
| M5.7 | Logging | `pino-http` with redaction | Log line for a request; password field shows `[Redacted]` | 2 | Planned |
| M5.8 | Authentication (JWT) | `routes/auth.js`, `middleware/requireAuth.js` | Decode the token on jwt.io (from server logs in dev only); tamper → 401 | 4 | Planned |
| M5.9 | bcrypt | `routes/auth.js` (cost 12) | Show the `$2b$12$…` hash in the DB; time a hash | 4 | Planned |

## Module 6: Databases and full-stack integration (6 h)

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M6.1 | SQL (PostgreSQL) | Supabase Postgres; constraints, index, RLS migration | Supabase SQL editor: `SELECT` with a join and `GROUP BY` | 3 | Planned |
| M6.2 | Sequelize | `server/src/models/*`, migrations, seeders | `db:migrate:undo` then `db:migrate`; associations in a query | 3 | Planned |
| M6.3 | NoSQL (MongoDB) | **Depends on question 3.** If yes: MongoDB Atlas M0 for AI chat logs + auth audit log | Atlas collection view after asking an insight | 3 | Gap* |
| M6.4 | Mongoose | **Depends on question 3.** If yes: `server/src/db/mongo.js`, `ChatLog`/`AuditLog` schemas | Schema validation rejecting a bad doc | 3 | Gap* |
| M6.5 | Connecting React frontend to Express backend | `useApi` + Vite proxy (dev) + Vercel rewrite (prod) | Add an expense and follow it UI → API → DB | 6, 9 | Planned |
| M6.6 | CORS | `cors` allowlist with credentials | Request from a non-allowed origin fails in the console | 2 | Planned |
| M6.7 | Environment variables | `server/src/config.js` (zod-validated), `.env.example`, host dashboards | Remove `JWT_SECRET` → server refuses to start | 2 | Planned |
| M6.8 | Deployment: Vercel | `client/vercel.json` | Live URL; rewrite rule | 9 | Planned |
| M6.9 | Deployment: Render | `render.yaml` | Render dashboard, logs, health check | 9 | Planned |

\* M6.3/M6.4 become `Planned` if the team chooses the MongoDB option.

## Coverage

Coverage = topics with status `Planned` or `Done` ÷ total topics. "Done" counts only built and demoable topics.

| Module | Topics | Planned + Done | Planned coverage | Done | If MongoDB is added |
|---|---|---|---|---|---|
| M1 Web fundamentals | 11 | 11 | 100% | 0% | 100% |
| M2 JavaScript | 22 | 22 | 100% | 0% | 100% |
| M3 React | 19 | 19 | 100% | 0% | 100% |
| M4 Node.js | 14 | 14 | 100% | 0% | 100% |
| M5 Express | 9 | 9 | 100% | 0% | 100% |
| M6 Databases & integration | 9 | 7 | 77.8% | 0% | 100% |
| **Overall** | **84** | **82** | **97.6%** | **0%** | **100%** |

Target: ≥ 90% of topics. Met at planning time without MongoDB.

**Honest notes for the viva:**
- M1.1, M1.3, M1.5 are demonstrated through tooling (DevTools, curl, certificates), not app features. That is the right way to show them.
- M2.8 and M4.11 live in standalone demo files, not the running app.
- M1.6 (XML) and M3.17 (Styled Components) are small, deliberate demos inside the app: one export endpoint and one component.
