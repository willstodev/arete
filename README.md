# Arete

Arete is a resume compiler for structured candidate information. It turns a human-authored candidate source file into a truthful, ATS-friendly, human-readable resume as both LaTeX and PDF.

The project is CLI-first and deliberately small: no web app, account system, resume database, or cloud service is required for the MVP. The core idea is a compiler pipeline with explicit validation and provenance instead of free-form resume generation.

## Status

Greenfield bootstrap in progress. The current implementation provides the initial CLI, Markdown candidate parsing, validation, deterministic resume composition, LaTeX rendering, and a PDF compilation wrapper that reports missing local TeX tooling clearly.

## Goals

- preserve candidate-provided facts as the source of truth;
- generate selectable-text resumes suitable for ATS parsing;
- produce concise, professional human-readable output;
- keep the architecture maintainable, testable, and reproducible;
- make unsupported factual claims impossible to introduce silently.

## Usage

```bash
corepack enable
pnpm install
pnpm build

pnpm arete init --output candidate.md
pnpm arete validate --source candidate.md
pnpm arete build --source candidate.md --out dist/resume
```

`arete build` writes `resume.tex` and attempts to compile `resume.pdf` when `latexmk` or `pdflatex` is installed. English is the default locale; use `--locale pt-BR` for localized section labels and dates currently supported by the MVP.

## Architecture

```text
candidate Markdown
  -> parser with source references
  -> runtime validation
  -> canonical candidate model
  -> deterministic resume composition
  -> LaTeX rendering with escaping
  -> .tex and .pdf artifacts
```

LLM use is intentionally deferred. Future AI features must remain editorial-only and validate their output against candidate-provided facts.

## Quality Gates

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
```

See `docs/` for the product spec, architecture, testing strategy, security and privacy model, content policy, LaTeX constraints, and ExecPlan workflow.
