import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { basename, dirname } from "node:path";
import { compile as compileWithNodeLatex } from "node-latex-compiler";
import type { CompileResult as NodeLatexCompileResult } from "node-latex-compiler";
import { EnvironmentError } from "../diagnostics/errors.js";

export type CompileResult = {
  skipped: boolean;
  pdfPath: string;
  message: string;
};

type NodeLatexCompiler = (config: {
  texFile: string;
  outputDir: string;
  outputFile: string;
}) => Promise<NodeLatexCompileResult>;

type CompilePdfOptions = {
  nodeCompiler?: NodeLatexCompiler | null;
};

export async function compilePdf(
  texPath: string,
  options: CompilePdfOptions = {}
): Promise<CompileResult> {
  const pdfPath = texPath.replace(/\.tex$/u, ".pdf");

  if (process.env.ARETE_SKIP_PDF_COMPILE === "1") {
    return {
      skipped: true,
      pdfPath,
      message: "PDF compilation skipped by ARETE_SKIP_PDF_COMPILE=1."
    };
  }

  const nodeCompiler = Object.hasOwn(options, "nodeCompiler")
    ? options.nodeCompiler
    : compileWithNodeLatex;
  if (nodeCompiler) {
    return compilePdfWithNodeLatex(nodeCompiler, texPath, pdfPath);
  }

  const latexmk = await commandExists("latexmk");
  if (latexmk) {
    await run(
      "latexmk",
      ["-pdf", "-interaction=nonstopmode", "-halt-on-error", basename(texPath)],
      dirname(texPath)
    );
    await assertPdfExists(pdfPath);
    return { skipped: false, pdfPath, message: `Wrote ${pdfPath}` };
  }

  const pdflatex = await commandExists("pdflatex");
  if (pdflatex) {
    await run(
      "pdflatex",
      ["-interaction=nonstopmode", "-halt-on-error", basename(texPath)],
      dirname(texPath)
    );
    await assertPdfExists(pdfPath);
    return { skipped: false, pdfPath, message: `Wrote ${pdfPath}` };
  }

  throw new EnvironmentError(
    `Wrote ${texPath}, but no PDF compiler was found. Run pnpm install to install the npm-managed compiler, or install latexmk/pdflatex to produce ${pdfPath}.`
  );
}

async function compilePdfWithNodeLatex(
  nodeCompiler: NodeLatexCompiler,
  texPath: string,
  pdfPath: string
): Promise<CompileResult> {
  let result: NodeLatexCompileResult;
  try {
    result = await nodeCompiler({
      texFile: texPath,
      outputDir: dirname(texPath),
      outputFile: pdfPath
    });
  } catch (error) {
    throw new EnvironmentError(`npm-managed LaTeX compiler failed: ${formatCompilerError(error)}`);
  }

  if (result.status !== "success") {
    throw new EnvironmentError(
      `npm-managed LaTeX compiler failed: ${
        result.stderr ?? result.error ?? `exit code ${result.exitCode ?? "unknown"}`
      }`
    );
  }

  await assertPdfExists(pdfPath);
  return { skipped: false, pdfPath, message: `Wrote ${pdfPath}` };
}

async function assertPdfExists(pdfPath: string): Promise<void> {
  try {
    await access(pdfPath, constants.F_OK);
  } catch {
    throw new EnvironmentError(`LaTeX compiler completed, but ${pdfPath} was not created.`);
  }
}

async function commandExists(command: string): Promise<boolean> {
  const paths = (process.env.PATH ?? "").split(":").filter(Boolean);
  for (const path of paths) {
    try {
      await access(`${path}/${command}`, constants.X_OK);
      return true;
    } catch {
      // Continue searching PATH.
    }
  }
  return false;
}

function formatCompilerError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function run(command: string, args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "pipe" });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new EnvironmentError(`${command} failed with exit code ${code ?? "unknown"}: ${stderr}`)
      );
    });
  });
}
