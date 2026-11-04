# 10. API documentation

- Base URL in production (via the Vercel rewrite): `/api`
- Auth: httpOnly cookie set by `/api/auth/login`
- Table: Method | Path | Auth | Request (body/query) | Success response | Errors
- Endpoints: `GET /healthz`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/categories`, `GET/POST /api/expenses`, `GET/PATCH/DELETE /api/expenses/:id`, `GET/PUT /api/budget`, `GET /api/summary`, `GET /api/export/expenses.csv`, `GET /api/export/expenses.xml`, `POST /api/insights`
- Error format: `{ "error": "message", "details": [...], "requestId": "..." }`
- Rate limits per route
