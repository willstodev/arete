import { chmod, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { compilePdf } from "../../src/latex/compile.js";

const originalPath = process.env.PATH;

describe("compilePdf", () => {
  afterEach(() => {
    process.env.PATH = originalPath;
  });

  it("passes only the tex filename when compiling from a relative output directory", async () => {
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

      const result = await compilePdf(relative(process.cwd(), texPath));

      expect(result.skipped).toBe(false);
      expect(result.pdfPath).toBe(relative(process.cwd(), join(out, "resume.pdf")));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
