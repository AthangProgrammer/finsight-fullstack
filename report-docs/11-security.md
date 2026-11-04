# 11. Security (OWASP Top 10:2025) implementation

- Summarise planning/SECURITY.md: one row per category with the control and the evidence
- Evidence: test names and screenshots (headers scan, lockout, IDOR 404, RLS advisor, redacted log line)
- CSRF reasoning (SameSite=Lax + same-site rewrite)
- Residual risks and what we'd do with more time (refresh-token rotation, 2FA, email verification)
