# Testing

Tests verify behavior and invariants, not implementation trivia.

## Layers

- Unit tests: parser helpers, schemas, date formatting, LaTeX escaping.
- Integration tests: candidate Markdown to resume model, validation errors.
- End-to-end tests: CLI build from a synthetic fixture to `.tex` and refusal to overwrite a source.
- Real PDF smoke: `pnpm test:pdf` uses the built CLI and actual npm-managed compiler, then checks extraction with Poppler. It is separate from the fast test suite.

## Critical Coverage

- Markdown parsing.
- Runtime validation.
- Provenance preservation.
- Factual integrity constraints.
- STAR evidence notes do not leak into rendered bullets unless intentionally modeled.
- Localization.
- LaTeX escaping.
- Missing compiler diagnostics.

## Commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm test:pdf
pnpm audit
```

Coverage thresholds are enforced globally at a modest level for the bootstrap and should increase around parser, validation, provenance, composition, and LaTeX modules as the project grows.

The PDF smoke requires `pdftotext` on PATH (`poppler-utils` on Ubuntu/Debian). First-use Tectonic may require network access for support files. Unit compiler tests use fixture executables and real compressed PDF structures; they do not replace the real compilation smoke.
