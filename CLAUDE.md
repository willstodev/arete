# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is the operational entrypoint (priorities, ExecPlan rules, Definition of Done, completion report format). Read it and the relevant `docs/` file (`PROJECT_SPEC.md`, `ARCHITECTURE.md`, `CONTENT_POLICY.md`, `LATEX.md`, `TESTING.md`, `SECURITY.md`) before substantial work. Substantial changes need an ExecPlan per `docs/PLANS.md` in `docs/exec-plans/active/`. Do not commit, push, or open PRs unless asked; use Conventional Commits.

## Commands

Node 24 (`.nvmrc`) and pnpm via `corepack enable`.

```bash
pnpm install
pnpm arete <init|validate|build> ...   # run CLI from source via tsx
pnpm build                             # tsc -> dist/ (the `arete` bin points at dist/src/cli/main.js)
pnpm format:check | pnpm lint | pnpm typecheck
pnpm test                              # vitest run
pnpm test:coverage
pnpm vitest run tests/unit/escape.test.ts          # single file
pnpm vitest run -t "name fragment"                 # single test by name
pnpm test:pdf                          # real PDF build + text extraction; needs pdftotext (Poppler)
```

Quality gate before finishing: format:check, lint, typecheck, test:coverage, build (CI also runs `pnpm audit`).

Typical manual flow: `pnpm arete init --output private/candidate.md`, then `validate --source ...`, then `build --source ... --out dist/resume [--locale pt-BR]`. Keep real candidate data in ignored paths (e.g. `private/`); only fictional fixtures live in `examples/`. The `/resume` project skill (`.claude/skills/resume/SKILL.md`) drives this flow end to end for the user's own resume.

## Architecture

A linear compiler pipeline, no LLM involved (AI is deliberately deferred; any future AI must be editorial-only and schema-validated against candidate facts):

candidate Markdown → `src/candidate` (YAML-only front matter, section/entity parser with `SourceRef` file/section/line provenance, zod schema → canonical model) → `src/resume/compose.ts` (deterministic composition + `localization.ts` for labels/dates at the model boundary) → `src/latex/render.ts` (escaping via `escape.ts`, source-order budgeting to fit one A4 page) → `src/latex/compile.ts` (PDF) → `pdf-lib` check that exactly one page results.

Cross-file points that are easy to miss:

- Resume items carry provenance references back to canonical fields; preserve this when adding output so every claim stays traceable.
- The parser is strict and positional: unknown/duplicate sections and malformed records are rejected, and only bullets before the STAR evidence marker (plus structured fields) are rendered. STAR notes never become claims by themselves. `src/candidate/template.ts` (the `init` template) and `prompts/*.prompt.md` must stay in sync with parser/schema changes.
- List budgets drop items silently-but-with-a-CLI-warning; content that still overflows one page fails compilation. Source order is the priority order.
- Compilation prefers the npm-managed Tectonic binary (`node-latex-compiler`), invoked with an argument array (never its shell wrapper) in a unique temp dir; falls back to system `tectonic`/`latexmk`/`pdflatex`. Stale `resume.pdf` is removed when compilation fails or is skipped. Missing tooling is an environment error, distinct from parse/render errors (`src/diagnostics/errors.ts`).
- All candidate text is untrusted for LaTeX; route it through the escaper.
- Locale changes labels and experience dates only, never prose. English is the default.

Tests live in `tests/{unit,integration,e2e}`; every bug fix should add a regression test.
