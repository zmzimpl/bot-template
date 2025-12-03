/**
 * Fuzzy Matching Utility
 * String similarity and fuzzy search using fuzzball
 */

import * as fuzzball from 'fuzzball';

// Alias fuzz functions
const fuzz = fuzzball;

/**
 * Match result interface
 */
export interface FuzzyMatch<T = string> {
  value: T;
  score: number;
  index: number;
}

/**
 * Calculate similarity ratio between two strings (0-100)
 */
export function ratio(s1: string, s2: string): number {
  return fuzz.ratio(s1, s2);
}

/**
 * Calculate partial ratio (best matching substring)
 */
export function partialRatio(s1: string, s2: string): number {
  return fuzz.partial_ratio(s1, s2);
}

/**
 * Token sort ratio (ignores word order)
 */
export function tokenSortRatio(s1: string, s2: string): number {
  return fuzz.token_sort_ratio(s1, s2);
}

/**
 * Token set ratio (ignores duplicates and word order)
 */
export function tokenSetRatio(s1: string, s2: string): number {
  return fuzz.token_set_ratio(s1, s2);
}

/**
 * Weighted ratio (combination of different algorithms)
 */
export function weightedRatio(s1: string, s2: string): number {
  return fuzz.WRatio(s1, s2);
}

/**
 * Quick ratio (faster but less accurate)
 */
export function quickRatio(s1: string, s2: string): number {
  return fuzz.ratio(s1, s2);
}

type ScorerFunction = (s1: string, s2: string) => number;

/**
 * Find the best match for a query in a list of choices
 */
export function extractBest<T>(
  query: string,
  choices: T[],
  options?: {
    processor?: (item: T) => string;
    scorer?: ScorerFunction;
    scoreThreshold?: number;
  }
): FuzzyMatch<T> | null {
  const processor = options?.processor || ((item: T) => String(item));
  const scorer = options?.scorer || fuzz.WRatio;
  const threshold = options?.scoreThreshold ?? 0;

  const stringChoices = choices.map(processor);
  const result = fuzz.extract(query, stringChoices, { scorer, limit: 1 });

  if (!result || result.length === 0 || result[0][1] < threshold) {
    return null;
  }

  return {
    value: choices[result[0][2]],
    score: result[0][1],
    index: result[0][2],
  };
}

/**
 * Extract top N matches for a query
 */
export function extractTop<T>(
  query: string,
  choices: T[],
  limit = 5,
  options?: {
    processor?: (item: T) => string;
    scorer?: ScorerFunction;
    scoreThreshold?: number;
  }
): FuzzyMatch<T>[] {
  const processor = options?.processor || ((item: T) => String(item));
  const scorer = options?.scorer || fuzz.WRatio;
  const threshold = options?.scoreThreshold ?? 0;

  const stringChoices = choices.map(processor);
  const results = fuzz.extract(query, stringChoices, { scorer, limit });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (results as any[])
    .filter((result) => result[1] >= threshold)
    .map((result) => ({
      value: choices[result[2]],
      score: result[1],
      index: result[2],
    }));
}

/**
 * Extract all matches above a threshold
 */
export function extractAll<T>(
  query: string,
  choices: T[],
  options?: {
    processor?: (item: T) => string;
    scorer?: ScorerFunction;
    scoreThreshold?: number;
  }
): FuzzyMatch<T>[] {
  const processor = options?.processor || ((item: T) => String(item));
  const scorer = options?.scorer || fuzz.WRatio;
  const threshold = options?.scoreThreshold ?? 60;

  const results: FuzzyMatch<T>[] = [];

  choices.forEach((choice, index) => {
    const score = scorer(query, processor(choice));
    if (score >= threshold) {
      results.push({ value: choice, score, index });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Deduplicate a list of strings by similarity
 */
export function dedupe(
  items: string[],
  threshold = 90
): string[] {
  const result: string[] = [];

  for (const item of items) {
    const isDuplicate = result.some(
      (existing) => fuzz.ratio(item, existing) >= threshold
    );
    if (!isDuplicate) {
      result.push(item);
    }
  }

  return result;
}

/**
 * Check if two strings are similar enough
 */
export function isSimilar(
  s1: string,
  s2: string,
  threshold = 80
): boolean {
  return fuzz.WRatio(s1, s2) >= threshold;
}

/**
 * Find similar items in a list
 */
export function findSimilar<T>(
  query: string,
  items: T[],
  options?: {
    processor?: (item: T) => string;
    threshold?: number;
  }
): T[] {
  const processor = options?.processor || ((item: T) => String(item));
  const threshold = options?.threshold ?? 80;

  return items.filter(
    (item) => fuzz.WRatio(query, processor(item)) >= threshold
  );
}

/**
 * Group similar items together
 */
export function groupSimilar<T>(
  items: T[],
  options?: {
    processor?: (item: T) => string;
    threshold?: number;
  }
): T[][] {
  const processor = options?.processor || ((item: T) => String(item));
  const threshold = options?.threshold ?? 80;

  const groups: T[][] = [];
  const used = new Set<number>();

  items.forEach((item, i) => {
    if (used.has(i)) return;

    const group: T[] = [item];
    used.add(i);

    items.forEach((other, j) => {
      if (i !== j && !used.has(j)) {
        if (fuzz.WRatio(processor(item), processor(other)) >= threshold) {
          group.push(other);
          used.add(j);
        }
      }
    });

    groups.push(group);
  });

  return groups;
}

// Re-export fuzz for advanced usage
export { fuzz };
