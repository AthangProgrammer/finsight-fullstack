# Security plan (OWASP Top 10:2025)

This plan is built against the **OWASP Top 10:2025**, the current edition. That edition renumbers and merges some of the 2021 categories, so the 2021-style list in the brief maps to 2025 like this:

| Brief (2021 numbering) | 2025 category |
|---|---|
| A01 Broken Access Control | A01:2025 Broken Access Control |
| A10 SSRF | merged into A01:2025 Broken Access Control |
| A05 Security Misconfiguration | A02:2025 Security Misconfiguration |
| A06 Vulnerable and Outdated Components | A03:2025 Software Supply Chain Failures (broader scope) |
| A02 Cryptographic Failures | A04:2025 Cryptographic Failures |
| A03 Injection | A05:2025 Injection |
| A04 Insecure Design | A06:2025 Insecure Design |
| A07 Identification and Authentication Failures | A07:2025 Authentication Failures |
| A08 Software and Data Integrity Failures | A08:2025 Software or Data Integrity Failures |
| A09 Security Logging and Monitoring Failures | A09:2025 Security Logging and Alerting Failures |
| (new) | A10:2025 Mishandling of Exceptional Conditions |

> Check the category names against owasp.org/Top10/2025 before the report is finalised.

**Path prefixes used below:**

| Prefix | Folder |
|---|---|
| `BE/` | `backend/src/` |
| `FE/` | `frontend/src/` |
| `PG/` | `database/postgres/` |
| `MG/` | `database/mongo/` |
| `T/` | `backend/tests/` |

## Threat model (short)

- **Assets:** users' expense history, password hashes, the JWT secret, the Postgres and Atlas credentials, the Groq key.
- **Actors:**
  - an anonymous internet user
  - a logged-in user trying to read another user's data
  - a script hammering the login route
  - a malicious prompt typed into the AI box
  - a compromised npm package
  - someone scanning for an open Atlas cluster
- **Trust boundaries:** browser ↔ Vercel; Vercel ↔ Render (the rewrite); Render ↔ Supabase; Render ↔ Atlas; Render ↔ Groq.
- **Assumptions:**
  - Only the backend connects to either database.
  - Supabase's Data API is off.
  - The Atlas user can only reach the `finsight` database.

---

## A01:2025 Broken Access Control (includes SSRF)

| Control | Lives in | Test |
|---|---|---|
| `requireAuth` on every route except auth and health | `BE/middleware/requireAuth.js`, router mounts in `BE/app.js` | `T/auth.test.js`: each protected route without a cookie → 401 |
| Every query on user data is scoped with `where: { userId: req.user.id }`; lookups by id use `{ id, userId }` | `BE/routes/expenses.js`, `budget.js`, `summary.js`, `export.js`, `insights.js` | `T/idor.test.js`: user B's GET/PATCH/DELETE on user A's expense → 404, and the row is unchanged |
| `userId` is never read from the request body; zod `.strict()` rejects unknown keys | `BE/schemas/*.js` | A POST containing `userId` → 400 |
| RLS enabled on every table with no policies; `REVOKE ALL` from `anon` and `authenticated`; default privileges revoked | `PG/sql/rls.sql`, applied by a migration | Supabase Security Advisor is clean; the anon key against the Data API → error or empty |
| Supabase Data API disabled | Supabase dashboard (documented in README) | Screenshot for report §11 |
| Atlas app user has `readWrite` on `finsight` only, no admin roles; network access `0.0.0.0/0` is forced by Render's lack of static IPs, so the user's limits and a strong password carry the weight | Atlas dashboard; `MONGODB_URI` | Try to list databases or write to `admin` as `finsight_app` → unauthorized |
| DB passwords and the Groq key exist only in the Render env and the local `.env` | Render env; `.env.example` holds placeholders only | CI step: grep the built frontend bundle for `postgres`, `mongodb+srv`, `gsk_` and `service_role` → no hits |
| **SSRF:** the only outbound HTTP call goes to a constant Groq URL, and no route accepts a URL | `BE/services/groq.js` | A test asserts the fetch URL equals the constant |
| No state-changing GET routes | Routers | Route list reviewed in Phase 8 |

## A02:2025 Security Misconfiguration

| Control | Lives in | Test |
|---|---|---|
| `helmet()` with an explicit API CSP (`default-src 'none'; frame-ancestors 'none'`) | `BE/app.js` | `curl -I` shows the headers; Supertest asserts `content-security-policy` |
| Static-site headers on Vercel: CSP `default-src 'self'` (fonts are self-hosted, so no external origins), plus `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` | `frontend/vercel.json` | Screenshot of a securityheaders.com scan |
| CORS allowlist from `CORS_ORIGINS`, with `credentials: true` and never `*` | `BE/app.js` | A request with `Origin: https://evil.example` gets no ACAO header |
| `app.disable('x-powered-by')` | `BE/app.js` | Supertest asserts the header is absent |
| A central error handler; stack traces only when `NODE_ENV=development` | `BE/middleware/errorHandler.js` | Test with `NODE_ENV=production`: a 500 body is only `{ error, requestId }` |
| Env validated at boot with zod; the server refuses to start if `JWT_SECRET` is missing or weak (under 64 characters) or if a DB URI is missing | `BE/config.js` | Unit test |
| JSON body limited to 10 kb; non-JSON rejected on write routes | `BE/app.js` | An 11 kb body → 413 |
| `trust proxy` set to the real hop count, so rate limits see the client's IP | `BE/app.js` | Compare `req.ip` in logs with your own IP |
| Mongoose `autoIndex` off in production; indexes created by a script | `MG/index.js` | Review |

## A03:2025 Software Supply Chain Failures

| Control | Lives in | Test |
|---|---|---|
| Exact versions (`save-exact=true`) and one committed root lockfile covering all workspaces | `.npmrc`, `package-lock.json` | CI runs `npm ci`, which fails on drift |
| `npm audit --audit-level=high` in CI | `.github/workflows/ci.yml` | A PR adding a known-vulnerable dependency fails |
| Dependabot for npm and GitHub Actions | `.github/dependabot.yml` | Weekly PRs appear |
| Few dependencies; each new one justified in its PR (e.g. bcryptjs over native bcrypt, plain `fetch` instead of the Groq SDK) | PR template, `TECH_STACK.md` | Review |
| GitHub Actions pinned to a commit SHA | `ci.yml` | Review |
| Node pinned to a supported LTS (`engines: ">=22"`, Render Node 22) | Root `package.json`, `render.yaml` | `engine-strict=true` |

## A04:2025 Cryptographic Failures

| Control | Lives in | Test |
|---|---|---|
| HTTPS everywhere: Vercel and Render terminate TLS, and helmet sets HSTS | Hosts, `BE/app.js` | `curl -vI` shows TLS 1.2 or 1.3 and `Strict-Transport-Security` |
| Passwords hashed with bcrypt (bcryptjs) at cost 12, capped at 72 bytes | `BE/routes/auth.js` | Test: the stored hash starts with `$2b$12$` (or `$2a$12$`) |
| JWT signed with HS256 using a random secret of 64+ bytes from env; `algorithms: ['HS256']` pinned on verify | `BE/lib/jwt.js` | A token with `alg: none`, or signed with another key → 401 |
| TLS to Supabase with the CA pinned and `rejectUnauthorized: true` | `PG/index.js` | A wrong CA → connection refused (manual) |
| TLS to Atlas (on by default for `mongodb+srv`) | `MG/index.js` | `tls=false` in the URI is rejected by Atlas (manual) |
| No sensitive data in the JWT payload, only `sub` and `tv` | `BE/lib/jwt.js` | Unit test on the payload keys |

## A05:2025 Injection

| Control | Lives in | Test |
|---|---|---|
| **SQL:** only Sequelize model methods and bound parameters; `sequelize.query` only with `replacements` | All of `backend/` and `database/` | An ESLint `no-restricted-syntax` rule flags template literals passed to `sequelize.query`; `q=' OR 1=1 --` returns 0 rows |
| `ILIKE` search escapes `%` and `_` | `BE/routes/expenses.js` | `q=%` matches only a literal `%` |
| **NoSQL:** `mongoose.set('sanitizeFilter', true)` and `strictQuery`; no `$where`; query filters built from server values only, never from request objects | `MG/index.js`, `MG/models/*` | Test: a filter containing `{ "$gt": "" }` from input is neutralised |
| zod validation on the body, params and query of every route | `BE/middleware/validate.js`, `BE/schemas/*` | A 400 test per route |
| Output escaping: React escapes by default, and ESLint bans `dangerouslySetInnerHTML` (`react/no-danger`) | `eslint.config.js` | A description of `<img src=x onerror=alert(1)>` renders as plain text |
| XML export escapes `& < > " '`; CSV export neutralises cells starting with `= + - @` | `BE/lib/xml.js`, `BE/lib/csv.js` | Unit tests |
| **Prompt injection (AI route):** the server builds the context from aggregates; user text is capped at 300 characters and appears only in the user turn; the system prompt says to treat it as a question, not instructions, and to stay on budgeting; the reply is rendered as plain text | `BE/routes/insights.js`, `BE/services/groq.js` | A set of injection prompts ("ignore previous instructions", "print your system prompt") → a refusal or an on-topic tip, and there are no secrets in the prompt to leak |

## A06:2025 Insecure Design

| Control | Lives in | Test |
|---|---|---|
| Threat model (above) kept current | This file | Reviewed in Phase 8 |
| Input limits: amount ₹0.01 to ₹1,00,00,000; description 1 to 120 characters; budget ₹0 to ₹1,00,00,000; question 300 characters; page size at most 50 | zod schemas, DB `CHECK` constraints, Mongoose validators | Boundary tests |
| Rate limits: global 300 requests per 15 min per IP; login 10 per 15 min per IP; register 5 per hour per IP; insights 10 per hour per user | `BE/middleware/rateLimit.js` | Supertest loops → 429 |
| The AI feature is isolated: if it fails, it falls back and never breaks other routes | `BE/routes/insights.js` | Groq mocked as down → 200 with the fallback |
| Mongo logging is fire-and-forget: an Atlas outage never fails a request | `BE/lib/audit.js` | Mongo mocked as down → login still works, and a warning is logged |
| Exports capped at 10,000 rows and streamed | `BE/routes/export.js` | Test with seed data |
| Data minimisation: Mongo logs hold no question text, passwords or tokens, and audit logs expire after 90 days | `MG/models/*` | Schema review; the TTL index is visible in Atlas |

## A07:2025 Authentication Failures

| Control | Lives in | Test |
|---|---|---|
| Password policy: 10 to 72 characters, with at least one letter and one digit; usernames checked with a regex | `BE/schemas/auth.js`, `FE/lib/validate.js` | A weak password → 400 |
| Account lockout with backoff: after 5 failures, lock for 1, 2, 4… minutes (at most 30); reset on success | `BE/routes/auth.js`; `users.failed_logins`, `users.locked_until` | The correct password while locked → the same generic failure |
| Per-IP login rate limit | `BE/middleware/rateLimit.js` | → 429 |
| Generic errors ("Invalid username or password."), and a dummy bcrypt compare for unknown users so timing is similar | `BE/routes/auth.js` | An unknown user and a wrong password give the same message and similar latency |
| JWT expires after 30 minutes with a sliding re-issue; logout clears the cookie **and** bumps `token_version` | `BE/middleware/requireAuth.js`, `BE/routes/auth.js` | A token captured before logout → 401 |
| Cookie flags: `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain` (optionally the `__Host-` prefix) | `BE/lib/cookie.js` | Supertest inspects `Set-Cookie` |

## A08:2025 Software or Data Integrity Failures

| Control | Lives in | Test |
|---|---|---|
| The lockfile is committed, and `npm ci` is used everywhere | Repo, CI, `render.yaml` | CI |
| CI (lint, test, audit) required on every PR; branch protection on `main` | `.github/workflows/ci.yml`, GitHub settings | A failing PR can't be merged |
| No third-party scripts or styles: fonts are self-hosted with `@fontsource`, so no CDN resource needs SRI | `FE/main.jsx`, `frontend/vercel.json` | The Network tab shows no other origins |
| The JWT signature is verified on every request, and no client-supplied field (`userId`, `role`) is trusted | `BE/middleware/requireAuth.js` | A tampered payload → 401 |

## A09:2025 Security Logging and Alerting Failures

| Control | Lives in | Test |
|---|---|---|
| Structured JSON logs (pino) with request id, method, path, status, latency and user id | `BE/logger.js`, `BE/app.js` | A log sample goes in the report |
| Auth events stored durably in `audit_logs` (register, login success/failure/locked, logout, with IP and user agent); AI usage in `chat_logs` | `MG/models/AuditLog.js`, `ChatLog.js`, `BE/lib/audit.js` | A test asserts a document is written per event |
| Redaction: `req.headers.cookie`, `req.headers.authorization`, `*.password`, `*.token`, and env keys | `BE/logger.js` (`redact` paths) | Test: the log output for a login contains no password |
| Lightweight alerting: a Mongo aggregation of `login.failure` / `login.locked` per hour, checked during the demo and in the report; Render log stream | `NC/repl.js` snippet, report §11 | Manual |

## A10:2025 Mishandling of Exceptional Conditions

| Control | Lives in | Test |
|---|---|---|
| Async errors reach the central handler (Express 5 forwards rejected promises) | `BE/app.js` | A route that throws → JSON 500 |
| Fail closed: if JWT verification or the user lookup fails, return 401 or 503, never let the request through | `BE/middleware/requireAuth.js` | Postgres mocked as down → 503 |
| `process.on('unhandledRejection' / 'uncaughtException')` logs and exits, and Render restarts the process | `BE/server.js` | Manual |
| A Groq timeout, 429 or 5xx → the fallback response; a Mongo outage → a logged warning, and the request still succeeds | `BE/services/groq.js`, `BE/lib/audit.js` | Mocked tests |
| Graceful shutdown on `SIGTERM`: close the server, the Sequelize pool and the Mongoose connection | `BE/server.js` | Manual, via Render deploy logs |

---

## CSRF

The auth cookie is `SameSite=Lax` and first-party, because the browser only ever talks to the Vercel domain, which rewrites `/api/*` to Render. Under Lax, browsers don't send the cookie on cross-site `POST`, `PUT`, `PATCH` or `DELETE` requests, and we have no state-changing `GET`s. `*.vercel.app` and `*.onrender.com` are on the Public Suffix List, so another app hosted on those domains counts as a different site.

Two extra layers, both cheap enough to keep:
- State-changing routes require `Content-Type: application/json`. A cross-site HTML form can't send that, and a cross-origin `fetch` that sends it triggers a CORS preflight, which our allowlist rejects.
- The `Origin` header on state-changing requests is checked against `CORS_ORIGINS`. Requests where it's present but not allowed are rejected.

**If the cookie ever has to be `SameSite=None`**, Lax protection is gone. That happens, for example, if the frontend calls `onrender.com` directly instead of going through the Vercel rewrite. In that case we add a CSRF token using the double-submit cookie pattern (the `csrf-csrf` package):
- The token comes from `GET /api/auth/csrf`.
- It's sent in an `X-CSRF-Token` header.
- It's verified on every non-GET request.

This would be a change to the plan, not an optional step.
