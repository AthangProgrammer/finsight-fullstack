# 6. System architecture

> Report on hold; skeleton only.

- Diagram: diagrams/architecture.md
- Layers: React SPA (Vercel) → Vercel rewrite → Express API (Render) → database package → Postgres (Supabase) and MongoDB (Atlas); Groq as an external service
- Request lifecycle: browser → DNS → TLS → static assets → `/api` call → middleware chain → route → Sequelize → response
- Why the rewrite (same-site cookie) and why Groq is server-only
- How a browser works (syllabus M1.1), using our app as the example
- Folder structure: frontend/, backend/ (with node-core/), database/ (npm workspaces)
