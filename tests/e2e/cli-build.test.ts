import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("CLI build", () => {
  it("writes resume.tex and can skip PDF compilation", async () => {
    const out = await mkdtemp(join(tmpdir(), "arete-"));
    try {
      await run("node", [
        "--import",
        "tsx",
        "src/cli/main.ts",
        "build",
        "--source",
        "examples/candidate.example.md",
        "--out",
        out
      ]);

      const tex = await readFile(join(out, "resume.tex"), "utf8");
      expect(tex).toContain("Jordan Avery");
      expect(tex).toContain("\\section*{Experience}");
    } finally {
      await rm(out, { recursive: true, force: true });
    }
  });
});

async function run(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ARETE_SKIP_PDF_COMPILE: "1" },
      stdio: "pipe"
    });
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
      reject(new Error(`${command} exited with ${code ?? "unknown"}: ${stderr}`));
    });
  });
}
