export function timeDecay(createdAt: Date, now: Date, halfLifeDays: number): number {
  const ageMs = Math.max(0, now.getTime() - createdAt.getTime());
  const ageDays = ageMs / 86_400_000;
  return Math.pow(0.5, ageDays / halfLifeDays);
}

export function normalizeScores(scores: Record<string, number>): Record<string, number> {
  const max = Math.max(0, ...Object.values(scores));
  if (max === 0) {
    return scores;
  }
  return Object.fromEntries(Object.entries(scores).map(([key, value]) => [key, value / max]));
}
