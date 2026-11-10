import data from '../data/github.json';

export interface RepoStats {
  stars: number;
  pushedAt: string;
  /** Language name -> share of bytes, 0..100, rounded. */
  languages: Record<string, number>;
}

const repos = (data as { repos: Record<string, RepoStats> }).repos;

/** Build-time stats for a github.com repo URL. */
export function statsFor(url: string | undefined): RepoStats | undefined {
  if (!url) return undefined;
  const m = url.match(/^https:\/\/github\.com\/([^/]+\/[^/#?]+)/);
  return m ? repos[m[1].toLowerCase()] : undefined;
}

/** Star counts below this are not shown: they read as weak, not as evidence. */
export const STAR_THRESHOLD = 10;
