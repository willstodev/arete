#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Command } from "commander";
import { parseCandidateMarkdown } from "../candidate/parser.js";
import { candidateTemplate } from "../candidate/template.js";
import { validateEnv } from "../config/env.js";
import { formatError, EnvironmentError } from "../diagnostics/errors.js";
import { compilePdf } from "../latex/compile.js";
import { renderLatex } from "../latex/render.js";
import { composeResume } from "../resume/compose.js";

type BuildOptions = {
  source: string;
  out: string;
  locale?: string;
};

type InitOptions = {
  output?: string;
};

type ValidateOptions = {
  source: string;
};

const program = new Command();

program
  .name("arete")
  .description("Compile truthful candidate data into ATS-friendly resumes.")
  .version("0.1.0");

program
  .command("init")
  .description("Create a guided candidate Markdown template.")
  .option("-o, --output <path>", "Template output path", "candidate.md")
  .action(async (options: InitOptions) => {
    await runCli(async () => {
      const output = options.output ?? "candidate.md";
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, candidateTemplate, "utf8");
      console.log(`Wrote ${output}`);
    });
  });

program
  .command("validate")
  .description("Validate a candidate Markdown source file.")
  .requiredOption("-s, --source <path>", "Candidate source Markdown")
  .action(async (options: ValidateOptions) => {
    await runCli(async () => {
      const markdown = await readFile(options.source, "utf8");
      parseCandidateMarkdown(markdown, options.source);
      console.log(`Valid candidate source: ${options.source}`);
    });
  });

program
  .command("build")
  .description("Generate resume.tex and resume.pdf from a candidate source file.")
  .requiredOption("-s, --source <path>", "Candidate source Markdown")
  .requiredOption("-o, --out <dir>", "Output directory")
  .option("-l, --locale <locale>", "BCP 47 output locale")
  .action(async (options: BuildOptions) => {
    await runCli(async () => {
      validateEnv();
      const markdown = await readFile(options.source, "utf8");
      const candidate = parseCandidateMarkdown(markdown, options.source);
      const resume = composeResume(candidate, options.locale ? { locale: options.locale } : {});
      const latex = renderLatex(resume);
      await mkdir(options.out, { recursive: true });
      const texPath = join(options.out, "resume.tex");
      await writeFile(texPath, latex, "utf8");
      console.log(`Wrote ${texPath}`);

      try {
        const result = await compilePdf(texPath);
        console.log(result.message);
      } catch (error) {
        if (error instanceof EnvironmentError) {
          console.error(formatError(error));
          process.exitCode = 1;
          return;
        }
        throw error;
      }
    });
  });

await program.parseAsync();

async function runCli(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    console.error(formatError(error));
    process.exitCode = 1;
  }
}
