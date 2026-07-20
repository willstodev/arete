# Architecture

Arete is a Node.js TypeScript CLI with a linear compiler pipeline.

## Pipeline

1. Candidate Markdown is read from disk.
2. The parser extracts sections and repeated entities with source references.
3. Runtime schemas validate parsed data into a canonical candidate model.
4. The composer creates a resume model from canonical facts and build options.
5. The LaTeX renderer escapes all candidate text and writes `resume.tex`.
6. The compiler invokes `latexmk` or `pdflatex` to produce `resume.pdf`.

## Boundaries

- `src/candidate`: Markdown parsing, canonical schema, source references.
- `src/resume`: deterministic resume composition and localization.
- `src/latex`: escaping, template rendering, PDF compilation.
- `src/cli`: command parsing and user-facing diagnostics.
- `src/config`: environment validation.
- `src/diagnostics`: shared error formatting.

## Provenance

Canonical facts include `SourceRef` values with file, section, and line information where practical. Resume items carry provenance references to the canonical fields they came from. This keeps generated claims inspectable and testable without a heavyweight claim database.

## STAR Evidence

Candidate source files should capture STAR evidence for important work:

- Situation;
- Task;
- Action;
- Result;
- Evidence status.

The current MVP renders only bullet lines and supported structured fields. STAR evidence notes are still valuable source material for future composition and AI-assisted editing, but they must never create a factual claim unless the underlying candidate source supports it.

## Localization

Localization uses BCP 47 locale identifiers. The MVP localizes section labels and date display at the resume model boundary. Proper nouns, technologies, employers, credentials, and chronology remain unchanged.

## AI

AI is absent from the MVP. A future AI component may only rewrite or prioritize validated facts and must return structured output that can be schema-validated and checked against provenance.

## Errors

Validation and build errors should name the failing file or tool and explain the corrective action. Missing TeX tools are reported as environment failures, not as parser or renderer failures.
