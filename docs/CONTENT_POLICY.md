# Content Policy

Candidate-provided information is the factual source of truth.

## Allowed

- Reorder sections and bullets.
- Improve wording for clarity and concision.
- Summarize supported responsibilities.
- Translate or localize labels and phrasing.
- Emphasize facts relevant to a target role.

## Forbidden

- Invent employers, dates, titles, credentials, skills, technologies, metrics, responsibilities, achievements, team sizes, business impact, or qualifications.
- Convert vague participation into leadership unless leadership is explicitly supported.
- Add job-description keywords as experience when absent from candidate data.
- Treat LLM output as trusted domain state.

## Enforcement

- Runtime schemas reject invalid candidate input.
- Resume facts are composed from canonical data, not free text generation.
- Resume items preserve provenance references.
- Tests cover unsupported metrics, technologies, dates, and LaTeX escaping.

## Localization

Localization must preserve facts. Dates and section labels may adapt to locale conventions; proper nouns and technology names remain as supplied unless the candidate explicitly provides localized variants.
