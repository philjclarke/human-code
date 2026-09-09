import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/knowledge' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    category: z.enum(['language', 'managing', 'workplaces', 'employer']),
    principle: z.string(),
    author: z.string().default('Human Code'),
    reviewer: z.string().optional(),
    published: z.coerce.date(),
    reviewed: z.coerce.date(),
    readingTime: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    sources: z
      .array(z.object({ title: z.string(), url: z.string().url(), publisher: z.string().optional() }))
      .default([]),
  }),
});

const trainers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/trainers' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string().optional(),
    teaching: z.string(),
    coaching: z.string(),
    send: z.string().optional(),
    qualifications: z.array(z.string()).default([]),
    approved: z.string().default('Human Code approved trainer'),
    order: z.number().default(99),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { knowledge, trainers };
