import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// Рахує дні тренувань поспіль і зберігає в users.streakDays.
// tzOffsetMinutes = new Date().getTimezoneOffset() з клієнта.
export const refreshStreak = mutation({
  args: { tzOffsetMinutes: v.optional(v.number()) },
  handler: async (ctx, { tzOffsetMinutes = 0 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const DAY = 86_400_000;
    const toDay = (ts: number) =>
      Math.floor((ts - tzOffsetMinutes * 60_000) / DAY);

    const days = new Set(
      workouts
        .filter((w) => w.isCompleted && w.completedAt !== undefined)
        .map((w) => toDay(w.completedAt!))
    );

    const today = toDay(Date.now());
    // Якщо сьогодні ще не тренувались, стрік не рветься до кінця дня
    let cursor = days.has(today) ? today : today - 1;
    let streak = 0;
    while (days.has(cursor)) {
      streak++;
      cursor--;
    }

    await ctx.db.patch(userId, { streakDays: streak });
    return streak;
  },
});