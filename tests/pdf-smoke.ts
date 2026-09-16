import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { PDFDocument } from "pdf-lib";

const exec = promisify(execFile);
const root = await mkdtemp(join(tmpdir(), "arete-pdf-smoke-"));
const env = { ...process.env };
delete env.ARETE_SKIP_PDF_COMPILE;

try {
  // Real concurrent builds also guard against shared compiler intermediates.
  await Promise.all(
    ["en", "pt-BR"].map(async (locale) => {
      const out = join(root, `${locale} output $() quoted`);
      await exec(
        process.execPath,
        [
          "dist/src/cli/main.js",
          "build",
          "--source",
          "examples/candidate.example.md",
          "--out",
          out,
          "--locale",
          locale
        ],
        { env, timeout: 150_000 }
      );
      const path = join(out, "resume.pdf");
      const pdf = await PDFDocument.load(await readFile(path));
      assert.equal(pdf.getPageCount(), 1);
      assert.ok(Math.abs(pdf.getPage(0).getWidth() - 595.28) < 1);
      assert.ok(Math.abs(pdf.getPage(0).getHeight() - 841.89) < 1);
      const { stdout } = await exec("pdftotext", [path, "-"], { encoding: "utf8" });
      const text = stdout.normalize("NFKC").replace(/\s+/gu, " ");
      const headings =
        locale === "en"
          ? [
              "Summary",
              "Skills",
              "Experience",
              "Projects",
              "Education",
              "Certifications",
              "Languages"
            ]
          : [
              "Resumo",
              "Competências",
              "Experiência",
              "Projetos",
              "Formação",
              "Certificações",
              "Idiomas"
            ];
      let position = -1;
      for (const heading of ["Example Candidate", "candidate@example.com", ...headings]) {
        const next = text.indexOf(heading, position + 1);
        assert.ok(next > position, `Missing or out-of-order text: ${heading}`);
        position = next;
      }
      for (const expected of [
        "Example Employer A",
        "Example Employer B",
        "TypeScript",
        "AWS Certified Cloud Practitioner",
        "English: Native",
        "Portuguese: Professional working proficiency"
      ]) {
        assert.ok(text.includes(expected), `Missing extracted fact: ${expected}`);
      }
      assert.ok(!text.includes("STAR evidence notes"));
      console.log(
        `${locale}: one-page A4 PDF; contact, section order, and fact extraction passed.`
      );
    })
  );

  const oversized = join(root, "oversized.md");
  await writeFile(
    oversized,
    [
      "---",
      "schemaVersion: 1",
      "---",
      "## Identity",
      "Name: Example Candidate",
      "Email: candidate@example.com",
      "## Experience",
      ...Array.from(
        { length: 40 },
        (_, i) =>
          `### Engineer ${i + 1} | Example Employer | 2020 - 2021 | Remote\n- Built an example service.`
      )
    ].join("\n")
  );
  const out = join(root, "overflow");
  await assert.rejects(
    exec(process.execPath, ["dist/src/cli/main.js", "build", "--source", oversized, "--out", out], {
      env,
      timeout: 150_000
    }),
    /one.page/iu
  );
  await assert.rejects(readFile(join(out, "resume.pdf")));
  console.log("Overflow: real multi-page compilation rejected without publishing a PDF.");
} finally {
  await rm(root, { recursive: true, force: true });
}
