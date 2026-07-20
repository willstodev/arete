# LaTeX And PDF

The resume template prioritizes ATS readability, selectable text, restrained typography, and predictable reading order.

## Template Rules

- Use simple semantic headings.
- Avoid charts, icons replacing text, skill bars, images for text, and decorative multi-column complexity.
- Keep text selectable.
- Escape all candidate-provided text.
- Keep generated artifacts outside source control by default.

## Toolchain

`arete build` first writes `resume.tex`, then tries:

1. the npm-managed `node-latex-compiler` dependency, which provides Tectonic through npm optional runtime packages;
2. `latexmk -pdf -interaction=nonstopmode -halt-on-error resume.tex`;
3. `pdflatex -interaction=nonstopmode -halt-on-error resume.tex`.

The primary path is intentionally installed by `pnpm install` and does not require Linux distribution packages such as `texlive`, `latexmk`, or `pdflatex`. If no compiler path is available, the command reports the missing environment requirement and leaves the `.tex` artifact intact.

## Smoke Testing

CI should run the npm-managed compiler against the example resume. When practical, use `pdftotext` as a pragmatic signal that the PDF contains extractable text.
