import type { MeasurementRun } from "@/lib/measurement";

export type TrendPoint = {
  day: string; // YYYY-MM-DD
  overall: number;
  count: number;
};

export function buildTrend(runs: MeasurementRun[], days = 7): {
  trend: "up" | "flat" | "down" | "unavailable";
  points: TrendPoint[];
} {
  if (runs.length === 0) {
    return { trend: "unavailable", points: [] };
  }

  const byDay = new Map<string, { sum: number; count: number }>();
  for (const run of runs) {
    const day = (run.response.measuredAt || run.createdAt).slice(0, 10);
    const cur = byDay.get(day) || { sum: 0, count: 0 };
    cur.sum += run.scores.overall;
    cur.count += 1;
    byDay.set(day, cur);
  }

  const points: TrendPoint[] = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-days)
    .map(([day, v]) => ({
      day,
      overall: Math.round(v.sum / v.count),
      count: v.count,
    }));

  if (points.length < 2) {
    return { trend: "unavailable", points };
  }

  const first = points[0].overall;
  const last = points[points.length - 1].overall;
  const delta = last - first;
  const trend = delta > 2 ? "up" : delta < -2 ? "down" : "flat";
  return { trend, points };
}
