import { z } from "zod";

const envSchema = z.object({
  ARETE_SKIP_PDF_COMPILE: z.enum(["1"]).optional()
});

export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  envSchema.parse(env);
}
