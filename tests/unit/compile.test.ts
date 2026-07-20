import { chmod, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { compilePdf } from "../../src/latex/compile.js";

const originalPath = process.env.PATH;
const originalSkipPdfCompile = process.env.ARETE_SKIP_PDF_COMPILE;

describe("compilePdf", () => {
  afterEach(() => {
    process.env.PATH = originalPath;
    if (originalSkipPdfCompile === undefined) {
      delete process.env.ARETE_SKIP_PDF_COMPILE;
    } else {
      process.env.ARETE_SKIP_PDF_COMPILE = originalSkipPdfCompile;
    }
  });

  it("can skip PDF compilation by environment flag", async () => {
    process.env.ARETE_SKIP_PDF_COMPILE = "1";

    await expect(compilePdf("out/resume.tex")).resolves.toEqual({
      skipped: true,
      pdfPath: "out/resume.pdf",
      message: "PDF compilation skipped by ARETE_SKIP_PDF_COMPILE=1."
    });
  });

  it("prefers the npm-managed LaTeX compiler", async () => {
    const root = await mkdtemp(join(tmpdir(), "arete-compile-"));
    try {
      const out = join(root, "out");
      await mkdir(out);

      const texPath = join(out, "resume.tex");
      await writeFile(texPath, "\\documentclass{article}\\begin{document}Test\\end{document}\n");

      const result = await compilePdf(relative(process.cwd(), texPath), {
        nodeCompiler: async (config) => {
          expect(config.texFile).toBe(relative(process.cwd(), texPath));
          expect(config.outputDir).toBe(relative(process.cwd(), out));
          expect(config.outputFile).toBe(relative(process.cwd(), join(out, "resume.pdf")));
          await writeFile(config.outputFile, "pdf");
          return { status: "success", pdfPath: config.outputFile };
        }
      });

      expect(result.skipped).toBe(false);
      expect(result.pdfPath).toBe(relative(process.cwd(), join(out, "resume.pdf")));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("reports npm-managed compiler failures", async () => {
    await expect(
      compilePdf("out/resume.tex", {
        nodeCompiler: () =>
          Promise.resolve({
            status: "failed",
            stderr: "bad latex"
          })
      })
    ).rejects.toThrow("npm-managed LaTeX compiler failed: bad latex");
  });

  it("reports npm-managed compiler exceptions", async () => {
    await expect(
      compilePdf("out/resume.tex", {
        nodeCompiler: () => Promise.reject(new Error("compiler unavailable"))
      })
    ).rejects.toThrow("npm-managed LaTeX compiler failed: compiler unavailable");
  });

  it("passes only the tex filename to system fallbacks from a relative output directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "arete-compile-"));
    try {
      const bin = join(root, "bin");
      const out = join(root, "relative-out");
      await mkdir(bin);
      await mkdir(out);

      const latexmk = join(bin, "latexmk");
      await writeFile(
        latexmk,
        [
          "#!/usr/bin/env sh",
          "for arg do tex_file=$arg; done",
          'test "$tex_file" = "resume.tex" || exit 2',
          'touch "${tex_file%.tex}.pdf"'
        ].join("\n"),
        "utf8"
      );
      await chmod(latexmk, 0o755);

      const texPath = join(out, "resume.tex");
      await writeFile(texPath, "\\documentclass{article}\\begin{document}Test\\end{document}\n");
      process.env.PATH = `${bin}:${originalPath ?? ""}`;

      const result = await compilePdf(relative(process.cwd(), texPath), { nodeCompiler: null });

      expect(result.skipped).toBe(false);
      expect(result.pdfPath).toBe(relative(process.cwd(), join(out, "resume.pdf")));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("reports when neither npm nor system compilers are available", async () => {
    process.env.PATH = "";

    await expect(compilePdf("out/resume.tex", { nodeCompiler: null })).rejects.toThrow(
      "no PDF compiler was found"
    );
  });
});
