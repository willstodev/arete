---
name: resume
description: Build or update the user's real resume with Arete, step by step. Collects facts from public profile URLs and a STAR interview, writes private/candidate.md, validates, and compiles the PDF. Use for "make my resume", "update my CV", "/resume", or tailoring to a job.
argument-hint: "[profile URLs | job description | step name]"
---

# Arete resume workflow

Drive the user through one step at a time. Finish a step, say what's next in one line, and stop if you need their input. Follow `AGENTS.md` factual-integrity rules and `prompts/cv-star-intake.prompt.md` (interview questions, evidence strength, bullet style, banned phrases). Read that prompt before step 4.

Hard rules:

- Real data lives only in `private/` (git-ignored). Never write it to `examples/`, `tests/`, docs, or commits.
- Only write facts that a fetched page, pasted text, or the user's answer states. Never invent or estimate dates, metrics, team sizes, impact, or titles. If a fact is missing, ask, or omit it.
- Keep a running list in `private/sources.md`: each fact you added → where it came from (URL, "pasted LinkedIn", "user answer"), plus open questions.

## Steps

1. **Setup** (skip what's done): `corepack enable`, `pnpm install`. If `private/candidate.md` doesn't exist, run `pnpm arete init --output private/candidate.md`. `init` refuses to overwrite.
2. **Collect sources.** Ask for the website, GitHub, and LinkedIn URLs, the target role or job description, and the locale (`en` default, or `pt-BR`). Fetch the website and GitHub with WebFetch. For GitHub, also try `https://api.github.com/users/<user>` and `.../repos?sort=pushed&per_page=30`, then the READMEs of relevant repos. LinkedIn normally blocks fetching: try once, and if you hit a login wall, ask the user to paste the About, Experience, Education, Certifications, and Languages sections.
3. **Draft.** Fill `private/candidate.md` following the template's exact section names and positional formats. Use `examples/candidate.example.md` as the format reference only, never its content. Rules:
   - experience header is `### Title | Employer | YYYY[-MM] - YYYY[-MM]|Present | Location`, in reverse chronological order;
   - order bullets from most to least relevant, because list budgets drop items from the end;
   - put STAR notes under `STAR evidence notes:` after the bullets;
   - delete unused placeholder sections.
4. **STAR interview.** Ask about the gaps in `private/sources.md`, 2–4 questions at a time, role by role. Cover missing dates, what they personally did, and results or metrics they actually know. Rewrite bullets as Action + context/technology + result (result only if stated). Classify weak evidence as responsibility bullets.
5. **Validate**: `pnpm arete validate --source private/candidate.md`. Fix format errors yourself. Ask the user about content errors.
6. **Build**: `pnpm arete build --source private/candidate.md --out private/out [--locale pt-BR]`. If it warns that items were omitted, show which ones and let the user reorder or cut. If it fails for exceeding one page, propose specific cuts. Never shrink fonts or margins.
7. **Review.** Extract the text with `pdftotext private/out/resume.pdf -` if available, and show it. List the facts that still need confirmation and the claims you weakened or omitted for lack of evidence.

## Tailoring to a job (later runs)

When given a job description: keep the facts unchanged and reorder skills, bullets, and the summary toward the supported overlap. Update `## Targeting Notes`, then rebuild. Name the job keywords that the evidence doesn't support, and don't add them.

Begin at the first incomplete step, based on $ARGUMENTS and the state of `private/`.
