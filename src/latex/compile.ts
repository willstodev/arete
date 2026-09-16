import { access, copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { PDFDocument } from "pdf-lib";
import { EnvironmentError } from "../diagnostics/errors.js";

export type CompileResult = {
  skipped: boolean;
  pdfPath: string;
  message: string;
};

type CompilePdfOptions = {
  /** Override binary discovery for isolated compiler boundary tests. */
  tectonicPath?: string | null;
};

export async function compilePdf(
  texPath: string,
  options: CompilePdfOptions = {}
): Promise<CompileResult> {
  if (!texPath.endsWith(".tex")) {
    throw new EnvironmentError("PDF input must have a .tex extension.");
  }
  const pdfPath = texPath.replace(/\.tex$/u, ".pdf");
  // Never leave an old resume looking like the result of a skipped or failed build.
  await rm(pdfPath, { force: true });
  if (process.env.ARETE_SKIP_PDF_COMPILE === "1") {
    return {
      skipped: true,
      pdfPath,
      message: "PDF compilation skipped by ARETE_SKIP_PDF_COMPILE=1."
    };
  }

  const { command, kind } = await findCompiler(options, texPath);

  // Each invocation gets private intermediates, including concurrent builds named resume.tex.
  const work = await mkdtemp(join(tmpdir(), "arete-tex-"));
  try {
    await copyFile(texPath, join(work, "resume.tex"));
    const args =
      kind === "tectonic"
        ? ["--untrusted", "resume.tex"]
        : kind === "latexmk"
          ? [
              "-norc",
              "-pdf",
              "-no-shell-escape",
              "-interaction=nonstopmode",
              "-halt-on-error",
              "resume.tex"
            ]
          : ["-no-shell-escape", "-interaction=nonstopmode", "-halt-on-error", "resume.tex"];
    await run(command, args, work);
    // Resolve LastPage references on system pdflatex, which does not rerun automatically.
    if (kind === "pdflatex") await run(command, args, work);
    const compiledPdf = join(work, "resume.pdf");
    await assertSinglePagePdf(compiledPdf);
    await copyFile(compiledPdf, pdfPath);
    return { skipped: false, pdfPath, message: `Wrote ${pdfPath}` };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

async function findCompiler(options: CompilePdfOptions, texPath: string) {
  const tectonic = Object.hasOwn(options, "tectonicPath")
    ? options.tectonicPath
    : ((await bundledTectonic()) ?? (await findCommand("tectonic")));
  if (tectonic) return { command: tectonic, kind: "tectonic" };
  for (const kind of ["latexmk", "pdflatex"]) {
    const command = await findCommand(kind);
    if (command) return { command, kind };
  }
  throw new EnvironmentError(
    `Wrote ${texPath}, but no PDF compiler was found. Run pnpm install, or install tectonic/latexmk/pdflatex.`
  );
}

async function bundledTectonic(): Promise<string | undefined> {
  // Resolve only runtime package files; do not execute the dependency's shell-based wrapper.
  try {
    const runtimeRequire = createRequire(import.meta.resolve("node-latex-compiler"));
    const runtime = runtimeRequire.resolve(
      `@node-latex-compiler/bin-${process.platform}-${process.arch}/package.json`
    );
    const binary = join(
      dirname(runtime),
      "bin",
      process.platform === "win32" ? "tectonic.exe" : "tectonic"
    );
    await access(binary, constants.X_OK);
    return binary;
  } catch {
    return undefined;
  }
}

async function assertSinglePagePdf(pdfPath: string): Promise<void> {
  let document: PDFDocument;
  try {
    document = await PDFDocument.load(await readFile(pdfPath));
  } catch (error) {
    throw new EnvironmentError(
      `LaTeX compiler did not produce a readable PDF: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  const pageCount = document.getPageCount();
  if (pageCount !== 1) {
    throw new EnvironmentError(`PDF must be exactly one page, but contains ${pageCount} pages.`);
  }
}

async function findCommand(command: string): Promise<string | undefined> {
  const names = process.platform === "win32" ? [`${command}.exe`, command] : [command];
  for (const path of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
    for (const name of names) {
      const candidate = resolve(path, name);
      try {
        await access(candidate, constants.X_OK);
        return candidate;
      } catch {
        // Continue searching PATH.
      }
    }
  }
  return undefined;
}

async function run(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, openin_any: "p", openout_any: "p" },
      timeout: 120_000,
      killSignal: "SIGKILL"
    });
    let output = "";
    const capture = (chunk: Buffer) => {
      output = (output + chunk.toString("utf8")).slice(-16_000);
    };
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    child.on("error", (error) => {
      reject(new EnvironmentError(`Could not run ${command}: ${error.message}`));
    });
    child.on("close", (code, signal) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(
          new EnvironmentError(`${command} failed (${signal ?? code ?? "unknown"}): ${output}`)
        );
      }
    });
  });
}
