# Security And Privacy

Resume data is personal data. The public repository should contain sanitized examples only.

## Rules

- Do not commit real candidate source files or generated private resumes.
- Use `.env` for secrets and local configuration.
- Validate environment variables before use.
- Treat candidate text as untrusted input for LaTeX.
- Do not send candidate data to external AI providers in the MVP.

## Ignored Local Data

Private candidate files should live under ignored paths such as `private/` or use ignored extensions such as `*.private.md`. The default `candidate.md`, generated TeX/PDF files, and `dist/` output are ignored. `init` uses exclusive creation and cannot overwrite an existing source. Ignore rules do not remove already tracked files.

## Future AI Use

If an LLM is added, document provider, data sent, retention/privacy tradeoffs, required environment variables, and validation gates before enabling it.

## Untrusted Input Boundaries

Front matter is YAML-only with a restricted schema and runtime-validated metadata; executable language markers are rejected before parsing. Candidate text is escaped for LaTeX. Compiler paths are passed as arguments without a shell. TeX uses restricted execution flags and private per-invocation working directories, which are removed afterward. PDF output is parsed and validated before publication.

The bundled compiler can download TeX support files; candidate content is not sent to an editorial service. This is a local CLI, not a sandbox service for accepting arbitrary hostile TeX files. Only compile TeX produced by Arete from validated candidate input.

Examples use fictional identities and reserved example-domain links. Sanitizing repository examples is not automatic anonymization of personal resumes, free text, Git metadata, or history.
