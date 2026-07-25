export interface SalaryBucket {
  min: number;
  max: number | null; // null = open-ended (last bucket, "X+")
}

// Widens from fine-grained (10k) to coarse (10M) steps so a small salary
// span gets tight buckets and a huge span doesn't produce dozens of them.
const NICE_STEPS = [10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000];

/** Splits [floor, ceiling] into a handful of round-number buckets for a salary-range filter. */
export function buildSalaryBuckets(floor: number, ceiling: number, targetBucketCount = 6): SalaryBucket[] {
  if (!(ceiling > floor)) return [];

  const rawStep = (ceiling - floor) / targetBucketCount;
  const step = NICE_STEPS.find((s) => s >= rawStep) ?? NICE_STEPS.at(-1) ?? rawStep;

  const buckets: SalaryBucket[] = [];
  let cursor = Math.floor(floor / step) * step;
  while (cursor < ceiling) {
    const next = cursor + step;
    buckets.push({ min: Math.max(cursor, floor), max: next >= ceiling ? null : next });
    cursor = next;
  }
  return buckets;
}

export function bucketKey(bucket: SalaryBucket): string {
  return `${bucket.min}-${bucket.max ?? ""}`;
}

export function formatBucketLabel(bucket: SalaryBucket): string {
  const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  return bucket.max === null ? `${naira(bucket.min)}+` : `${naira(bucket.min)} – ${naira(bucket.max)}`;
}
