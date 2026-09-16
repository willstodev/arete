import { describe, expect, it } from "vitest";
import { parseCandidateMarkdown } from "../../src/candidate/parser.js";
import { composeResume } from "../../src/resume/compose.js";
import { renderLatex, renderWarnings } from "../../src/latex/render.js";

const minimal =
  "---\nschemaVersion: 1\n---\n\n## Identity\nName: Example Candidate\nEmail: candidate@example.com\n";
const experience =
  "\n## Experience\n### Engineer | Example Employer | 2021-03 - Present | Remote\n- Built APIs.\n";

describe("candidate parsing regressions", () => {
  it("does not turn bullet-shaped STAR notes into resume claims", () => {
    const source =
      minimal +
      experience +
      "STAR evidence notes:\n- Unconfirmed: reduced errors by 99%.\nTechnologies: TypeScript\n";
    const latex = renderLatex(composeResume(parseCandidateMarkdown(source, "candidate.md")));
    expect(latex).not.toContain("99");
    expect(latex).toContain("TypeScript");
  });

  it("reports budget omissions and preserves selected source order", () => {
    const source = minimal + experience + "- Second.\n- Third.\n- Fourth.\n- Fifth.\n";
    const resume = composeResume(parseCandidateMarkdown(source, "candidate.md"));
    expect(renderWarnings(resume)).toEqual([
      "Experience 1 bullets: omitted 1 item(s) for the one-page budget; review source order."
    ]);
    expect(renderLatex(resume)).toContain("Fourth.");
    expect(renderLatex(resume)).not.toContain("Fifth.");
  });

  it.each([
    "\n## Experiance\n",
    "\n## Projects\n### Project | 2022 | Unexpected\n- Built it.\n",
    "\n## Education\n### Degree | | 2022\n",
    "\n## Certifications\n- | Issuer | 2022\n",
    "\n## Languages\n- English\n"
  ])("rejects malformed records instead of silently dropping or shifting facts", (section) => {
    expect(() => parseCandidateMarkdown(minimal + section, "bad.md")).toThrow();
  });
  it("rejects executable front matter before running it", () => {
    const payload = '---javascript\n(() => { throw new Error("EXECUTED"); })()\n---\n';
    expect(() => parseCandidateMarkdown(payload, "unsafe.md")).toThrow(
      "expected YAML front matter"
    );
  });

  it.each([
    minimal.replace("schemaVersion: 1", "schemaVersion: 2"),
    minimal.replace("schemaVersion: 1", "schemaVersion: ["),
    minimal.replace("schemaVersion: 1", '!!js/function "function() {}"'),
    minimal.replace("schemaVersion: 1", "schemaVersion: 1\nschemaVersion: 1"),
    "---\nschemaVersion: 1",
    minimal.replace("candidate@example.com", "not-an-email"),
    minimal.replace("schemaVersion: 1", "schemaVersion: 1\nlocale: fr-FR")
  ])("rejects invalid metadata and identity", (source) => {
    expect(() => parseCandidateMarkdown(source, "bad.md")).toThrow();
  });

  it.each(["\n", "\r\n"])("preserves original file line numbers with %j newlines", (newline) => {
    const input = (minimal + experience).replaceAll("\n", newline);
    const candidate = parseCandidateMarkdown(input, "candidate.md");
    const lines = input.split(/\r?\n/);
    expect(lines[candidate.identity.name.source.line - 1]).toBe("Name: Example Candidate");
    const bullet = composeResume(candidate).experiences[0]!.bullets[0]!;
    expect(lines[bullet.sources[0]!.line - 1]).toBe("- Built APIs.");
  });

  it("preserves optional blank pipe fields instead of shifting dates into issuers", () => {
    const candidate = parseCandidateMarkdown(
      minimal + "\n## Certifications\n- Example Certification | | 2022\n",
      "candidate.md"
    );
    expect(candidate.certifications[0]!.issuer).toBeUndefined();
    expect(candidate.certifications[0]!.date!.value).toBe("2022");
  });

  it("allows missing optional experience location", () => {
    const candidate = parseCandidateMarkdown(
      minimal + experience.replace(" | Remote", " | "),
      "candidate.md"
    );
    expect(candidate.experiences[0]!.location).toBeUndefined();
  });

  it.each([
    experience.replace("Engineer | Example Employer", " | Example Employer"),
    experience.replace("Engineer | Example Employer", "Engineer | "),
    experience.replace("2021-03", "2021-13"),
    experience.replace("2021-03", "2021-00"),
    experience.replace("Present", "2020-12"),
    experience.replace("Remote", "Remote | Unexpected")
  ])("rejects shifted fields and invalid dates", (section) => {
    expect(() => parseCandidateMarkdown(minimal + section, "bad.md")).toThrow();
  });

  it("rejects duplicate sections and identity keys rather than dropping facts", () => {
    expect(() =>
      parseCandidateMarkdown(minimal + "\n## Identity\nName: Duplicate\n", "bad.md")
    ).toThrow("Duplicate section");
    expect(() => parseCandidateMarkdown(minimal + "Name: Duplicate\n", "bad.md")).toThrow(
      "Duplicate identity"
    );
  });

  it("preserves wrapped summary text", () => {
    const candidate = parseCandidateMarkdown(
      minimal + "\n## Summary\nBuilt APIs\nand maintained tests.\n",
      "candidate.md"
    );
    expect(candidate.summary!.value).toBe("Built APIs and maintained tests.");
  });

  it("localizes all headings and preserves separate list paragraphs", () => {
    const source =
      minimal +
      experience +
      "Technologies: TypeScript\n\n## Languages\n- English: Fluent\n- Portuguese: Fluent\n";
    const latex = renderLatex(
      composeResume(parseCandidateMarkdown(source, "candidate.md"), { locale: "pt-BR" })
    );
    expect(latex).toContain("Experiência");
    expect(latex).toContain("\\textbf{Tecnologias:}");
    expect(latex).toContain("English: Fluent\\par\nPortuguese: Fluent\\par");
  });
});
