# 14. Deployment

> Report on hold; skeleton only.

- Deployment diagram (reuse diagrams/architecture.md)
- Supabase: project, pooler connection, SSL cert, migrations, Data API off
- MongoDB Atlas: M0 cluster, least-privilege user, network access, TTL index
- Render: render.yaml at the repo root (workspace build), env vars, health check, cold-start behaviour
- Vercel: root directory frontend/, vercel.json rewrite and headers
- CI/CD flow: PR → checks → merge → auto-deploy
- Free-tier limits and how we handled them
