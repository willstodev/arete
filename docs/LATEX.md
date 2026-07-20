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

1. `latexmk -pdf -interaction=nonstopmode -halt-on-error resume.tex`
2. `pdflatex -interaction=nonstopmode -halt-on-error resume.tex`

If neither exists, the command reports how to install TeX and leaves the `.tex` artifact intact.

## Smoke Testing

CI should install a minimal TeX distribution when practical, build the example resume, and use `pdftotext` as a pragmatic signal that the PDF contains extractable text.
