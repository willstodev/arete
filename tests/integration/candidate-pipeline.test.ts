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

    expect(resume.name.text).toBe("Example Candidate");
    expect(resume.experiences).toHaveLength(2);
    expect(resume.experiences[0]!.bullets[0]!.sources[0]!.section).toBe("Experience");
  });

  it("renders escaped LaTeX without inventing unsupported content", async () => {
    const markdown = await readFile("examples/candidate.example.md", "utf8");
    const candidate = parseCandidateMarkdown(markdown, "examples/candidate.example.md");
    const latex = renderLatex(composeResume(candidate));

    expect(latex).toContain("\\documentclass[10pt,a4paper]{article}");
    expect(latex).toContain("Arete one-page rule failed");
    expect(latex).toContain("\\areteEntry");
    expect(latex).toContain("\\textbf{Key Technologies:}");
    expect(latex).toContain(
      "Migrated a legacy Node.js API to TypeScript, replacing loosely typed request handlers with typed service boundaries."
    );
    expect(latex).not.toContain("STAR evidence notes");
    expect(latex).not.toContain("Led a 12-person migration");
  });

  it("separates consecutive experience and project entries with vertical space", async () => {
    const markdown = await readFile("examples/candidate.example.md", "utf8");
    const candidate = parseCandidateMarkdown(markdown, "examples/candidate.example.md");
    const latex = renderLatex(composeResume(candidate));

    expect(latex).toContain("\\newcommand{\\areteEntrySpace}{\\par\\addvspace{6pt}}");
    expect(latex).toMatch(/\\newcommand\{\\areteEntry\}\[4\]\{\\areteEntrySpace/);
    expect(latex).not.toMatch(/\\emph\{#4\}\\\\/);
    expect(latex).toContain("\\areteEntrySpace\\textbf{Release Notes Compiler}");
  });

  it("rejects missing required identity fields", () => {
    const markdown =
      "---\nschemaVersion: 1\n---\n\n# Candidate\n\n## Identity\n\nName: Missing Email\n";
    expect(() => parseCandidateMarkdown(markdown, "bad.md")).toThrow(/Name and Email/);
  });
});
