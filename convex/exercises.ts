import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    search: v.optional(v.string()),
    muscleGroup: v.optional(v.string()),
  },
  handler: async (ctx, { search, muscleGroup }) => {
    const term = search?.trim();

    if (term) {
      return await ctx.db
        .query("exercises")
        .withSearchIndex("search_title", (q) => {
          const s = q.search("title", term);
          return muscleGroup ? s.eq("muscleGroup", muscleGroup) : s;
        })
        .take(50);
    }

    if (muscleGroup) {
      return await ctx.db
        .query("exercises")
        .withIndex("by_muscleGroup", (q) => q.eq("muscleGroup", muscleGroup))
        .take(100);
    }

    return await ctx.db.query("exercises").take(100);
  },
});

const ph = (t: string) => `https://placehold.co/600x400/1E293B/22C55E.gif?text=${encodeURIComponent(t)}`;

const SEED = [
  ["Жим лежачи", "chest", "Лежачи на лаві опустіть штангу до грудей і видихаючи видавіть угору."],
  ["Жим гантелей на похилій лаві", "chest", "Похила лава 30°, гантелі опускайте до рівня грудей."],
  ["Розведення гантелей лежачи", "chest", "Злегка зігніть лікті, розводьте гантелі дугою до відчуття розтягу."],
  ["Віджимання", "chest", "Тіло рівною лінією, опускайтесь до торкання грудьми підлоги."],
  ["Станова тяга", "back", "Спина пряма, штанга рухається вздовж ніг, піднімайтесь за рахунок ніг і спини."],
  ["Підтягування", "back", "Хват ширший за плечі, підтягуйтесь до підборіддя вище перекладини."],
  ["Тяга штанги в нахилі", "back", "Корпус майже паралельно підлозі, тягніть штангу до живота."],
  ["Тяга верхнього блока", "back", "Тягніть рукоять до верху грудей, зводячи лопатки."],
  ["Присідання зі штангою", "legs", "Штанга на трапеціях, присідайте до паралелі стегон з підлогою."],
  ["Жим ногами", "legs", "Стопи на ширині плечей, не розпрямляйте коліна повністю."],
  ["Випади", "legs", "Крок вперед, коліно задньої ноги майже торкається підлоги."],
  ["Румунська тяга", "legs", "Ноги злегка зігнуті, відводьте таз назад, штанга ковзає вздовж стегон."],
  ["Скручування", "core", "Лежачи, піднімайте лопатки від підлоги, напружуючи прес."],
  ["Планка", "core", "Спираючись на передпліччя, тримайте тіло рівною лінією."],
  ["Підйом ніг у висі", "core", "У висі на перекладині піднімайте прямі ноги до паралелі."],
  ["Підйом штанги на біцепс", "arms", "Лікті притиснуті до корпусу, піднімайте штангу без розгойдування."],
  ["Молотки", "arms", "Нейтральний хват гантелей, підйом по черзі."],
  ["Французький жим", "arms", "Лежачи, опускайте штангу за голову, згинаючи лише лікті."],
  ["Віджимання на брусах", "arms", "Корпус вертикально, опускайтесь до кута 90° у ліктях."],
] as const;

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("exercises").first();
    if (existing) return "already seeded";
    for (const [title, muscleGroup, description] of SEED) {
      await ctx.db.insert("exercises", { title, muscleGroup, description, gifUrl: ph(title) });
    }
    return `inserted ${SEED.length}`;
  },
});