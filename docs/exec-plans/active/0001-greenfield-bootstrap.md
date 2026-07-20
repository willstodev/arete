# 0001 Greenfield Bootstrap

## Objective

Create the initial Arete documentation, TypeScript toolchain, CLI, candidate parser, validation model, deterministic resume composition, LaTeX renderer, PDF compilation wrapper, examples, tests, and CI.

## Milestones

1. Documentation foundation.
2. Toolchain bootstrap.
3. Candidate source parsing and validation.
4. Resume composition and localization.
5. LaTeX rendering and PDF compilation wrapper.
6. Tests, CI, and final documentation pass.

## Acceptance Criteria

- A fresh contributor can understand the project from `README.md`, `AGENTS.md`, and `docs/`.
- `arete init`, `arete validate`, and `arete build` work against the example candidate.
- Generated resume facts are derived from candidate source data.
- LaTeX output escapes candidate text.
- Missing local TeX tooling produces a useful diagnostic.
- Formatting, linting, type checking, tests, coverage, and build pass.

## Progress

- Documentation foundation completed.
- Toolchain bootstrap completed.
- Candidate parsing and validation completed for the MVP Markdown contract, including parse-safe STAR evidence notes in examples/templates.
- Resume composition and localization completed for deterministic English and `pt-BR` labels/date output.
- LaTeX rendering and PDF compilation wrapper completed.
- Tests, coverage, build, and CLI smoke validation completed.

## Validation

- `pnpm format:check`
- `pnpm lint` passes with two complexity warnings in `src/candidate/parser.ts` and `src/latex/render.ts`.
- `pnpm typecheck`
- `pnpm test:coverage`
- `pnpm build`
- `pnpm arete validate --source examples/candidate.example.md`
- `ARETE_SKIP_PDF_COMPILE=1 pnpm arete build --source examples/candidate.example.md --out dist/example`

Local TeX tooling is not installed in the current environment, so full PDF compilation was validated only through the missing-tool diagnostic path and the skip-enabled build path.
