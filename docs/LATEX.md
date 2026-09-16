# LaTeX And PDF

The resume template prioritizes ATS readability, selectable text, restrained typography, and predictable reading order.

## Template Rules

- Use simple semantic headings.
- Avoid charts, icons replacing text, skill bars, images for text, and decorative multi-column complexity.
- Keep text selectable.
- Escape all candidate-provided text.
- Keep generated artifacts outside source control by default.
- Fit the generated resume on one A4 page. If rendered content exceeds one page, compilation must fail rather than silently producing a multi-page resume.
- Follow the single-column resume style: centered name/contact header, compact black-and-white typography, section headings with thin rules, right-aligned location/date metadata, and dense ATS-readable bullets.
- Apply deterministic one-page budgeting for long lists. Skills, bullets, and technology lists preserve candidate source order and may omit lower-priority overflow items, but rendered claims must never be rewritten into unsupported facts.

## Toolchain

`arete build` writes `resume.tex`, then discovers a compiler in this order:

1. Tectonic runtime binary supplied by `node-latex-compiler` optional npm packages;
2. system `tectonic`;
3. system `latexmk`;
4. system `pdflatex` (two passes to resolve page references).

Arete resolves the npm binary without invoking the dependency's shell-based compilation wrapper. All processes use argument arrays and unique temporary directories. Tectonic uses `--untrusted`; system engines disable shell escape, and `latexmk` ignores RC files. TeX file access is restricted where supported. Each process has a 120-second timeout and bounded captured diagnostics. Compilation errors remain errors; fallback discovery applies when binaries are absent, not to conceal invalid LaTeX.

`pdf-lib` reads the actual page tree, including compressed objects, and requires exactly one page. Only validated output is copied to the destination. Stale PDFs are removed when compilation starts or is explicitly skipped. The `.tex` file remains for diagnosis. First-use Tectonic may download TeX support files and therefore require network access.

Body text uses the declared 10pt size. List budgets preserve the first 24 skills, 4 bullets/14 technologies per experience, and 2 bullets/8 technologies per project. The CLI warns about each omitted group. These are item limits, not a measurement-based layout algorithm; long text can still exceed one page and must be edited by the candidate.

## Smoke Testing

After `pnpm build`, run `pnpm test:pdf` with `pdftotext` from Poppler on PATH. This compiles the synthetic example concurrently in English and Portuguese, asserts one-page A4 dimensions, checks extracted contact/facts and section order, and verifies actual oversized content is rejected. CI installs Poppler and runs this command without the skip flag.
