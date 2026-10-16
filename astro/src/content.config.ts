import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    category: z.enum(["renting", "buying", "areas", "selling", "safety"]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    cover: z.string().optional(),
    author: z.string().default("فريق مستر عقار"),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
