import { z } from "zod";

const sourceRefSchema = z.object({
  file: z.string().min(1),
  section: z.string().min(1),
  line: z.number().int().positive()
});

const sourcedTextSchema = z.object({
  value: z.string().trim().min(1),
  source: sourceRefSchema
});

const datePattern = /^(?!0000)\d{4}(?:-(?:0[1-9]|1[0-2]))?$/u;
const dateSchema = sourcedTextSchema.extend({
  value: z.string().regex(datePattern, "Use YYYY or YYYY-MM with a valid month")
});
const endDateSchema = sourcedTextSchema.extend({
  value: z.string().refine((value) => datePattern.test(value) || /^present$/iu.test(value), {
    message: "Use YYYY, YYYY-MM, or Present"
  })
});

const contactInfoSchema = z.object({
  email: sourcedTextSchema.extend({ value: z.email() }),
  phone: sourcedTextSchema.optional(),
  linkedIn: sourcedTextSchema.optional(),
  github: sourcedTextSchema.optional(),
  website: sourcedTextSchema.optional()
});

export const candidateSchema = z.object({
  schemaVersion: z.literal(1),
  locale: z
    .string()
    .refine((value) => /^(en|pt|pt-br)$/iu.test(value), "Supported locales: en, pt-BR")
    .optional(),
  identity: z.object({
    name: sourcedTextSchema,
    headline: sourcedTextSchema.optional(),
    location: sourcedTextSchema.optional(),
    contact: contactInfoSchema
  }),
  summary: sourcedTextSchema.optional(),
  skills: z.array(sourcedTextSchema).default([]),
  experiences: z
    .array(
      z
        .object({
          title: sourcedTextSchema,
          employer: sourcedTextSchema,
          start: dateSchema,
          end: endDateSchema,
          location: sourcedTextSchema.optional(),
          bullets: z.array(sourcedTextSchema).min(1),
          technologies: z.array(sourcedTextSchema).default([])
        })
        .refine(
          (entry) => {
            if (/^present$/iu.test(entry.end.value)) return true;
            // Year-only values express uncertainty: compare the latest possible end month.
            const start =
              entry.start.value.length === 4 ? `${entry.start.value}-01` : entry.start.value;
            const end = entry.end.value.length === 4 ? `${entry.end.value}-12` : entry.end.value;
            return start <= end;
          },
          { message: "Experience end date must not precede its start date", path: ["end"] }
        )
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: sourcedTextSchema,
        date: sourcedTextSchema.optional(),
        bullets: z.array(sourcedTextSchema).min(1),
        technologies: z.array(sourcedTextSchema).default([])
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        credential: sourcedTextSchema,
        institution: sourcedTextSchema,
        date: sourcedTextSchema.optional()
      })
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name: sourcedTextSchema,
        issuer: sourcedTextSchema.optional(),
        date: sourcedTextSchema.optional()
      })
    )
    .default([]),
  languages: z
    .array(
      z.object({
        name: sourcedTextSchema,
        proficiency: sourcedTextSchema
      })
    )
    .default([])
});
