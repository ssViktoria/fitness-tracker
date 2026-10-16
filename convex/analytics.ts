import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const DAY = 86_400_000;

type Body = { weightKg: number; heightCm: number; age: number; sex: "male" | "female" };

const DEFAULT: Body = { weightKg: 70, heightCm: 175, age: 25, sex: "male" };

const bodyOf = (u: Doc<"users"> | null): Body => ({
  weightKg: u?.weightKg ?? DEFAULT.weightKg,
  heightCm: u?.heightCm ?? DEFAULT.heightCm,
  age: u?.birthYear ? new Date().getFullYear() - u.birthYear : DEFAULT.age,
  sex: u?.sex ?? DEFAULT.sex,
});

const plannedTonnage = (exs: { sets: number; reps: number; weightKg: number }[]) =>
  exs.reduce((s, e) => s + e.sets * e.reps * e.weightKg, 0);

const tonnageOf = (w: Doc<"workouts">) => {
  const t = (w as { tonnage?: number }).tonnage;
  return typeof t === "number" ? t : plannedTonnage(w.exercises);
};

const bmrOf = (b: Body) =>
  10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === "male" ? 5 : -161);

// MET росте з інтенсивністю: кг піднято за хвилину на кг ваги тіла
const metOf = (tonnage: number, minutes: number, b: Body) => {
  const intensity = tonnage / (Math.max(minutes, 1) * b.weightKg);
  return Math.min(8, Math.max(3, 3 + intensity * 0.35));
};

const caloriesOf = (w: Doc<"workouts">, b: Body) => {
  const met = metOf(tonnageOf(w), w.durationMinutes, b);
  return Math.round(met * (bmrOf(b) / 24) * (w.durationMinutes / 60));
};

export const stats = query({
  args: { days: v.number(), tzOffset: v.number() },
  handler: async (ctx, { days, tzOffset }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const body = bodyOf(await ctx.db.get(userId));

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
      const t = Math.round(tonnageOf(w));
      const c = caloriesOf(w, body);
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

    const body = bodyOf(await ctx.db.get(userId));

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
        tonnage: Math.round(tonnageOf(w)),
        calories: caloriesOf(w, body),
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