# Arete — Initial Planning Prompt

We are starting a completely greenfield software project called **Arete**.

The current repository may contain only this prompt, `AGENTS.md`, and possibly a minimal `README.md`.

Do not implement application code yet.

Your responsibility in this Plan Mode session is to design the product and engineering foundation that future Codex sessions will use to build the project correctly from scratch.

Read `AGENTS.md` first.

Treat it as the durable operating rules for this repository.

Do not blindly accept assumptions in this prompt. Challenge weak choices, detect overengineering, and propose better alternatives when justified.

---

# 1. Product Objective

Arete is a resume compiler.

It transforms structured candidate information into a high-quality resume and generates:

- a `.tex` document;
- a compiled `.pdf`.

English is the default output language.

The user must be able to explicitly request another output language.

The product exists to help a candidate compete effectively for job opportunities while preserving factual integrity.

The resulting resume must be:

- truthful;
- ATS-readable;
- human-readable;
- concise;
- professionally compelling;
- natural rather than AI-generic;
- grounded exclusively in candidate-provided facts.

The system must strongly avoid:

- hallucinated experience;
- invented technologies;
- invented metrics;
- invented achievements;
- invented responsibilities;
- invented credentials;
- keyword stuffing;
- generic AI hyperbole;
- unnatural corporate language.

The system may improve:

- wording;
- organization;
- prioritization;
- emphasis;
- translation;
- localization;
- clarity.

It must never improve the candidate by inventing facts.

---

# 2. Product Positioning

The project should be understandable as:

> A resume compiler built for humans and hiring systems.

The core conceptual pipeline is approximately:

```text
candidate source
    ↓
parse
    ↓
validate
    ↓
canonical candidate model
    ↓
resume composition / targeting / localization
    ↓
resume model
    ↓
LaTeX rendering
    ↓
.tex
    ↓
PDF
```

Evaluate this architecture critically.

Do not preserve it merely because it was suggested.

The project should remain small and focused.

Avoid unnecessary:

- web applications;
- databases;
- authentication;
- microservices;
- distributed systems;
- infrastructure that does not directly support the product.

A CLI-first interface is currently preferred unless a clearly better approach exists.

---

# 3. Candidate Source of Truth

The initial idea is to use a guided Markdown file containing questions the candidate fills out.

Examples:

- identity;
- location;
- contact information;
- professional links;
- career goals;
- work experience;
- responsibilities;
- problems solved;
- technologies;
- achievements;
- explicitly known metrics;
- projects;
- education;
- certifications;
- skills;
- languages.

The Markdown file should be easy for a human to complete.

The candidate should not need to understand resume-writing techniques to provide useful source data.

Evaluate:

- whether Markdown is the correct primary authoring format;
- how questions should be structured;
- how repeated entities such as work experiences should be represented;
- how the file should be parsed;
- how incomplete fields should behave;
- how factual provenance should be preserved;
- whether front matter or another structured layer is useful;
- whether a schema-based companion format is necessary.

Avoid making candidate authoring unnecessarily technical.

---

# 4. Canonical Candidate Model

Design a typed canonical representation of candidate data.

Evaluate whether the architecture should explicitly separate:

1. raw candidate input;
2. parsed/validated candidate data;
3. derived deterministic information;
4. generated editorial language;
5. final resume content model;
6. LaTeX/PDF output.

The canonical model should make factual grounding easier to validate and test.

Consider how individual facts could remain traceable to their source.

Do not overengineer provenance if a simpler mechanism provides sufficient guarantees.

---

# 5. Factual Integrity

Factual integrity is a first-class architectural requirement.

The system must distinguish between acceptable rewriting and factual invention.

Example:

Input:

```text
Helped migrate an old Node API to TypeScript.
```

Allowed:

```text
Contributed to the migration of a legacy Node.js API to TypeScript.
```

Not allowed unless explicitly supported by source data:

```text
Led a 12-person migration that reduced incidents by 65%.
```

Design actual software constraints.

Do not rely solely on an instruction such as "do not hallucinate."

Evaluate mechanisms such as:

- structured schemas;
- source identifiers;
- claim-level grounding;
- controlled structured outputs;
- validation;
- traceability;
- deterministic transformation where possible;
- constrained generation;
- post-generation verification.

Explain the tradeoffs.

The architecture must make this invariant explicit:

> A generated factual claim must be supportable by candidate-provided data.

---

# 6. Optional Job Targeting

Evaluate support for an optional job description.

A target job may be used to:

- rank candidate information by relevance;
- select which truthful experiences deserve more emphasis;
- adapt wording using terminology supported by the candidate's experience;
- improve legitimate ATS keyword alignment;
- prioritize relevant achievements and skills.

It must never authorize fabrication.

The invariant is:

> Job targeting may change emphasis, but it must never change truth.

Determine whether job targeting belongs in the MVP or a later milestone.

If included, define the input contract.

For example, evaluate whether the CLI might eventually support something conceptually similar to:

```bash
arete build
arete build --locale pt-BR
arete build --job ./job.md
```

Do not treat these commands as final.

Design the actual CLI contract during planning.

---

# 7. Localization

English is the default output language.

Other languages should be explicitly requestable.

Design localization so that:

- candidate facts remain unchanged;
- proper nouns are preserved appropriately;
- technologies are not incorrectly translated;
- product names remain correct;
- dates may adapt to locale;
- conventional resume section names may adapt;
- wording remains professionally natural;
- translation does not create new claims.

Evaluate whether BCP 47 locale identifiers should be used.

Determine where localization occurs in the pipeline.

Avoid coupling localization directly to the LaTeX template if a cleaner content-level boundary exists.

---

# 8. AI / LLM Architecture

Determine whether an LLM should be:

- required;
- optional;
- provider-agnostic;
- absent from the first MVP.

Consider the actual product objective.

AI may be useful for:

- rewriting;
- prioritization;
- summarization;
- natural localization;
- job targeting.

AI must not become the source of truth.

Evaluate:

- structured model outputs;
- schema validation;
- grounding;
- retry strategy;
- deterministic fallbacks;
- provider abstraction;
- testability;
- cost;
- reproducibility;
- privacy;
- secret management.

Do not add a generic provider abstraction merely because it looks architecturally sophisticated.

Use it only if there is a concrete reason.

---

# 9. LaTeX and PDF

Design a reliable rendering and compilation pipeline.

The generated resume should prioritize:

1. ATS readability;
2. human readability;
3. professional visual quality.

Evaluate:

- LaTeX engine choice;
- document class or template strategy;
- font strategy;
- compilation toolchain;
- local dependency requirements;
- Docker/container use;
- CI compatibility;
- deterministic compilation where practical;
- safe escaping;
- LaTeX injection risk;
- error diagnostics;
- build artifacts.

The PDF should favor:

- selectable text;
- simple hierarchy;
- conventional section headings;
- predictable reading order;
- restrained formatting;
- readable typography;
- dense but comfortable information layout.

Avoid ATS-hostile design such as:

- unnecessary multi-column complexity;
- charts;
- decorative skill bars;
- icons replacing text;
- text embedded as images;
- excessive visual ornamentation.

Determine how the project can smoke-test PDF generation.

Also consider whether PDF text extraction should be tested as a practical ATS-readability signal.

---

# 10. Technology Constraints

The project must use:

- Node.js;
- TypeScript;
- strict TypeScript configuration;
- modern supported Node.js practices.

The repository will be public and pinned on a personal GitHub profile.

It should demonstrate strong engineering judgment without enterprise theater.

Choose the exact supporting toolchain.

Evaluate and justify:

- package manager;
- Node.js version policy;
- TypeScript configuration;
- module system;
- build strategy;
- linting;
- formatting;
- testing;
- coverage;
- runtime schema validation;
- CLI framework or no framework;
- Git hooks;
- commit validation;
- CI;
- release/versioning strategy if relevant.

Prefer stable, widely understood tools unless a newer tool provides a clear advantage.

---

# 11. Type Safety

Requirements:

- strict TypeScript;
- avoid `any`;
- precise types at architectural boundaries;
- runtime validation for untrusted input;
- no casual type assertions;
- useful domain types.

Determine whether branded/opaque types are useful or unnecessary.

Keep type complexity proportional to project size.

---

# 12. Linting and Formatting

I want strict linting.

Design a modern TypeScript linting setup that catches meaningful problems.

Prioritize rules related to:

- correctness;
- type safety;
- promises/async behavior;
- unsafe operations;
- imports;
- maintainability;
- complexity;
- unused code;
- suspicious patterns.

Avoid arbitrary stylistic noise.

Formatting should be automated.

Prefer tooling enforcement over prose-only rules.

Explain each major linting category rather than listing hundreds of individual rules.

---

# 13. Naming Conventions

Default requirement:

- filenames: `kebab-case`;
- directories: `kebab-case`.

Define conventions for:

- variables;
- functions;
- types;
- classes;
- constants;
- tests;
- fixtures.

Allow ecosystem-required filenames to use their conventional names.

Do not fight ecosystem conventions merely to enforce kebab-case universally.

---

# 14. Git Conventions

Use Conventional Commits.

Evaluate whether the repository should include:

- commitlint;
- Husky or another hook mechanism;
- lint-staged;
- pre-commit checks;
- commit-msg validation.

Do not add tools purely for ceremony.

Explain the tradeoff between local hooks and CI enforcement.

No secrets or real candidate data should be committed.

---

# 15. Testing

Design a serious but proportional test strategy.

Evaluate:

- unit tests;
- integration tests;
- end-to-end generation tests;
- fixtures;
- golden/snapshot testing;
- LaTeX regression tests;
- PDF compilation tests;
- PDF text extraction tests;
- AI boundaries and mocking.

Important behavior includes:

- Markdown parsing;
- validation;
- canonical model construction;
- factual-integrity invariants;
- targeting;
- localization;
- LaTeX escaping;
- template rendering;
- invalid input;
- missing configuration;
- end-to-end `.tex` generation;
- end-to-end `.pdf` generation.

Define meaningful coverage thresholds.

Coverage should be enforced but must not encourage meaningless tests.

Explain whether global and critical-module thresholds should differ.

---

# 16. Environment and Privacy

Use environment variables for secrets and external configuration.

Requirements:

- typed/validated environment configuration;
- `.env.example`;
- no committed secrets;
- clear failures for missing required configuration.

Real candidate information must not be committed to the public repository by default.

Design a safe convention such as:

- sanitized example input committed;
- private local candidate files ignored;
- generated output ignored where appropriate.

Consider the privacy implications of sending resume data to an external LLM provider.

Document relevant tradeoffs.

---

# 17. CI

Design a GitHub Actions pipeline appropriate for a small public TypeScript portfolio project.

Evaluate quality gates for:

- clean installation;
- formatting verification;
- linting;
- type checking;
- tests;
- coverage;
- build;
- resume-generation smoke test;
- LaTeX/PDF compilation.

Keep CI understandable.

Avoid unnecessary matrices or enterprise-level complexity unless justified.

Determine whether the Node.js version policy should be validated in CI.

---

# 18. Repository Structure

Propose the exact initial repository structure.

Keep it minimal.

Possible documentation to evaluate:

```text
AGENTS.md
README.md

docs/
  PROJECT_SPEC.md
  ARCHITECTURE.md
  PLANS.md
  TESTING.md
  SECURITY.md
  CONTENT_POLICY.md
  LATEX.md
  decisions/
  exec-plans/
    active/
    completed/
```

Do not create every document merely because it is listed.

For every recommended document, define:

- its single responsibility;
- what belongs there;
- what does not belong there;
- when an agent should read it;
- when it should be updated.

Avoid duplication.

The root `AGENTS.md` should remain concise and route agents to deeper documentation.

---

# 19. README

Design the public-facing `README.md` strategy.

This project will be pinned on a personal GitHub profile.

The README should communicate to both:

- recruiters;
- technically competent engineers.

It should explain:

- what Arete is;
- why it exists;
- the compiler concept;
- factual integrity;
- ATS/human-readability goals;
- architecture at a high level;
- usage once implemented;
- engineering quality;
- project status.

Avoid exaggerated marketing language.

The README should make the project look deliberate, useful, and technically credible.

---

# 20. Plans and Execution

Evaluate a lightweight `PLANS.md` + ExecPlan workflow.

Preferred principle:

- trivial/local changes: implement directly;
- substantial changes: create an ExecPlan;
- ExecPlans are living documents;
- active plans live in `docs/exec-plans/active/`;
- completed plans move to `docs/exec-plans/completed/`.

Define exactly what counts as substantial work for this repository.

Avoid bureaucracy for tiny changes.

The initial implementation itself should likely receive an ExecPlan.

---

# 21. Definition of Done

Define a concrete Definition of Done for the MVP.

At minimum evaluate:

- functional requirements;
- `.tex` generation;
- `.pdf` generation;
- default English output;
- alternate locale support;
- factual-integrity guarantees;
- ATS-oriented rendering constraints;
- meaningful tests;
- coverage;
- formatting;
- linting;
- type checking;
- CI;
- documentation;
- environment handling;
- privacy safeguards;
- reproducible local setup.

"Code exists" is not a valid completion criterion.

---

# 22. Non-Goals

Explicitly identify what the MVP should not attempt.

Potential non-goals to evaluate:

- graphical web editor;
- account system;
- cloud hosting;
- resume database;
- collaborative editing;
- drag-and-drop design;
- dozens of visual templates;
- arbitrary WYSIWYG customization;
- automatic job application;
- scraping job platforms;
- enterprise multi-tenancy.

Keep the project focused.

---

# 23. Portfolio Quality

Because the repository will be public and pinned, a technically competent reviewer should be able to see evidence of:

- deliberate architecture;
- strong TypeScript practices;
- strict but sensible linting;
- meaningful automated tests;
- security and privacy awareness;
- factual-integrity thinking;
- Git conventions;
- restrained dependencies;
- clean CI;
- clear documentation;
- pragmatic decision-making.

Do not add complexity merely to make the repository appear sophisticated.

A small, sharp, well-tested system is preferable to a large artificial architecture.

---

# 24. Decision Process During Plan Mode

Follow this process:

1. Read `AGENTS.md`.
2. Inspect all existing repository files.
3. Restate the product boundary in concrete terms.
4. Identify unresolved product decisions.
5. Identify unresolved architectural decisions.
6. Identify unresolved tooling decisions.
7. Challenge weak assumptions.
8. Detect contradictions.
9. Detect unnecessary complexity.
10. Make conventional technical choices autonomously when there is a clearly superior option.
11. Ask questions only when an answer materially changes product behavior or architecture.
12. Separate:
    - product decisions;
    - architecture decisions;
    - tooling decisions;
    - deferred decisions.
13. Do not implement application code.

Do not spend Plan Mode asking me to choose between equivalent libraries unless the choice has meaningful consequences.

Make and justify reasonable engineering decisions.

---

# 25. Expected Planning Output

Before implementation begins, produce a coherent blueprint covering:

## A. Product Boundary

Define:

- MVP;
- non-goals;
- inputs;
- outputs;
- CLI workflow;
- primary user journeys;
- major invariants;
- optional job-targeting decision.

## B. Architecture

Define:

- components;
- data flow;
- raw input representation;
- canonical candidate model;
- resume content model;
- generation boundaries;
- localization;
- LaTeX rendering;
- PDF compilation;
- AI integration, if any;
- error handling.

## C. Factual-Integrity Model

Explain concretely:

- how unsupported claims are prevented;
- how provenance is represented;
- how generated content is validated;
- what is deterministic;
- what may use AI;
- what tests protect the invariant.

## D. Repository Structure

Provide the exact initial directory tree.

Keep it minimal.

## E. Toolchain

Recommend and justify:

- package manager;
- Node version policy;
- TypeScript;
- linting;
- formatting;
- tests;
- coverage;
- schema validation;
- CLI approach;
- environment validation;
- Git conventions;
- hooks if justified;
- CI;
- LaTeX toolchain.

## F. Persistent Documentation

Define the exact files to create before implementation.

Explain the responsibility of each.

## G. `AGENTS.md` Review

Review the existing root `AGENTS.md`.

Propose changes only when they materially improve the operating model.

Keep it concise.

Do not move the full project specification into it.

## H. Definition of Done

Define verifiable completion criteria for the MVP.

## I. Initial ExecPlan

Design the initial implementation milestones.

Each milestone should have:

- objective;
- scope;
- dependencies;
- validation;
- acceptance criteria.

Do not implement the milestones yet.

---

# 26. Final Requirement

At the end of this planning phase, the repository should be able to become self-describing.

A completely fresh Codex session, with no access to this conversation, should be able to enter the repository and determine:

- what Arete is;
- what must be built;
- what is explicitly out of scope;
- how the system is architected;
- where factual truth comes from;
- how hallucination is constrained;
- how localization works;
- how LaTeX and PDF generation work;
- what coding standards apply;
- how to validate changes;
- when an ExecPlan is required;
- what "done" means.

Do not start implementation until the planning model is coherent.

After the blueprint is agreed, the next phase will be to materialize the repository documentation and create the initial ExecPlan.
