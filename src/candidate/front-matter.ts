import { JSON_SCHEMA, load } from "js-yaml";
import { z } from "zod";
import { ValidationError } from "../diagnostics/errors.js";

const metadataSchema = z.strictObject({
  schemaVersion: z.literal(1),
  locale: z.string().min(2).optional()
});

export function parseFrontMatter(markdown: string, file: string) {
  const lines = markdown.replace(/^\uFEFF/u, "").split(/\r?\n/u);
  if (lines[0]?.trim() !== "---") {
    throw new ValidationError(
      `Invalid candidate source ${file}: expected YAML front matter (---).`
    );
  }
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end < 0) {
    throw new ValidationError(`Invalid candidate source ${file}: unclosed YAML front matter.`);
  }
  try {
    const data: unknown = load(lines.slice(1, end).join("\n"), { schema: JSON_SCHEMA });
    const metadata = metadataSchema.parse(data);
    return { metadata, body: lines.slice(end + 1).join("\n"), lineOffset: end + 1 };
  } catch (error) {
    throw new ValidationError(
      `Invalid candidate metadata in ${file}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
