# Architecture

Arete is a Node.js TypeScript CLI with a linear compiler pipeline.

## Pipeline

1. Candidate Markdown is read from disk; a YAML-only front-matter parser validates metadata without executable engines.
2. The parser extracts sections and repeated entities with source references.
3. Runtime schemas validate parsed data into a canonical candidate model.
4. The composer creates a resume model from canonical facts and build options.
5. The LaTeX renderer escapes all candidate text, applies deterministic one-page source-order budgeting and the single-column A4 style, and writes `resume.tex`.
6. The compiler resolves the npm-managed Tectonic runtime and invokes it with an argument array in a unique temporary directory. If unavailable, discovery falls back to system `tectonic`, `latexmk`, or `pdflatex`. The npm shell wrapper is never invoked.
7. `pdf-lib` validates the resulting page tree and requires exactly one page before publishing `resume.pdf`. Compilation/skip removes stale PDF output; intermediate files are cleaned on success or failure.

## Boundaries

- `src/candidate`: Markdown parsing, canonical schema, source references.
- `src/resume`: deterministic resume composition and localization.
- `src/latex`: escaping, template rendering, PDF compilation.
- `src/cli`: command parsing and user-facing diagnostics.
- `src/config`: environment validation.
- `src/diagnostics`: shared error formatting.

## Provenance

Canonical facts include `SourceRef` values with file, section, and original-file line information (including front matter). Resume items carry provenance references to the canonical fields they came from. This keeps generated claims inspectable and testable without a heavyweight claim database.

## STAR Evidence

Candidate source files should capture STAR evidence for important work:

- Situation;
- Task;
- Action;
- Result;
- Evidence status.

The current MVP renders only bullet lines before the STAR evidence marker and supported structured fields. Unknown/duplicate sections and malformed positional records are rejected. STAR evidence notes are still valuable source material for future composition and AI-assisted editing, but they must never create a factual claim unless the underlying candidate source supports it.

## Localization

Localization uses BCP 47 locale identifiers. The MVP localizes section labels and date display at the resume model boundary. Proper nouns, technologies, employers, credentials, and chronology remain unchanged.

## AI

AI is absent from the MVP. A future AI component may only rewrite or prioritize validated facts and must return structured output that can be schema-validated and checked against provenance.

## Errors

Validation and build errors should name the failing file or tool and explain the corrective action. Missing PDF compiler tooling is reported as an environment failure, not as a parser or renderer failure. The default compiler path is installed through npm dependencies rather than host distribution packages.
