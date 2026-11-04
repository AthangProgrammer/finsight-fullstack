# Syllabus mapping

Source: TE AI&DS (NEP) 2026-27, Full Stack Development: 6 modules, 39 hours. Each module is split into its individual topics as the syllabus lists them.

**Status values:**
- `Planned`: in the plan, not built yet.
- `Done`: built and demoable.
- `Gap`: not covered.

Update a topic's row whenever a feature covering it lands (see `CLAUDE.md`).

**Path prefixes:**

| Prefix | Folder |
|---|---|
| `FE/` | `frontend/src/` |
| `BE/` | `backend/src/` |
| `NC/` | `backend/node-core/` |
| `PG/` | `database/postgres/` |
| `MG/` | `database/mongo/` |

## Module 1: Web programming fundamentals

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M1.1 | Working of a web browser | Report §6; DevTools capture of the app loading | Network tab waterfall: DNS → TLS → HTML → JS bundle → `/api/auth/me`. Explain parsing, DOM, CSSOM, render and JS. | 9 | Planned |
| M1.2 | HTTP | `NC/01-http-server.js`; `BE/routes/*`; API table | Run `curl -i` on a route and point out the method, status line, headers and body. Show 200/201/400/401/404/429 in the API table. | 1, 5 | Done |
| M1.3 | HTTPS | Production on Vercel + Render; `Secure` cookie | Padlock and certificate in the browser. Cookie marked Secure in DevTools → Application. | 9 | Planned |
| M1.4 | DNS | `NC/08-net-dns.js` | Run `dns.lookup` / `resolve4` on the Vercel and Render hostnames, and compare with `nslookup`. | 1 | Done |
| M1.5 | TLS | `PG/index.js` (`ssl.ca`, `rejectUnauthorized`); Atlas TLS; production HTTPS | `curl -vI https://<app>` shows the TLS version, cipher and certificate chain. Sequelize refuses to connect without the CA. | 3, 9 | Planned |
| M1.6 | XML introduction | `GET /api/export/expenses.xml` (`BE/routes/export.js`, `BE/lib/xml.js`) | Download the export, open it in the browser, and explain elements, attributes and escaping. | 5 | Done |
| M1.7 | JSON introduction | Every API body; `express.json()` | Show a request and response in DevTools. Malformed JSON → 400. | 2, 5 | Done |
| M1.8 | DOM | `FE/pages/*`; `document.title`, focus handling | Elements panel: watch the live DOM change as an expense is added. | 6 | Planned |
| M1.9 | URL | `new URL(req.url)` in `NC/01`; query params on `/api/expenses?page=…` | Break a URL into protocol, host, path and query. Change `page` and watch the results change. | 1, 5 | Done |
| M1.10 | URI | Resource paths (`/api/expenses/42`); report §10 | Explain URI vs URL vs URN using our resource paths, and show `encodeURIComponent` on the search query. | 1, 5 | Done |
| M1.11 | REST API | `BE/routes/*` | Walk the endpoint table: resources, verbs, statelessness, status codes. | 5 | Done |

## Module 2: JavaScript

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M2.1 | Language constructs | `FE/lib/*` | Walk `money()` / `groupExpenses()`: expressions, objects, arrays, spread, destructuring. | 6 | Planned |
| M2.2 | Built-in objects | `Intl.NumberFormat`, `Date`, `Map`, `Math`, `JSON`, `RegExp` in `FE/lib/` | `money()` uses `Intl`; `months.js` uses `Date`. | 6 | Planned |
| M2.3 | Browser objects (BOM) | `window.confirm` on delete, `navigator.onLine` banner, `history` via the router | Delete an expense → confirm dialog. Go offline → banner appears. | 6 | Planned |
| M2.4 | DOM objects | `document.title`, `document.cookie`, `document.documentElement` | Inspect in the console the objects the app touches. | 6 | Planned |
| M2.5 | Event handling | `onSubmit` / `onChange` / `onClick` on every form | Submit the add-expense form; show `preventDefault`. | 6 | Planned |
| M2.6 | Form validation | `FE/lib/validate.js` (regex) + zod in `BE/schemas/*` | An invalid amount or weak password shows an inline message. Bypassing the form with curl → 400. | 4, 6 | Planned |
| M2.7 | Cookies | `FE/lib/cookies.js` (UI preference); httpOnly auth cookie from `BE/lib/cookie.js` | The `theme` cookie is readable in the console; the auth cookie is **not** (httpOnly). | 4, 6 | Planned |
| M2.8 | ES5 vs ES6 and their differences | `NC/09-es5-vs-es6.js` | Run both halves and compare var/let, function/class, callbacks/promises. | 1 | Done |
| M2.9 | Variables | `let`/`const` throughout; ES5 contrast in `NC/09` | Hoisting and block-scope demo in `NC/09`. | 1 | Done |
| M2.10 | Conditions | Budget status in `FE/pages/Afford.jsx` | Move the purchase price across the threshold. | 6 | Planned |
| M2.11 | Loops | `for…of` over `MonthRange`; `reduce` for totals | The trend chart is built from a loop over months. | 6 | Planned |
| M2.12 | Functions | `FE/lib/` helpers; the closure in `useDebounce` | Explain `money`, `groupExpenses` and the debounce closure. | 6 | Planned |
| M2.13 | Events | `keydown` (`Ctrl+K` focuses search); `online`/`offline` events | Press `Ctrl+K`; toggle the network. | 6 | Planned |
| M2.14 | Arrow functions | Handlers and helpers throughout | Contrast `this` in an arrow function vs a regular function in `NC/09`. | 1, 6 | Planned |
| M2.15 | Setting CSS styles using JS | `FE/lib/theme.js` (`style.setProperty`); dynamic `style={{ width }}` on progress bars | Toggle the theme; watch the budget bar width change. | 6 | Planned |
| M2.16 | DOM manipulation | `theme.js`, focus management, `document.title` | Toggle the theme and inspect `<html style>`. | 6 | Planned |
| M2.17 | Classes and inheritance | `FE/lib/Expense.js`: `Expense` and `RecurringExpense extends Expense` | The Afford page projects a recurring bill with `nextOccurrences()`; point out `super` and the override. | 6 | Planned |
| M2.18 | Iterators | `MonthRange` with `[Symbol.iterator]` in `FE/lib/months.js` | `[...new MonthRange(from, to)]` in the console. | 6 | Planned |
| M2.19 | Generators | `function* lastMonths(n)` in `FE/lib/months.js` | Step through it with `.next()` in the console. | 6 | Planned |
| M2.20 | Promise | `NC/06-callback-promise-async.js`; `Promise.all` loading summary + budget | Run `NC/06`; show the parallel requests in the Network tab. | 1, 6 | Planned |
| M2.21 | async/await | `FE/hooks/useApi.js`; every route handler | Walk `useApi` through try/catch/finally. | 6 | Planned |
| M2.22 | Fetch | `FE/hooks/useApi.js`; `BE/services/groq.js` (server-side fetch) | Network tab request with `credentials: 'include'`; `AbortController` cancelling on unmount. | 6, 7 | Planned |

## Module 3: React

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M3.1 | Components | `FE/components/*`, `FE/pages/*` | Show how `page.js` was split into components. | 6 | Planned |
| M3.2 | JSX | Every component | Show JSX next to the compiled `jsx()` output in Vite's dev sources. | 6 | Planned |
| M3.3 | Props | `Metric`, `Heading`, `Panel` | Change a prop in React DevTools. | 6 | Planned |
| M3.4 | State | Forms, filters, the auth mode toggle | Toggle "Create an account". | 6 | Planned |
| M3.5 | Event handling | Forms, delete, nav | The React side of M2.5 (synthetic events). | 6 | Planned |
| M3.6 | Conditional rendering | Auth vs app, empty states, `CAUTION` vs `YOU CAN AFFORD THIS` | Log in to an empty account → empty states. | 6 | Planned |
| M3.7 | Lists and keys | Transactions table, recent rows, category bars | Explain `key={expense.id}`. | 6 | Planned |
| M3.8 | Forms | Auth, add/edit expense, budget, afford, insights | Controlled inputs in React DevTools. | 6 | Planned |
| M3.9 | useState | All pages | — | 6 | Planned |
| M3.10 | useEffect | Load summary, document title, keydown listener with cleanup | Show the cleanup running on a route change. | 6 | Planned |
| M3.11 | useContext | `FE/context/AuthContext.jsx` | Logging out from the sidebar updates every consumer. | 6 | Planned |
| M3.12 | useReducer | `FE/reducers/expensesReducer.js` | Show the action log while adding and filtering. | 6 | Planned |
| M3.13 | Custom hooks | `FE/hooks/useApi.js`, `FE/hooks/useDebounce.js` | Type in search; only one request goes out, after 300 ms. | 6 | Planned |
| M3.14 | React Router | `FE/App.jsx` routes, `NavLink`, `ProtectedRoute`, `*` redirect | Visit `/analytics` logged out → `/login` → back to `/analytics` after logging in. | 6 | Planned |
| M3.15 | State management (Redux Toolkit or Context API) | **Context API**: `AuthContext` + the `useReducer` store | React DevTools showing the context value change. Be ready to explain why Context was chosen over RTK. | 6 | Planned |
| M3.16 | CSS Modules | `*.module.css` for pagination numbers and edit-form extras | Hashed class names in the DOM. | 6 | Planned |
| M3.17 | Styled Components | `FE/components/BudgetRing.jsx` | The ring changes with % used; show the generated class. | 6 | Planned |
| M3.18 | Memoization | `React.memo(Metric)`, `useMemo` totals, `useCallback` handlers | React Profiler: rows don't re-render while typing in search. | 6 | Planned |
| M3.19 | Lazy loading | `React.lazy` + `Suspense` for Analytics and Insights | Network tab: the chunk loads only on the first visit. | 6 | Planned |

## Module 4: Node.js (6 h)

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M4.1 | Node.js runtime | `NC/` README; `process.version`, `process.env`, globals | `node -p process.versions` | 1 | Done |
| M4.2 | Asynchronous programming | `NC/06`; all route handlers | A non-blocking read while a timer keeps ticking. | 1 | Done |
| M4.3 | Callback concept | `NC/06` (callback version, error-first) | Run it and trigger the error path. | 1 | Done |
| M4.4 | Event loop | `NC/07-event-loop.js` | Predict the output order, then run it. | 1 | Done |
| M4.5 | EventEmitter | `NC/02-event-emitter.js` (`BudgetMonitor`) | Spend past 80% and 100% → the events fire. | 1 | Done |
| M4.6 | Networking module | `NC/08-net-dns.js` (`net` TCP echo) | Two terminals: one server, one client. | 1 | Done |
| M4.7 | Buffers | `NC/04-buffers.js` | `₹` is 3 bytes; hex/base64 round trip. | 1 | Done |
| M4.8 | Streams | `NC/05-csv-stream.js`; `GET /api/export/expenses.csv` | A 100k-row file with flat memory; download the CSV export. | 1, 5 | Done |
| M4.9 | File system | `NC/03-fs-path.js` | Create, read, list, stat and delete files in `data/`. | 1 | Done |
| M4.10 | path | `NC/03-fs-path.js` | `join` vs `resolve`; `parse`. | 1 | Done |
| M4.11 | REPL | `NC/REPL.md` + `NC/repl.js` (database models in context) | Live: `.editor`, `_`, and querying a model from the REPL. | 1, 3 | Done |
| M4.12 | NPM packages | `NC/npm-packages.md`; workspace dependencies | `npm ls -w backend`, `npm audit`, semver ranges. | 1 | Done |
| M4.13 | package.json | Root (workspaces, engines), `frontend/`, `backend/`, `database/`, `NC/` | Scripts, `type: module`, `engines`, `workspaces`. | 1 | Done |
| M4.14 | Basic HTTP server without Express | `NC/01-http-server.js` | `curl` its routes and compare with the Express version. | 1 | Done |

## Module 5: Express (6 h)

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M5.1 | Introduction to Express | `BE/app.js` | Contrast it with `NC/01`. | 2 | Done |
| M5.2 | Middleware | helmet, cors, json, cookie-parser, rate-limit, `BE/middleware/requireAuth.js`, `validate.js` | Explain the order. Remove `requireAuth` and show the 401 disappear. | 2, 4 | Planned |
| M5.3 | Routing | `BE/routes/*.js` with `express.Router` | Show the mount points under `/api`. | 2 | Done |
| M5.4 | RESTful API design | Resource naming, verbs, status codes, pagination envelope | API table in report §10. | 5 | Done |
| M5.5 | CRUD operations | Expenses (including PATCH) and budget | Create, read, update and delete live in the UI and with curl. | 5 | Done |
| M5.6 | Error handling | `BE/middleware/errorHandler.js`, `notFound.js`, `HttpError` | A bad id → JSON 404. A forced error → 500 with no stack in production. | 2 | Done |
| M5.7 | Logging | `pino-http` with redaction; auth events in `AuditLog` | A request's log line; the password field shows `[Redacted]`. | 2, 4 | Planned |
| M5.8 | Authentication (JWT) | `BE/routes/auth.js`, `BE/middleware/requireAuth.js`, `BE/lib/token.js` | A tampered token → 401; a token reused after logout → 401. | 4 | Done |
| M5.9 | bcrypt | `BE/routes/auth.js` (bcryptjs, cost 12) | Show the `$2b$12$…` hash in the DB and time one hash. | 4 | Done |

## Module 6: Databases and full-stack integration (6 h)

| # | Topic | Where in the project | Viva demo | Phase | Status |
|---|---|---|---|---|---|
| M6.1 | SQL (PostgreSQL) | Supabase Postgres; `PG/migrations/*` (constraints, index), `PG/sql/rls.sql` | Supabase SQL editor: a `SELECT` with a join and `GROUP BY`. | 3 | Done |
| M6.2 | Sequelize | `PG/models/*`, `PG/migrations/*`, `PG/seeders/*`, `database/.sequelizerc` | Run `db:migrate:undo` then `db:migrate`; a query using associations. | 3 | Done |
| M6.3 | NoSQL (MongoDB) | MongoDB Atlas M0, database `finsight`: collections `chat_logs`, `audit_logs` (90-day TTL) | Atlas collection view after asking an insight and logging in; explain documents vs rows and why logs fit documents. | 3 | Done |
| M6.4 | Mongoose | `MG/index.js` (`connectMongo`, `strictQuery`, `sanitizeFilter`), `MG/models/ChatLog.js`, `MG/models/AuditLog.js` | Schema validation rejecting a bad `source`; the TTL index; an aggregation such as "insights per day". | 3, 4, 7 | Done |
| M6.5 | Connecting React frontend to Express backend | `FE/hooks/useApi.js`; Vite proxy (dev); Vercel rewrite (prod) | Add an expense and follow it UI → API → DB. | 6, 9 | Planned |
| M6.6 | CORS | `cors` allowlist with credentials in `BE/app.js` | A request from a non-allowed origin fails in the console. | 2 | Done |
| M6.7 | Environment variables | `BE/config.js` (zod-validated), root `.env.example`, `--env-file`, host dashboards | Remove `JWT_SECRET` → the server refuses to start. | 2 | Planned |
| M6.8 | Deployment: Vercel | `frontend/vercel.json` | The live URL and the rewrite rule. | 9 | Planned |
| M6.9 | Deployment: Render | `render.yaml` | Render dashboard, logs and health check. | 9 | Planned |

## Coverage

Coverage = topics with status `Planned` or `Done` ÷ total topics. The "Done" column counts only topics that are built and demoable.

| Module | Topics | Planned + Done | Planned coverage | Done |
|---|---|---|---|---|
| M1 Web fundamentals | 11 | 11 | 100% | 64% |
| M2 JavaScript | 22 | 22 | 100% | 9% |
| M3 React | 19 | 19 | 100% | 0% |
| M4 Node.js | 14 | 14 | 100% | 100% |
| M5 Express | 9 | 9 | 100% | 78% |
| M6 Databases & integration | 9 | 9 | 100% | 56% |
| **Overall** | **84** | **84** | **100%** | **42%** |

The target is at least 90% of topics. It is met at planning time.

**Honest notes for the viva:**
- M1.1, M1.3 and M1.5 are shown with tooling (DevTools, curl, certificates) rather than app features, which is the natural way to demonstrate them.
- M2.8, M2.9 and M4.11 live in standalone demo files, not in the running app.
- M1.6 (XML) and M3.17 (Styled Components) are small, deliberate demos inside the app: one export endpoint and one component.
- MongoDB stores logs, not core data. That is a real fit (append-only, flexible, TTL expiry), not a token use, but be ready to explain why expenses stay in Postgres.
