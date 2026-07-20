# Testing

Tests verify behavior and invariants, not implementation trivia.

## Layers

- Unit tests: parser helpers, schemas, date formatting, LaTeX escaping.
- Integration tests: candidate Markdown to resume model, validation errors.
- End-to-end tests: CLI build from sanitized fixture to `.tex`, and PDF when TeX is available.

## Critical Coverage

- Markdown parsing.
- Runtime validation.
- Provenance preservation.
- Factual integrity constraints.
- Localization.
- LaTeX escaping.
- Missing tool diagnostics.

## Commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
```

Coverage thresholds are enforced globally at a modest level for the bootstrap and should increase around parser, validation, provenance, composition, and LaTeX modules as the project grows.
