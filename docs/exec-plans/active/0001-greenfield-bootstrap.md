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
- PDF compilation works through npm-installed tooling, with a useful diagnostic if no compiler path is available.
- Formatting, linting, type checking, tests, coverage, and build pass.

## Progress

- Documentation foundation completed.
- Toolchain bootstrap completed.
- Candidate parsing and validation completed for the MVP Markdown contract, including parse-safe STAR evidence notes in examples/templates.
- Resume composition and localization completed for deterministic English and `pt-BR` labels/date output.
- LaTeX rendering and npm-managed PDF compilation wrapper completed, with system `latexmk`/`pdflatex` fallbacks retained.
- Tests, coverage, build, and CLI smoke validation completed.

## Decisions

- PDF compilation should not require Linux distribution packages by default. Arete uses the npm dependency `node-latex-compiler`, which supplies Tectonic through npm optional runtime packages. System `latexmk` and `pdflatex` remain fallback paths for environments that already provide them.

## Validation

- `pnpm format:check`
- `pnpm lint` passes with two complexity warnings in `src/candidate/parser.ts` and `src/latex/render.ts`.
- `pnpm typecheck`
- `pnpm test:coverage`
- `pnpm build`
- `pnpm arete validate --source examples/candidate.example.md`
- `ARETE_SKIP_PDF_COMPILE=1 pnpm arete build --source examples/candidate.example.md --out dist/example`

Local distribution TeX tooling is not installed in the current environment. Full PDF compilation is validated through the npm-managed compiler path installed by `pnpm install`.
