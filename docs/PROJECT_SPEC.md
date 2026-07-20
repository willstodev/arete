# Project Spec

Arete compiles structured candidate information into truthful resumes. Candidate-provided data is the only factual source of truth.

## MVP

- CLI commands for template creation, validation, and build.
- Guided Markdown candidate source format.
- Runtime validation into a typed canonical candidate model.
- Deterministic resume composition.
- English output by default.
- Explicit alternate locale support for section labels and date formatting.
- LaTeX generation and PDF compilation.
- ATS-oriented layout with selectable text and predictable reading order.
- Tests and CI for parser, validation, provenance, rendering, and CLI flows.

## Non-Goals

- Web editor, account system, hosting, database, collaboration, WYSIWYG design, many visual templates, job scraping, automatic application submission, enterprise multi-tenancy.
- Required LLM generation in the MVP.
- Fabricating or inferring unsupported facts from job descriptions.

## Inputs

- Candidate source Markdown.
- Optional build options such as locale and output directory.
- Optional job description is deferred until the targeting milestone.

## Outputs

- `resume.tex`
- `resume.pdf` when local TeX tooling is available
- validation diagnostics for invalid source data

## CLI Contract

- `arete init [--output candidate.md]`
- `arete validate --source ./candidate.md`
- `arete build --source ./candidate.md --out ./dist/resume [--locale en|pt-BR]`

## Invariants

- Generated factual claims must be supported by candidate source data.
- Targeting and localization may change emphasis and wording but not truth.
- User text must be escaped before LaTeX rendering.
- Invalid or incomplete required source data must fail before rendering.

## Definition of Done

The MVP is done when the CLI can create a template, validate a sanitized example, generate `.tex`, compile `.pdf` in an environment with TeX, preserve provenance for resume facts, pass the documented quality gates, and provide useful documentation for a fresh contributor.
