# Content beyond syllabus

For the 10-mark "Content beyond syllabus presentation" rubric. The other two CA rubric items are a 4-week+ MOOC certificate (10 marks, done individually, outside this repo) and "Creating proof of concept" (10 marks, the deployed app itself).

Pick 3 or 4 for the presentation; one slide each with a live demo or screenshot. The ✅ column is the recommendation.

| ✅ | Topic | What we built | Why it's beyond the syllabus | Demo | Phase |
|---|---|---|---|---|---|
| ✅ | **OWASP Top 10:2025 security hardening** | Access-control scoping, RLS deny-all, helmet + CSP, lockout, rate limits, log redaction, CSRF reasoning | Syllabus covers JWT/bcrypt only; this is a full threat-model-driven control set | Walk 3 attacks live: IDOR → 404, brute force → lockout, XSS payload rendered as text | 4, 8 |
| ✅ | **Automated testing** | Jest + Supertest (API), Vitest + React Testing Library (UI) | Testing isn't in the six modules | Run the suite; show the IDOR test | 8 |
| ✅ | **CI/CD with GitHub Actions** | Lint, test, `npm audit` on every PR; branch protection; Dependabot; Vercel/Render auto-deploy on merge | Syllabus has "deployment basics" only | A PR blocked by a failing check | 9 |
| ✅ | **LLM integration done safely (Groq)** | Server-only key, aggregate-only context, prompt-injection-resistant system prompt, timeout, per-user limit, fallback | Not in syllabus; also shows privacy-by-design | Ask a normal question, then an injection attempt | 7 |
| | **Playwright visual regression** | Screenshot diff of the old (Next.js) and new (Vite) apps per route | Browser automation and visual testing | Side-by-side and diff image | 6, 8 |
| | **Rate limiting and account lockout** | `express-rate-limit` + DB-backed exponential backoff | Abuse prevention design | Loop of logins → 429 / locked | 4 |
| | **Security headers** | helmet on API, Vercel headers on the SPA | HTTP security headers, CSP | securityheaders.com grade before/after | 8, 9 |
| | **Row Level Security in Postgres** | RLS on, anon/authenticated revoked | Database-level authorization | Anon key request denied | 3 |
| | **Streaming exports** | CSV/XML streamed from the DB with backpressure | Production use of streams beyond the syllabus demo | 100k-row export with flat memory graph | 5 |
| | **Structured logging** | pino JSON logs with request ids and redaction | Observability | Render log search by request id | 2 |
