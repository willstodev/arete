# AGENTS.md

## Mission

This repository contains **Arete**, a resume compiler designed to transform structured candidate information into truthful, ATS-friendly, human-readable resumes.

Agents working in this repository are responsible for producing complete engineering outcomes, not isolated code fragments.

The system must optimize for:

1. factual integrity;
2. ATS readability;
3. human readability;
4. maintainability;
5. testability;
6. reproducibility;
7. pragmatic simplicity.

Strong presentation is encouraged.

Fabrication is forbidden.

---

## Core Invariant

Candidate-provided information is the factual source of truth.

The system may:

- select;
- prioritize;
- reorganize;
- rewrite;
- summarize;
- translate;
- localize;
- adapt emphasis for a target role.

The system must never invent:

- experience;
- employers;
- responsibilities;
- technologies;
- achievements;
- credentials;
- metrics;
- team sizes;
- business impact;
- dates;
- qualifications.

Job targeting may change emphasis.

It must never change truth.

If a statement cannot be supported by candidate-provided data, it must not appear as a factual claim in the generated resume.

---

## Sources of Truth

Before substantial work, inspect the relevant repository documentation.

Priority order:

1. explicit instructions from the current user/task;
2. `docs/PROJECT_SPEC.md`;
3. active ExecPlan under `docs/exec-plans/active/`;
4. `docs/ARCHITECTURE.md`;
5. specialized documentation under `docs/`;
6. existing tests;
7. existing implementation.

When documentation and implementation disagree:

- determine the intended current behavior;
- fix stale documentation or stale implementation as part of the work when appropriate;
- record important decisions in the active ExecPlan.

Do not silently invent product requirements when documented requirements exist.

---

## Working Autonomously

Make safe, reversible engineering decisions without blocking on unnecessary questions.

Prefer established repository conventions and the simplest coherent solution.

Ask for user input only when progress is genuinely blocked by information that cannot be safely inferred, such as:

- contradictory product requirements;
- irreversible destructive actions;
- missing credentials or inaccessible external systems;
- legal/compliance decisions;
- materially different business choices with no documented preference.

If one part of a task is blocked, continue all unblocked work.

Do not stop merely to ask whether you should continue.

---

## Planning

Small, local, low-risk changes may be implemented directly.

Create or update an ExecPlan according to `docs/PLANS.md` for substantial work.

Substantial work includes:

- greenfield bootstrap;
- new end-to-end product capabilities;
- architecture changes;
- candidate model/schema changes;
- content-generation pipeline changes;
- localization architecture;
- LaTeX/PDF compilation changes;
- external AI/provider integrations;
- CI or release infrastructure;
- significant refactors;
- tasks spanning several components or milestones.

ExecPlans are living documents.

Keep them updated as implementation progresses.

---

## Implementation Workflow

For substantial work, follow this loop:

### 1. Understand

Read the task, relevant documentation, tests, and existing code.

Do not make architectural assumptions before inspecting the repository.

### 2. Plan

Define the smallest coherent sequence of milestones that produces a working outcome.

Create or update an ExecPlan when required.

### 3. Implement

Implement one coherent milestone at a time.

Prefer vertical slices over disconnected layers.

### 4. Validate

Run all relevant checks.

When available, this includes:

- formatting;
- linting;
- type checking;
- unit tests;
- integration tests;
- end-to-end tests;
- coverage;
- production build;
- LaTeX compilation;
- PDF generation smoke tests.

### 5. Repair

If validation fails:

- diagnose the root cause;
- fix it;
- rerun validation.

Do not leave failures introduced by the current work.

### 6. Document

Update documentation when behavior, architecture, commands, configuration, schemas, APIs, or important decisions change.

### 7. Continue

Move to the next incomplete milestone.

Do not stop after describing remaining work that can reasonably be completed now.

---

## Engineering Standards

### TypeScript

- Use strict TypeScript.
- Avoid `any`.
- Prefer precise domain types.
- Validate untrusted runtime input.
- Keep important architectural boundaries explicit.
- Do not suppress type errors without a documented reason.

### Naming

Default naming conventions:

- files: `kebab-case`;
- directories: `kebab-case`;
- variables/functions: `camelCase`;
- classes/types/interfaces/enums: `PascalCase`;
- constants: use the repository convention appropriate to the context.

Ecosystem-required filenames may follow ecosystem conventions.

### Code Quality

Prefer:

- explicit dependencies;
- clear module boundaries;
- high cohesion;
- low coupling;
- small focused units;
- composition;
- boring, stable technology;
- deterministic behavior where practical.

Avoid:

- speculative abstractions;
- premature framework layers;
- hidden global state;
- duplicated sources of truth;
- unnecessary dependency additions;
- architecture theater.

### Dependencies

Before adding a dependency:

1. check whether the platform or current dependencies already solve the problem;
2. prefer mature and maintained packages;
3. avoid large dependencies for trivial functionality;
4. consider security, maintenance, and bundle/runtime cost.

---

## Linting and Formatting

Formatting and linting rules should be automated.

Prefer rules that detect real problems in:

- correctness;
- type safety;
- asynchronous behavior;
- maintainability;
- imports;
- complexity;
- unsafe patterns.

Avoid accumulating stylistic rules that add ceremony without meaningful value.

Do not bypass linting or formatting gates merely to make CI pass.

---

## Testing

Tests should verify behavior and invariants.

Use the appropriate level:

- unit tests for isolated domain logic;
- integration tests for boundaries;
- end-to-end tests for critical generation flows;
- fixtures/golden files when they provide stable regression value.

Critical areas include:

- Markdown parsing;
- schema validation;
- canonical candidate-model construction;
- factual integrity;
- target-role prioritization;
- localization;
- LaTeX escaping;
- template rendering;
- PDF compilation;
- failure modes.

Every bug fix should add a regression test when reasonably possible.

Coverage is a quality signal, not a substitute for meaningful assertions.

Do not game coverage thresholds.

---

## Factual Integrity

Factual integrity is a first-class architectural concern.

The codebase should make provenance and grounding inspectable where practical.

Prefer architecture that separates:

1. candidate source data;
2. validated canonical data;
3. derived deterministic data;
4. generated editorial language;
5. rendered document output.

A generated factual claim must be supportable by candidate-provided data.

Do not rely solely on prompts such as "do not hallucinate."

Use software constraints, schemas, validation, structured outputs, traceability, and tests wherever practical.

---

## AI and Generated Content

An LLM, when used, is an editorial component, not the source of truth.

LLM output must remain constrained by validated candidate data.

Do not:

- let model output directly become trusted domain state without validation;
- allow generated metrics or achievements without evidence;
- silently infer credentials;
- introduce technologies absent from the source data;
- optimize keyword matching by falsifying experience.

Prefer deterministic transformations when AI is unnecessary.

Provider abstraction should only exist when it provides concrete value.

---

## Localization

English is the default output language unless the user explicitly requests another locale.

Localization may adapt:

- section labels;
- date formatting;
- conventional resume terminology;
- sentence structure.

Localization must preserve:

- facts;
- proper nouns when appropriate;
- technologies;
- product names;
- metrics;
- dates and chronology.

Translation must never introduce new claims.

---

## LaTeX and PDF

Generated resumes must prioritize:

1. ATS readability;
2. human readability;
3. professional visual quality.

Prefer:

- simple semantic structure;
- selectable text;
- conventional section headings;
- predictable reading order;
- restrained formatting;
- reliable compilation.

Avoid unnecessary:

- multi-column complexity;
- decorative graphics;
- charts;
- skill bars;
- icons replacing meaningful text;
- layouts that harm extraction order.

Treat user-provided text as untrusted input for LaTeX rendering.

Escape or otherwise safely handle content that could break compilation or introduce LaTeX injection.

---

## Environment and Secrets

Use environment variables for secrets and external configuration.

Requirements:

- validate configuration at startup or command execution;
- provide `.env.example`;
- never commit real secrets;
- produce useful errors when required configuration is missing.

Real candidate data should not be committed to the public repository by default.

Use sanitized example fixtures and templates.

---

## Git

Use Conventional Commits.

Do not:

- rewrite shared history;
- commit secrets;
- use destructive Git commands without explicit need;
- create commits, push branches, or open pull requests unless explicitly requested.

Git hooks and commit-message tooling should exist only when they provide clear enforcement value without unnecessary ceremony.

---

## CI

CI should enforce the repository's actual quality gates.

When available, expected checks include:

- dependency installation;
- formatting verification;
- linting;
- type checking;
- tests;
- coverage;
- build;
- resume-generation smoke test;
- LaTeX/PDF compilation where supported by the chosen architecture.

Do not claim CI readiness unless the configured checks actually run successfully.

---

## Scope Discipline

Complete the requested outcome fully, but avoid unrelated rewrites.

Adjacent changes are justified when required for:

- correctness;
- security;
- factual integrity;
- maintainability;
- successful validation.

Record non-blocking technical debt rather than expanding scope indefinitely.

---

## Definition of Done

A task is not complete merely because code exists.

Before declaring substantial work complete, verify all applicable criteria.

### Functionality

- Requested behavior works end-to-end.
- Acceptance criteria are satisfied.
- Important edge cases are handled.
- Failure states are intentional and understandable.

### Factual Integrity

- Generated claims remain grounded in source data.
- No unsupported factual content is introduced.
- Targeting/localization does not mutate truth.

### Code Quality

- Code follows repository conventions.
- Types are accurate.
- Dead code and debugging artifacts are removed.
- Complexity is justified.
- Dependencies are justified.

### Validation

Run all applicable checks and report actual results.

Do not claim a check passed unless it was executed successfully.

If a check cannot run, state exactly why.

### Documentation

Update relevant documentation so a fresh contributor or agent can understand:

- what changed;
- how to run it;
- how to test it;
- relevant architecture;
- relevant configuration.

### Repository Hygiene

Do not leave:

- temporary scripts without purpose;
- commented-out implementations;
- debug logging;
- unused dependencies;
- unexplained TODOs;
- generated secrets;
- real private candidate data;
- stale documentation introduced by the change.

---

## Completion Report

At the end of substantial work, provide a concise factual report containing:

### Implemented

What changed and what outcome now works.

### Architecture

Important technical decisions or structural changes.

### Validation

Exact checks run and their results.

### Remaining Issues

Only genuine known limitations, external blockers, or intentionally deferred items.

Do not list hypothetical enhancements as unfinished work.

Do not call the project production-ready unless relevant production requirements have actually been validated.

---

## Repository Documentation

Read these files when they exist:

- `docs/PROJECT_SPEC.md` — product scope, requirements, workflows, invariants, acceptance criteria.
- `docs/ARCHITECTURE.md` — components, boundaries, data flow, schemas, technical decisions.
- `docs/PLANS.md` — rules for creating and maintaining ExecPlans.
- `docs/TESTING.md` — testing strategy, commands, coverage policy, fixtures.
- `docs/SECURITY.md` — secrets, personal data, threat model, unsafe input handling.
- `docs/CONTENT_POLICY.md` — factual integrity, editorial constraints, localization/content rules.
- `docs/LATEX.md` — rendering, templates, compilation, escaping, ATS constraints.
- `docs/exec-plans/active/` — active implementation plans.
- `docs/exec-plans/completed/` — completed historical plans.
- `docs/decisions/` — durable architectural decisions when ADRs are justified.

Do not duplicate detailed documentation inside this file.

This file is the operational entrypoint.

Specialized documentation should hold specialized knowledge.
