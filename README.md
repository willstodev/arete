# Arete

Arete is a resume compiler for structured candidate information. It turns a human-authored candidate source file into a truthful, ATS-friendly, human-readable resume as both LaTeX and PDF.

The project is CLI-first and deliberately small: no web app, account system, resume database, or cloud service is required for the MVP. The core idea is a compiler pipeline with explicit validation, provenance, and STAR-style evidence gathering instead of free-form resume generation.

## Status

The CLI supports guided Markdown input, validation, deterministic resume composition, and one-page A4 LaTeX/PDF generation. See [the resume audit](docs/RESUME_AUDIT.md) for recruiting-source evidence, confirmed repairs, and limitations. No employer endorsement or universal ATS compatibility is claimed.

## Goals

- preserve candidate-provided facts as the source of truth;
- encourage STAR-style evidence: Situation, Task, Action, Result;
- generate selectable-text resumes suitable for ATS parsing;
- produce concise, professional human-readable output;
- keep the architecture maintainable, testable, and reproducible;
- make unsupported factual claims impossible to introduce silently.

## Usage

```bash
corepack enable
pnpm install
pnpm build

pnpm arete init --output private/candidate.md
# Fill in your facts and remove unused placeholder sections before validation.
pnpm arete validate --source private/candidate.md
pnpm arete build --source private/candidate.md --out dist/resume
```

`arete build` writes `resume.tex` and compiles `resume.pdf` through the npm-managed LaTeX compiler installed by `pnpm install`. The binary runs without a shell in an isolated temporary directory. System `tectonic`, `latexmk`, or `pdflatex` are used when the bundled binary is unavailable. English is the default locale; use `--locale pt-BR` for localized section labels and dates currently supported by the MVP.

`init` refuses to overwrite an existing file. The supplied example is explicitly fictional; private sources and generated output should remain in ignored paths. This repository does not provide an automatic anonymous-resume exporter.

Use the generated template's exact section names and field positions. Experience dates accept `YYYY` or `YYYY-MM`, with `Present` for an ongoing role. Put experience in reverse chronological order and list your most relevant bullets first: source order is preserved, and the CLI warns when fixed list budgets omit items. Content that still exceeds one page fails compilation. Locale changes affect labels and experience dates; they do not translate prose.

## Architecture

```text
candidate Markdown
  -> STAR evidence notes
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
pnpm audit
# Requires pdftotext (Poppler); builds real PDFs and tests text extraction.
pnpm test:pdf
```

See `docs/` for the product spec, architecture, testing strategy, security and privacy model, content policy, LaTeX constraints, and ExecPlan workflow.
