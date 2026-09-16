# 0002 Resume, Privacy, And Reliability Audit

## Objective

Assess resume suitability against primary recruiting guidance, anonymize public examples and documentation, fix confirmed defects, validate the actual PDF pipeline, and publish a branch and pull request using `gh`.

## Scope And Milestones

1. Inspect repository, baseline tests, dependencies, and published employer guidance.
2. Repair unsafe parsing/compilation, factual-data corruption, privacy defaults, and localization/rendering defects with regression tests.
3. Exercise real PDF creation and extraction; make CI enforce this smoke test.
4. Record findings, evidence, limitations, and exact validation results; commit, push, and open a PR.

## Acceptance Criteria

- Untrusted Markdown cannot execute code; paths never enter a shell command.
- Missing fields cannot shift candidate facts, and provenance uses original file lines.
- Existing candidate files cannot be overwritten by `init`.
- Public candidate examples and template descriptions contain neutral sample identifiers.
- Real one-page PDFs are validated structurally; text extraction is checked in CI.
- All documented quality gates pass without lowering coverage thresholds.
- Recruiting claims distinguish general guidance from endorsement of this exact template.

## Decisions

- Interpret anonymization as sanitizing repository content; no inference that automatic anonymization of arbitrary free text is reliable. Git history is not rewritten.
- Keep the documented one-page product constraint. Document its limits for long careers and academic CVs.
- Replace executable front-matter engine dispatch with YAML-only parsing and runtime metadata validation.
- Use the existing npm runtime binaries through shell-free process execution, avoiding the wrapper's shared intermediate directory and shell interpolation.
- Add a PDF parser because regex counting cannot validate compressed PDF page objects.

## Progress

- Baseline: all 16 tests pass; no real PDF test exists. CI skips PDF compilation.
- Confirmed: executable JavaScript front matter, two high YAML dependency advisories, shell interpolation of compiler paths, destructive init, shifted empty pipe fields, body-relative provenance, summary truncation, invalid month rollover, incomplete localization, and personal reference-style naming.
- Implemented YAML-only metadata parsing, lossless field positions, original-file provenance, summary preservation, strict date/locale validation, and STAR-note exclusion.
- Implemented shell-free isolated compilation, real PDF page-tree validation, stale-output cleanup, and safe init creation.
- Sanitized public examples/template references; restored 10pt body text, localized labels, separated records, and exposed budget omissions.
- Added 50 passing tests plus a real concurrent English/Portuguese PDF and overflow smoke. Production and development dependency audits are clean after compatible updates.
- Documented employer evidence and practical limits in `docs/RESUME_AUDIT.md`.
- Final publication pending commit, push, and PR creation.

## Validation

- `pnpm lint`: passes, with the two complexity warnings in the existing parser/renderer functions (no errors).
- `pnpm typecheck`: passes.
- `pnpm test:coverage`: 50 tests pass; statements 95.95%, branches 85.65%, functions 97.72%, lines 96.38%. Thresholds unchanged.
- `pnpm build`: passes.
- `pnpm audit`: no known vulnerabilities (including development dependencies).
- `pnpm test:pdf`: actual concurrent English/Portuguese one-page A4 PDFs pass extracted contact/fact/section-order checks; actual oversized content fails and publishes no PDF.
- English PDF visually reviewed at 10pt body size. English/Portuguese PDFs also independently inspected with PyMuPDF.
- Local Poppler was unpacked under `/tmp/arete-poppler` because system installation requires an unavailable sudo password. Smoke command uses that directory on PATH and its library directory in LD_LIBRARY_PATH; CI installs `poppler-utils` normally.
- `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm arete validate --source examples/candidate.example.md`, and `git diff --check`: pass.
- Repository diff reviewed; no private sources or generated resumes are included.
- Publication remains the final milestone.
