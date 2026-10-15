import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, requireUserId } from "./lib/auth";

const exerciseItem = v.object({
  exerciseId: v.id("exercises"),
  sets: v.number(),
  reps: v.number(),
  weightKg: v.number(),
});

function validate(title: string, exercises: { sets: number; reps: number; weightKg: number }[]) {
  if (!title.trim()) throw new Error("Вкажіть назву тренування");
  if (exercises.length === 0) throw new Error("Додайте хоча б одну вправу");
  for (const e of exercises) {
    if (e.sets < 1 || e.reps < 1 || e.weightKg < 0) {
      throw new Error("Підходи й повторення мають бути більше нуля");
    }
  }
}

// 4.1: створити
export const create = mutation({
  args: {
    title: v.string(),
    durationMinutes: v.number(),
    exercises: v.array(exerciseItem),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    validate(args.title, args.exercises);
    return await ctx.db.insert("workouts", {
      userId,
      title: args.title.trim(),
      durationMinutes: args.durationMinutes,
      exercises: args.exercises,
      isCompleted: false,
    });
  },
});

// 4.1: оновити
export const update = mutation({
  args: {
    id: v.id("workouts"),
    title: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    exercises: v.optional(v.array(exerciseItem)),
  },
  handler: async (ctx, { id, ...patch }) => {
    const userId = await requireUserId(ctx);
    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) throw new Error("Тренування не знайдено");

    validate(patch.title ?? workout.title, patch.exercises ?? workout.exercises);
    await ctx.db.patch(id, {
      ...patch,
      ...(patch.title !== undefined && { title: patch.title.trim() }),
    });
  },
});

// 4.1: видалити
export const remove = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx);
    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) throw new Error("Тренування не знайдено");
    await ctx.db.delete(id);
  },
});

export const get = query({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const workout = await ctx.db.get(id);
    return workout && workout.userId === userId ? workout : null;
  },
});

// 5.1: тренування разом з назвами вправ для активного режиму
export const getWithExercises = query({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) return null;

    const items = await Promise.all(
      workout.exercises.map(async (e) => {
        const ex = await ctx.db.get(e.exerciseId);
        return {
          exerciseId: e.exerciseId,
          sets: e.sets,
          reps: e.reps,
          weightKg: e.weightKg,
          title: ex?.title ?? "Вправа",
          muscleGroup: ex?.muscleGroup ?? "",
        };
      })
    );
    return { ...workout, items };
  },
});

// 4.4: «план на сьогодні» = останнє незавершене тренування
export const getTodayPlan = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("workouts")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), userId), q.eq(q.field("isCompleted"), false))
      )
      .order("desc")
      .first();
  },
});

// 4.5: історія завершених тренувань
export const history = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("workouts")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), userId), q.eq(q.field("isCompleted"), true))
      )
      .order("desc")
      .take(50);
  },
});

// 5.3 + 5.4: завершити тренування, порахувати тоннаж, оновити стрік
export const complete = mutation({
  args: {
    id: v.id("workouts"),
    durationSeconds: v.number(),
    // new Date().getTimezoneOffset() з клієнта, щоб «день» рахувався за локальним часом
    tzOffsetMinutes: v.number(),
    performed: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        sets: v.array(
          v.object({ weightKg: v.number(), reps: v.number(), done: v.boolean() })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const workout = await ctx.db.get(args.id);
    if (!workout || workout.userId !== userId) throw new Error("Тренування не знайдено");
    if (workout.isCompleted) throw new Error("Це тренування вже завершено");

    let tonnage = 0;
    let doneSets = 0;
    for (const block of args.performed) {
      for (const s of block.sets) {
        if (!s.done) continue;
        if (s.reps < 1 || s.weightKg < 0) {
          throw new Error("Некоректні вага або повторення у виконаному підході");
        }
        doneSets++;
        tonnage += s.weightKg * s.reps;
      }
    }
    if (doneSets === 0) throw new Error("Познач хоча б один підхід виконаним");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      performed: args.performed,
      tonnage,
      durationSeconds: args.durationSeconds,
      durationMinutes: Math.max(1, Math.round(args.durationSeconds / 60)),
      isCompleted: true,
      completedAt: now,
    });

    // --- стрік: скільки днів поспіль є завершені тренування ---
    const DAY = 86_400_000;
    const dayIndex = (ts: number) => Math.floor((ts - args.tzOffsetMinutes * 60_000) / DAY);

    const completed = await ctx.db
      .query("workouts")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), userId), q.eq(q.field("isCompleted"), true))
      )
      .collect();

    const days = new Set(
      completed.filter((w) => w.completedAt !== undefined).map((w) => dayIndex(w.completedAt!))
    );

    let streak = 0;
    for (let d = dayIndex(now); days.has(d); d--) streak++;

    await ctx.db.patch(userId, { streakDays: streak });

    return { tonnage, streakDays: streak };
  },
});