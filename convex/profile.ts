import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const done = (
      await ctx.db
        .query("workouts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    ).filter((w) => w.isCompleted);

    const tonnage = done.reduce((s, w) => {
      const t = (w as { tonnage?: number }).tonnage;
      return (
        s +
        (typeof t === "number"
          ? t
          : w.exercises.reduce((a, e) => a + e.sets * e.reps * e.weightKg, 0))
      );
    }, 0);

    const avatarUrl = user.avatarStorageId
      ? await ctx.storage.getUrl(user.avatarStorageId)
      : null;

    return {
      name: user.name ?? "",
      email: user.email ?? "",
      avatarUrl,
      weightKg: user.weightKg ?? null,
      heightCm: user.heightCm ?? null,
      birthYear: user.birthYear ?? null,
      sex: user.sex ?? null,
      streakDays: user.streakDays ?? 0,
      workouts: done.length,
      tonnage: Math.round(tonnage),
      minutes: done.reduce((s, w) => s + w.durationMinutes, 0),
      since: user._creationTime,
    };
  },
});

export const update = mutation({
  args: {
    name: v.string(),
    weightKg: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    birthYear: v.optional(v.number()),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
  },
  handler: async (ctx, { name, weightKg, heightCm, birthYear, sex }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Не авторизовано");
    const n = name.trim();
    if (n.length < 2) throw new Error("Ім'я має містити мінімум 2 символи");
    if (weightKg !== undefined && (weightKg < 30 || weightKg > 300))
      throw new Error("Вага має бути від 30 до 300 кг");
    if (heightCm !== undefined && (heightCm < 120 || heightCm > 250))
      throw new Error("Ріст має бути від 120 до 250 см");
    const year = new Date().getFullYear();
    if (birthYear !== undefined && (birthYear < year - 100 || birthYear > year - 10))
      throw new Error("Некоректний рік народження");
    await ctx.db.patch(userId, { name: n, weightKg, heightCm, birthYear, sex });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Не авторизовано");
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAvatar = mutation({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Не авторизовано");
    const user = await ctx.db.get(userId);
    if (user?.avatarStorageId && user.avatarStorageId !== storageId) {
      await ctx.storage.delete(user.avatarStorageId);
    }
    await ctx.db.patch(userId, { avatarStorageId: storageId });
  },
});