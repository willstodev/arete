# Project Spec

Arete compiles structured candidate information into truthful resumes. Candidate-provided data is the only factual source of truth.

## MVP

- CLI commands for template creation, validation, and build.
- Guided Markdown candidate source format with STAR evidence prompts.
- Runtime validation into a typed canonical candidate model.
- Deterministic resume composition.
- English output by default.
- Explicit alternate locale support for section labels and date formatting.
- LaTeX generation and PDF compilation.
- One-page A4 resume output by default.
- ATS-oriented layout with selectable text and predictable reading order.
- Tests and CI for parser, validation, provenance, rendering, and CLI flows.

## Non-Goals

- Web editor, account system, hosting, database, collaboration, WYSIWYG design, many visual templates, job scraping, automatic application submission, enterprise multi-tenancy.
- Required LLM generation in the MVP.
- Fabricating or inferring unsupported facts from job descriptions.

## Inputs

- Candidate source Markdown.
- STAR evidence notes for important work: Situation, Task, Action, Result, and evidence status.
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
- STAR is the preferred evidence-gathering method, not permission to invent impact.
- Targeting and localization may change emphasis and wording but not truth.
- User text must be escaped before LaTeX rendering.
- Invalid or incomplete required source data must fail before rendering.

## Definition of Done

The MVP is done when the CLI can create a template, validate a sanitized example, generate `.tex`, compile `.pdf` in an environment with TeX, preserve provenance for resume facts, pass the documented quality gates, and provide useful documentation for a fresh contributor.

## STAR Method

Arete uses STAR as a structured evidence-gathering aid for writing concrete contributions and accomplishments. This does not imply endorsement of a specific template by an employer; see `docs/RESUME_AUDIT.md` for primary recruiting sources.

- Situation: the context, problem, or opportunity.
- Task: what the candidate was responsible for.
- Action: what the candidate personally did.
- Result: what changed afterward.

The generated resume should usually compress STAR into one concise bullet. If the Result is unknown, the bullet must still be truthful and should avoid fake metrics or inflated impact.

## Source Contract And Output Limits

- Front matter is YAML with `schemaVersion: 1` and optional supported locale (`en`, `pt-BR`, or the `pt` alias).
- Section names follow the generated template exactly; unknown or duplicate sections are errors.
- Identity requires a name and valid email. `init` never overwrites an existing file.
- Pipe-separated fields retain empty positions. Experience uses four positions, with an optional empty location; start/end dates accept `YYYY` or `YYYY-MM`, and end also accepts `Present`.
- Bullets after the `STAR evidence notes:` marker are notes, not resume claims.
- Source order is preserved. Fixed list budgets may omit later items with CLI warnings; the final PDF must be one page.
- `pt-BR` changes template labels and experience-date display; candidate prose is not translated.
