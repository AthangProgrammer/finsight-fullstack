# Security plan (OWASP Top 10:2025)

Built against the **OWASP Top 10:2025**, the current edition. It renumbers and merges some 2021 categories, so the brief's 2021-style list maps like this:

| Brief (2021 numbering) | 2025 category |
|---|---|
| A01 Broken Access Control | A01:2025 Broken Access Control |
| A10 SSRF | merged into A01:2025 Broken Access Control |
| A05 Security Misconfiguration | A02:2025 Security Misconfiguration |
| A06 Vulnerable and Outdated Components | A03:2025 Software Supply Chain Failures (broadened) |
| A02 Cryptographic Failures | A04:2025 Cryptographic Failures |
| A03 Injection | A05:2025 Injection |
| A04 Insecure Design | A06:2025 Insecure Design |
| A07 Identification and Authentication Failures | A07:2025 Authentication Failures |
| A08 Software and Data Integrity Failures | A08:2025 Software or Data Integrity Failures |
| A09 Security Logging and Monitoring Failures | A09:2025 Security Logging and Alerting Failures |
| (new) | A10:2025 Mishandling of Exceptional Conditions |

> Verify the names against owasp.org/Top10/2025 before the report is finalised.

Paths: `S/` = `server/src/`, `C/` = `client/src/`, `T/` = `server/tests/`.

## Threat model (short)

**Assets:** users' expense history, password hashes, the JWT secret, DB credentials, the Groq key.
**Actors:** anonymous internet user; a logged-in user trying to read another user's data; a script hammering login; a malicious prompt in the AI box; a compromised npm package.
**Trust boundaries:** browser ↔ Vercel; Vercel ↔ Render (rewrite); Render ↔ Supabase; Render ↔ Groq.
**Assumptions:** only the Express server connects to Postgres; Supabase's REST/Data API is off or exposes nothing.

---

## A01:2025 Broken Access Control (includes SSRF)

| Control | Lives in | Test |
|---|---|---|
| `requireAuth` on every non-auth, non-health route | `S/middleware/requireAuth.js`, router mounts in `S/app.js` | `T/auth.test.js`: each protected route without cookie → 401 |
| Every user-data query has `where: { userId: req.user.id }`; by-id lookups use `{ id, userId }` | `S/routes/expenses.js`, `budget.js`, `summary.js`, `export.js`, `insights.js` | `T/idor.test.js`: user B GET/PATCH/DELETE user A's expense → 404, row unchanged |
| `userId` never read from the request body; zod schemas `.strict()` reject unknown keys | `S/schemas/*.js` | POST with `userId` field → 400 |
| RLS enabled on every table, no policies, `REVOKE ALL` from `anon`, `authenticated`; default privileges revoked | `server/db/migrations/*-enable-rls.cjs` | Supabase Security Advisor clean; `curl` the Data API with the anon key → error/empty |
| Supabase Data API disabled (or app schema not exposed) | Supabase dashboard; documented in README | Screenshot in report §11 |
| DB password and any Supabase secret/service key exist only in Render env | Render env; `.env.example` has placeholders only | `grep` of the built client bundle for `postgres`, `gsk_`, `service_role` finds nothing (CI step) |
| **SSRF:** the only outbound HTTP call is to a constant Groq URL; no route accepts a URL | `S/services/groq.js` | Code review checklist item; test asserts the fetch URL is the constant |
| No state-changing GET routes | Routers | Route list review in Phase 8 |

## A02:2025 Security Misconfiguration

| Control | Lives in | Test |
|---|---|---|
| `helmet()` with an explicit CSP for the API (`default-src 'none'; frame-ancestors 'none'`) | `S/app.js` | `curl -I` shows headers; Supertest asserts `content-security-policy` |
| Static-site headers on Vercel: CSP (`default-src 'self'; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self'`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | `client/vercel.json` | securityheaders.com scan screenshot |
| CORS allowlist from `CORS_ORIGINS`, `credentials: true`, no `*` | `S/app.js` | Request with `Origin: https://evil.example` → no ACAO header |
| `app.disable('x-powered-by')` | `S/app.js` | Supertest asserts header absent |
| Central error handler; stack traces only when `NODE_ENV=development` | `S/middleware/errorHandler.js` | Test with `NODE_ENV=production`: 500 body is `{ error, requestId }` only |
| Env validated at boot with zod; server refuses to start on missing/weak `JWT_SECRET` (< 64 chars) | `S/config.js` | Unit test |
| JSON body limit 10 kb; reject non-JSON on write routes | `S/app.js` | 11 kb body → 413 |
| `trust proxy` set to the real hop count (Vercel → Render) so rate limits see the client IP | `S/app.js` | Log `req.ip` in staging and compare with your IP |

## A03:2025 Software Supply Chain Failures

| Control | Lives in | Test |
|---|---|---|
| Exact versions (`save-exact=true`) and committed lockfiles | `.npmrc`, `package-lock.json` in both packages | CI uses `npm ci` (fails on drift) |
| `npm audit --audit-level=high` in CI | `.github/workflows/ci.yml` | PR with a known-vulnerable dep fails |
| Dependabot for npm and GitHub Actions | `.github/dependabot.yml` | PRs appear weekly |
| Few dependencies; each new one justified in its PR | PR template | Review |
| GitHub Actions pinned to a commit SHA | `ci.yml` | Review |
| Node version pinned (`engines`, Render runtime) and on a supported LTS line | `package.json`, `render.yaml` | See PROPOSAL risk on Node 20 EOL |

## A04:2025 Cryptographic Failures

| Control | Lives in | Test |
|---|---|---|
| HTTPS everywhere (Vercel and Render terminate TLS; HSTS from helmet) | Hosts, `S/app.js` | `curl -vI` shows TLS 1.2+/1.3 and `Strict-Transport-Security` |
| bcrypt cost 12 for passwords; passwords capped at 72 bytes | `S/routes/auth.js` | Test: stored hash starts `$2b$12$` |
| JWT HS256 with a ≥ 64-byte random secret from env; `algorithms: ['HS256']` pinned on verify | `S/lib/jwt.js` | Token signed with `alg: none` or another key → 401 |
| TLS to Supabase with the CA pinned and `rejectUnauthorized: true` | `S/db/index.js` | Wrong CA → connection refused (manual) |
| No sensitive data in JWT payload (only `sub`, `tv`) | `S/lib/jwt.js` | Unit test on payload keys |
| Money stored as `NUMERIC(12,2)`, not float | migrations | Not a crypto control; noted for integrity |

## A05:2025 Injection

| Control | Lives in | Test |
|---|---|---|
| Sequelize model methods and bound parameters only; no template-string SQL. `sequelize.query` allowed only with `replacements` | All of `S/` | ESLint `no-restricted-syntax` rule flags template literals passed to `sequelize.query`; test with `q=' OR 1=1 --` returns 0 rows |
| `ILIKE` search escapes `%` and `_` | `S/routes/expenses.js` | `q=%` matches literal % only |
| zod validation on body, params, query for every route | `S/middleware/validate.js`, `S/schemas/*` | 400 tests per route |
| Output escaping: React escapes by default; `dangerouslySetInnerHTML` banned by ESLint (`react/no-danger`) | `client/eslint.config.js` | Description `<img src=x onerror=alert(1)>` renders as text |
| XML export escapes `& < > " '`; CSV export neutralises leading `= + - @` | `S/lib/xml.js`, `S/lib/csv.js` | Unit tests |
| **Prompt injection (AI route):** server builds the context from aggregates; user text is length-capped (300) and placed only in the user turn; system prompt says to treat it as a question, not instructions, and to stay on budgeting; reply rendered as plain text | `S/routes/insights.js`, `S/services/groq.js` | Test set of injection prompts ("ignore previous instructions", "print your system prompt") → refusal or on-topic tip; no secrets ever in the prompt to leak |

## A06:2025 Insecure Design

| Control | Lives in | Test |
|---|---|---|
| Threat model (above) kept current | This file | Review at Phase 8 |
| Limits: amount 0.01 to 1,00,00,000; description 1 to 120 chars; budget 0 to 1,00,00,000; question 300 chars; page size ≤ 50 | zod schemas + DB `CHECK` constraints | Boundary tests |
| Rate limits: global 300 req / 15 min / IP; login 10 / 15 min / IP; register 5 / hour / IP; insights 10 / hour / user | `S/middleware/rateLimit.js` | Supertest loops → 429 |
| AI feature isolated: failure falls back, never breaks other routes | `S/routes/insights.js` | Groq mocked down → 200 fallback |
| Export capped (e.g. 10,000 rows) and streamed | `S/routes/export.js` | Test with seed data |

## A07:2025 Authentication Failures

| Control | Lives in | Test |
|---|---|---|
| Password policy: 10 to 72 chars, at least one letter and one digit; username regex | `S/schemas/auth.js`, `C/lib/validate.js` | Weak password → 400 |
| Account lockout with backoff: after 5 failures lock 1, 2, 4… min (max 30); reset on success | `S/routes/auth.js`, `users.failed_logins`, `users.locked_until` | 6th attempt with correct password while locked → 423/401 generic |
| Per-IP login rate limit | `S/middleware/rateLimit.js` | → 429 |
| Generic errors ("Invalid username or password."); dummy bcrypt compare for unknown users to flatten timing | `S/routes/auth.js` | Same message and similar latency for unknown user vs wrong password |
| JWT expiry 30 min, sliding re-issue; logout clears the cookie **and** bumps `token_version` | `S/middleware/requireAuth.js`, `S/routes/auth.js` | Reuse a token captured before logout → 401 |
| Cookie: `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain` (optionally `__Host-` prefix) | `S/lib/cookie.js` | Supertest inspects `Set-Cookie` |
| No user enumeration on register (409 message generic enough) | `S/routes/auth.js` | Review |

## A08:2025 Software or Data Integrity Failures

| Control | Lives in | Test |
|---|---|---|
| Lockfiles committed; `npm ci` everywhere | repo, CI, `render.yaml` | CI |
| CI (lint, test, audit) required on every PR; branch protection on `main` | `.github/workflows/ci.yml`, GitHub settings | A failing PR can't merge |
| No third-party scripts from CDNs. Google Fonts CSS is the only external resource (SRI doesn't work on it because the CSS varies by browser), so either self-host the fonts with `@fontsource/dm-sans` + `@fontsource/manrope` or keep it and allow only those two hosts in the CSP | `C/styles/globals.css`, `client/vercel.json` | Network tab shows no other origins |
| JWT signature verified on every request; no client-trusted fields (`userId`, `role`) | `S/middleware/requireAuth.js` | Tampered payload → 401 |

## A09:2025 Security Logging and Alerting Failures

| Control | Lives in | Test |
|---|---|---|
| Structured JSON logs (pino) with request id, method, path, status, latency, user id | `S/logger.js`, `S/app.js` | Log sample in report |
| Auth events: register, login success/failure, lockout, logout; AI calls (latency, source), rate-limit hits | `S/routes/auth.js`, `S/middleware/rateLimit.js` | Test asserts logger called with event name |
| Redaction: `req.headers.cookie`, `req.headers.authorization`, `*.password`, `*.token`, `GROQ_API_KEY` | `S/logger.js` (`redact` paths) | Test: log output for login contains no password |
| Alerting (lightweight): Render log stream reviewed; a spike of `auth.login.locked` is the signal | Report §11 | Manual |

## A10:2025 Mishandling of Exceptional Conditions

| Control | Lives in | Test |
|---|---|---|
| Async errors reach the central handler (Express 5 forwards rejected promises; or a wrapper on Express 4) | `S/app.js` | Route that throws → JSON 500 |
| Fail closed: JWT verify error, DB error in `requireAuth` → 401/503, never "let through" | `S/middleware/requireAuth.js` | DB mocked down → 503 |
| `process.on('unhandledRejection'/'uncaughtException')` → log and exit; Render restarts | `S/server.js` | Manual |
| Groq timeout/429/5xx → fallback response | `S/services/groq.js` | Mocked tests |
| Graceful shutdown on `SIGTERM` (close server, close Sequelize pool) | `S/server.js` | Manual on Render deploy logs |

---

## CSRF

The auth cookie is `SameSite=Lax` and first-party: the browser only ever talks to the Vercel domain, which rewrites `/api/*` to Render. Under Lax, browsers don't send the cookie on cross-site `POST`/`PUT`/`PATCH`/`DELETE`, and we have no state-changing `GET`s. `*.vercel.app` and `*.onrender.com` are on the Public Suffix List, so another app on those hosts counts as a different site.

Extra layers, cheap enough to keep:
- State-changing routes require `Content-Type: application/json` (a cross-site HTML form can't send that, and a cross-origin `fetch` with it triggers a CORS preflight that our allowlist rejects).
- Check the `Origin` header on state-changing requests against `CORS_ORIGINS`; reject when present and not allowed.

**If the cookie ever has to be `SameSite=None`** (for example, the client calls `onrender.com` directly without the Vercel rewrite), Lax protection is gone and we add a CSRF token: double-submit cookie pattern (`csrf-csrf` package), token fetched from `GET /api/auth/csrf`, sent in an `X-CSRF-Token` header, verified on every non-GET. This is a plan change, not an option to skip.
