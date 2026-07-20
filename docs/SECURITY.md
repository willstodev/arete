# Security And Privacy

Resume data is personal data. The public repository should contain sanitized examples only.

## Rules

- Do not commit real candidate source files or generated private resumes.
- Use `.env` for secrets and local configuration.
- Validate environment variables before use.
- Treat candidate text as untrusted input for LaTeX.
- Do not send candidate data to external AI providers in the MVP.

## Ignored Local Data

Private candidate files should live under ignored paths such as `private/` or use ignored extensions such as `*.private.md`. Generated `dist/` output is ignored.

## Future AI Use

If an LLM is added, document provider, data sent, retention/privacy tradeoffs, required environment variables, and validation gates before enabling it.
