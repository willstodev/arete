# Content Policy

Candidate-provided information is the factual source of truth.

## Allowed

- Reorder sections and bullets.
- Improve wording for clarity and concision.
- Convert supported source details into concise STAR-style bullets.
- Summarize supported responsibilities.
- Translate or localize labels and phrasing.
- Emphasize facts relevant to a target role.

## Forbidden

- Invent employers, dates, titles, credentials, skills, technologies, metrics, responsibilities, achievements, team sizes, business impact, or qualifications.
- Convert vague participation into leadership unless leadership is explicitly supported.
- Add job-description keywords as experience when absent from candidate data.
- Treat LLM output as trusted domain state.

## STAR Method

STAR is the preferred structure for strong resume bullets:

- Situation: what problem or context existed.
- Task: what the candidate was responsible for.
- Action: what the candidate did.
- Result: what changed, using a metric only when the candidate provided one.

Allowed:

```text
Built runtime validation for customer-facing API payloads, producing clearer client errors for invalid requests.
```

Forbidden unless the candidate explicitly provided the metric:

```text
Built runtime validation that reduced support tickets by 45%.
```

When only Situation, Task, and Action are known, write a contribution bullet without overstating Result.

## Enforcement

- Runtime schemas reject invalid candidate input.
- Resume facts are composed from canonical data, not free text generation.
- Resume items preserve provenance references.
- STAR notes may guide wording but unsupported Result or Evidence fields must not be manufactured.
- Tests cover unsupported metrics, technologies, dates, and LaTeX escaping.

## Localization

Localization must preserve facts. Dates and section labels may adapt to locale conventions; proper nouns and technology names remain as supplied unless the candidate explicitly provides localized variants.
