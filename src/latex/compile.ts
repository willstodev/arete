import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { EnvironmentError } from "../diagnostics/errors.js";

export type CompileResult = {
  skipped: boolean;
  pdfPath: string;
  message: string;
};

export async function compilePdf(texPath: string): Promise<CompileResult> {
  const pdfPath = texPath.replace(/\.tex$/u, ".pdf");

  if (process.env.ARETE_SKIP_PDF_COMPILE === "1") {
    return {
      skipped: true,
      pdfPath,
      message: "PDF compilation skipped by ARETE_SKIP_PDF_COMPILE=1."
    };
  }

  const latexmk = await commandExists("latexmk");
  if (latexmk) {
    await run(
      "latexmk",
      ["-pdf", "-interaction=nonstopmode", "-halt-on-error", texPath],
      dirname(texPath)
    );
    return { skipped: false, pdfPath, message: `Wrote ${pdfPath}` };
  }

  const pdflatex = await commandExists("pdflatex");
  if (pdflatex) {
    await run(
      "pdflatex",
      ["-interaction=nonstopmode", "-halt-on-error", texPath],
      dirname(texPath)
    );
    return { skipped: false, pdfPath, message: `Wrote ${pdfPath}` };
  }

  throw new EnvironmentError(
    `Wrote ${texPath}, but no LaTeX compiler was found. Install latexmk or pdflatex to produce ${pdfPath}.`
  );
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
