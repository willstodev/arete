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

const contactInfoSchema = z.object({
  email: sourcedTextSchema,
  phone: sourcedTextSchema.optional(),
  linkedIn: sourcedTextSchema.optional(),
  github: sourcedTextSchema.optional(),
  website: sourcedTextSchema.optional()
});

export const candidateSchema = z.object({
  schemaVersion: z.literal(1),
  locale: z.string().min(2).optional(),
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
      z.object({
        title: sourcedTextSchema,
        employer: sourcedTextSchema,
        start: sourcedTextSchema,
        end: sourcedTextSchema,
        location: sourcedTextSchema.optional(),
        bullets: z.array(sourcedTextSchema).min(1),
        technologies: z.array(sourcedTextSchema).default([])
      })
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
