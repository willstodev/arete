import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseCandidateMarkdown } from "../../src/candidate/parser.js";
import { renderLatex } from "../../src/latex/render.js";
import { composeResume } from "../../src/resume/compose.js";

describe("candidate pipeline", () => {
  it("parses the example candidate and preserves provenance into the resume model", async () => {
    const markdown = await readFile("examples/candidate.example.md", "utf8");
    const candidate = parseCandidateMarkdown(markdown, "examples/candidate.example.md");
    const resume = composeResume(candidate);

    expect(resume.name.text).toBe("Jordan Avery");
    expect(resume.experiences).toHaveLength(2);
    expect(resume.experiences[0]!.bullets[0]!.sources[0]!.section).toBe("Experience");
  });

  it("renders escaped LaTeX without inventing unsupported content", async () => {
    const markdown = await readFile("examples/candidate.example.md", "utf8");
    const candidate = parseCandidateMarkdown(markdown, "examples/candidate.example.md");
    const latex = renderLatex(composeResume(candidate));

    expect(latex).toContain("Migrated a legacy Node.js API to TypeScript.");
    expect(latex).not.toContain("Led a 12-person migration");
  });

  it("rejects missing required identity fields", () => {
    const markdown =
      "---\nschemaVersion: 1\n---\n\n# Candidate\n\n## Identity\n\nName: Missing Email\n";
    expect(() => parseCandidateMarkdown(markdown, "bad.md")).toThrow(/Name and Email/);
  });
});
