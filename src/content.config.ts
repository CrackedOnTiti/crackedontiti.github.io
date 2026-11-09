import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Moving a project between sections must only require editing `status`.
export const projectStatuses = ['featured', 'built', 'building', 'origins'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
    .object({
      title: z.string(),
      slug: z.string(),
      status: z.enum(projectStatuses),
      role: z.string(),
      /** Team size, 1 = solo. Never names. Omit only while unknown, with a content TODO in the file. */
      team: z.number().int().positive().optional(),
      stack: z.array(z.string()).min(1),
      period: z.string(),
      /** Public links only. Unknown keys (e.g. `demo`) fail the build on purpose. */
      links: z
        .strictObject({
          repo: z.url().optional(),
          docs: z.url().optional(),
          devpost: z.url().optional(),
          devlogs: z.url().optional(),
        })
        .default({}),
      /** No public code: shows a note instead of a repo link. */
      closedSource: z.enum(['private', 'proprietary']).optional(),
      /** Repo exists but must not be linked yet (e.g. README rewrite pending). */
      hideRepoUntil: z.string().optional(),
      order: z.number().int(),
      summary: z.string(),
      /** Real screenshot (no client data). Alt text is required with it. */
      screenshot: image().optional(),
      screenshotAlt: z.string().optional(),
      screenshotCaption: z.string().optional(),
    })
    .refine((p) => !p.screenshot || !!p.screenshotAlt, { message: 'screenshot needs screenshotAlt' })
    .refine((p) => !(p.closedSource && p.links.repo), {
      message: 'closedSource projects cannot have links.repo',
    })
    .refine((p) => !(p.hideRepoUntil && p.links.repo), {
      message: 'hideRepoUntil is set: remove links.repo until the condition is met',
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    location: z.string().optional(),
    period: z.string(),
    order: z.number().int(),
    summary: z.string(),
    /** Links the role to a project write-up instead of describing it twice. */
    project: reference('projects').optional(),
  }),
});

export const collections = { projects, experience };
