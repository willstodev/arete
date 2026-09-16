import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compilePdf } from "../../src/latex/compile.js";

let root: string;
let texPath: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "arete-compile-"));
  texPath = join(root, "resume.tex");
  await writeFile(texPath, "example latex");
  vi.stubEnv("ARETE_SKIP_PDF_COMPILE", "");
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(root, { recursive: true, force: true });
});

async function fakeCompiler(name: string, body: string): Promise<string> {
  const bin = join(root, "bin");
  await mkdir(bin, { recursive: true });
  const file = join(bin, name);
  await writeFile(file, `#!${process.execPath}\n${body}\n`);
  await chmod(file, 0o755);
  return file;
}

async function pdfBytes(pages = 1): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pages; i++) pdf.addPage();
  return pdf.save({ addDefaultPage: false });
}

function writePdfScript(bytes: Uint8Array): string {
  return `require('node:fs').writeFileSync('resume.pdf', Buffer.from('${Buffer.from(bytes).toString("base64")}', 'base64'));`;
}

describe("compilePdf", () => {
  it("skips compilation and removes a stale PDF", async () => {
    vi.stubEnv("ARETE_SKIP_PDF_COMPILE", "1");
    await writeFile(join(root, "resume.pdf"), "stale private resume");
    expect((await compilePdf(texPath)).skipped).toBe(true);
    await expect(readFile(join(root, "resume.pdf"))).rejects.toThrow();
  });

  it("runs Tectonic in a private directory without interpreting shell metacharacters", async () => {
    const out = join(root, 'output $(touch injected) `touch injected` " quoted');
    await mkdir(out);
    const input = join(out, "resume.tex");
    await writeFile(input, "example latex");
    const binary = await fakeCompiler(
      "tectonic",
      `
      const assert = require('node:assert/strict');
      assert.deepEqual(process.argv.slice(2), ['--untrusted', 'resume.tex']);
      assert.equal(require('node:fs').readFileSync('resume.tex', 'utf8'), 'example latex');
      ${writePdfScript(await pdfBytes())}
    `
    );
    const result = await compilePdf(input, { tectonicPath: binary });
    expect(result.skipped).toBe(false);
    expect((await PDFDocument.load(await readFile(result.pdfPath))).getPageCount()).toBe(1);
    await expect(readFile(join(out, "injected"))).rejects.toThrow();
  });

  it.each([0, 2])("rejects a compressed PDF with %i pages", async (pages) => {
    const binary = await fakeCompiler("tectonic", writePdfScript(await pdfBytes(pages)));
    await expect(compilePdf(texPath, { tectonicPath: binary })).rejects.toThrow("exactly one page");
    await expect(readFile(join(root, "resume.pdf"))).rejects.toThrow();
  });

  it.each(["require('node:fs').writeFileSync('resume.pdf', 'not a PDF');", ""])(
    "rejects corrupt or missing PDF output",
    async (body) => {
      const binary = await fakeCompiler("tectonic", body);
      await expect(compilePdf(texPath, { tectonicPath: binary })).rejects.toThrow("readable PDF");
    }
  );

  it("reports compiler stdout diagnostics and clears stale output", async () => {
    await writeFile(join(root, "resume.pdf"), "old resume");
    const binary = await fakeCompiler("tectonic", "console.log('bad latex'); process.exit(1);");
    await expect(compilePdf(texPath, { tectonicPath: binary })).rejects.toThrow("bad latex");
    await expect(readFile(join(root, "resume.pdf"))).rejects.toThrow();
  });

  it("reports process startup errors", async () => {
    await expect(compilePdf(texPath, { tectonicPath: join(root, "missing") })).rejects.toThrow(
      "Could not run"
    );
  });

  it.each(["latexmk", "pdflatex"])("uses the %s fallback when Tectonic is absent", async (name) => {
    await fakeCompiler(
      name,
      `
      const assert = require('node:assert/strict');
      assert.ok(process.argv.includes('-no-shell-escape'));
      assert.equal(process.argv.at(-1), 'resume.tex');
      ${writePdfScript(await pdfBytes())}
    `
    );
    vi.stubEnv("PATH", join(root, "bin"));
    expect((await compilePdf(texPath, { tectonicPath: null })).skipped).toBe(false);
  });

  it("reports when no compilers are available", async () => {
    vi.stubEnv("PATH", "");
    await expect(compilePdf(texPath, { tectonicPath: null })).rejects.toThrow(
      "no PDF compiler was found"
    );
  });

  it("rejects non-TeX input without deleting the input", async () => {
    await expect(compilePdf(texPath.replace(".tex", ".md"))).rejects.toThrow(".tex extension");
    expect(await readFile(texPath, "utf8")).toBe("example latex");
  });
});
