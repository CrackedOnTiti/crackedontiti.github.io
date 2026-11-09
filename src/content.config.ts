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
      /** Detail page lede and meta description. */
      summary: z.string(),
      /** Home page (Work tab). The kicker above the title, e.g. "Internship · 2026". */
      tag: z.string(),
      /** One line under the title. */
      tagline: z.string(),
      /** The paragraph opening the expanded panel / carousel slide. */
      intro: z.string(),
      /** "How it works" steps, left to right (featured only). A step can carry a one-line detail. */
      flow: z.array(z.union([z.string(), z.object({ title: z.string(), detail: z.string() })])).default([]),
      /** One line under the flow when the chips simplify a branch (e.g. events that skip a stage). */
      flowNote: z.string().optional(),
      /** Extra diagram (src/diagrams/specs.mjs) shown in the expanded panel after the flow. */
      panelDiagram: z.string().optional(),
      /** "What I did" (featured) or the key points (carousel). */
      highlights: z.array(z.string()).min(1),
      /** Short state shown in the facts, e.g. "Shipped", "Rewrite in progress". */
      state: z.string(),
      /** Two-letter monogram on the featured row. */
      monogram: z.string().max(2).optional(),
      /** Describes the screenshot that will fill the media slot; shown as a placeholder until then. */
      mediaPlaceholder: z.string().optional(),
      /** One line that must always be visible (e.g. a legal or scope disclaimer). */
      note: z.string().optional(),
      /** Real screenshot (no client data). Alt text is required with it. */
      screenshot: image().optional(),
      screenshotAlt: z.string().optional(),
      screenshotCaption: z.string().optional(),
    })
    .refine((p) => !p.screenshot || !!p.screenshotAlt, { message: 'screenshot needs screenshotAlt' })
    .refine((p) => p.status !== 'featured' || (p.flow.length > 0 && !!p.monogram), {
      message: 'featured projects need flow and monogram',
    })
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
    /** Short lines; the lead role (order 1) shows them as a grid. */
    highlights: z.array(z.string()).default([]),
    /** Links the role to a project write-up instead of describing it twice. */
    project: reference('projects').optional(),
  }),
});

export const collections = { projects, experience };
