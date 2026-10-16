import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const DAY = 86_400_000;
const KCAL_PER_MIN = 6; // груба оцінка для силового тренування

const tonnageOf = (exs: { sets: number; reps: number; weightKg: number }[]) =>
  exs.reduce((s, e) => s + e.sets * e.reps * e.weightKg, 0);

export const stats = query({
  args: { days: v.number(), tzOffset: v.number() },
  handler: async (ctx, { days, tzOffset }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const shift = -tzOffset * 60_000;
    const todayKey = Math.floor((Date.now() + shift) / DAY) * DAY;
    const fromKey = todayKey - (days - 1) * DAY;

    const workouts = (
      await ctx.db
        .query("workouts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    ).filter(
      (w) => w.isCompleted && w.completedAt && w.completedAt + shift >= fromKey,
    );

    const buckets = new Map<number, { tonnage: number; calories: number; count: number }>();
    for (let i = 0; i < days; i++) {
      buckets.set(fromKey + i * DAY, { tonnage: 0, calories: 0, count: 0 });
    }

    let totalTonnage = 0;
    let totalCalories = 0;
    for (const w of workouts) {
      const key = Math.floor((w.completedAt! + shift) / DAY) * DAY;
      const b = buckets.get(key);
      if (!b) continue;
      const t = tonnageOf(w.exercises);
      const c = Math.round(w.durationMinutes * KCAL_PER_MIN);
      b.tonnage += t;
      b.calories += c;
      b.count += 1;
      totalTonnage += t;
      totalCalories += c;
    }

    return {
      totals: { workouts: workouts.length, tonnage: totalTonnage, calories: totalCalories },
      days: [...buckets.entries()].map(([key, b]) => {
        const d = new Date(key);
        const label = `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        return { label, ...b };
      }),
    };
  },
});

export const history = query({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const from = Date.now() - days * DAY;
    const workouts = (
      await ctx.db
        .query("workouts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    )
      .filter((w) => w.isCompleted && w.completedAt && w.completedAt >= from)
      .sort((a, b) => b.completedAt! - a.completedAt!)
      .slice(0, 50);

    return await Promise.all(
      workouts.map(async (w) => ({
        _id: w._id,
        title: w.title,
        completedAt: w.completedAt!,
        durationMinutes: w.durationMinutes,
        tonnage: tonnageOf(w.exercises),
        calories: Math.round(w.durationMinutes * KCAL_PER_MIN),
        exercises: await Promise.all(
          w.exercises.map(async (e) => ({
            title: (await ctx.db.get(e.exerciseId))?.title ?? "—",
            sets: e.sets,
            reps: e.reps,
            weightKg: e.weightKg,
          })),
        ),
      })),
    );
  },
});