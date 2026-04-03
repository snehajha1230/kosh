import type { CategorySpend } from "./aggregates";

export type TreemapRect = CategorySpend & {
  /** Normalized 0–1 coordinates within the container */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Nested treemap-style layout: repeatedly splits the rectangle by ~half of total value.
 * Produces rectangles whose areas are proportional to category totals (approximate squarified look).
 */
export function layoutIncomeTreemap(items: CategorySpend[]): TreemapRect[] {
  const positive = items.filter((i) => i.total > 0);
  if (positive.length === 0) return [];

  function recur(
    slice: CategorySpend[],
    x: number,
    y: number,
    w: number,
    h: number,
  ): TreemapRect[] {
    if (slice.length === 0) return [];
    if (slice.length === 1) {
      const [one] = slice;
      return [{ ...one, x, y, w, h }];
    }

    const sorted = [...slice].sort((a, b) => b.total - a.total);
    const total = sorted.reduce((s, i) => s + i.total, 0);
    if (total <= 0) return [];

    let acc = 0;
    let splitIdx = sorted.length - 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      acc += sorted[i].total;
      if (acc >= total / 2) {
        splitIdx = i + 1;
        break;
      }
    }

    const left = sorted.slice(0, splitIdx);
    const right = sorted.slice(splitIdx);
    const sumL = left.reduce((s, i) => s + i.total, 0);
    const frac = sumL / total;

    if (w >= h) {
      const w1 = w * frac;
      return [
        ...recur(left, x, y, w1, h),
        ...recur(right, x + w1, y, w - w1, h),
      ];
    }

    const h1 = h * frac;
    return [
      ...recur(left, x, y, w, h1),
      ...recur(right, x, y + h1, w, h - h1),
    ];
  }

  return recur(positive, 0, 0, 1, 1);
}
