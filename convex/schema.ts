import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    streakDays: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    weightKg: v.optional(v.number()),
    heightCm: v.optional(v.number()),
    birthYear: v.optional(v.number()),
    avatarStorageId: v.optional(v.id("_storage")),
    sex: v.optional(v.union(v.literal("male"), v.literal("female"))),
  }).index("email", ["email"]),

 exercises: defineTable({
  title: v.string(),
  muscleGroup: v.string(),
  gifUrl: v.string(),
  description: v.string(),
})
  .index("by_muscleGroup", ["muscleGroup"])
  .searchIndex("search_title", {
    searchField: "title",
    filterFields: ["muscleGroup"],
  }),

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
    performed: v.optional(
      v.array(
        v.object({
          exerciseId: v.id("exercises"),
          sets: v.array(
            v.object({ weightKg: v.number(), reps: v.number(), done: v.boolean() })
          ),
        })
      )
    ),
    tonnage: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});