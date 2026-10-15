import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    streakDays: v.number(),
    avatarUrl: v.optional(v.string()),
  }),

  exercises: defineTable({
    title: v.string(),
    muscleGroup: v.string(), 
    gifUrl: v.string(),
    description: v.string(),
  }).index("by_muscleGroup", ["muscleGroup"]),

  workouts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    durationMinutes: v.number(),
    exercises: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        sets: v.number(),
        reps: v.number(),
        weightKg: v.number(),
      })
    ),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});