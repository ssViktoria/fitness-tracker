import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Запит для екрана «Вправи» і вікна вибору вправ: пошук + фільтр за групою м'язів.
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

const EXERCISES = [
  {
    title: "Жим штанги лежачи",
    muscleGroup: "chest",
    description: "Ляжте на лаву, опустіть штангу до середини грудей і видихаючи видавіть угору.",
    gifUrl: "bench-press",
  },
  {
    title: "Жим гантелей на похилій лаві",
    muscleGroup: "chest",
    description: "Лава під кутом 30°. Видавлюйте гантелі вгору, акцент на верх грудей.",
    gifUrl: "incline-db-press",
  },
  {
    title: "Віджимання від підлоги",
    muscleGroup: "chest",
    description: "Тіло рівне, лікті під кутом 45°. Опускайтесь до торкання грудьми підлоги.",
    gifUrl: "pushup",
  },
  {
    title: "Розведення гантелей лежачи",
    muscleGroup: "chest",
    description: "Руки трохи зігнуті в ліктях, розводьте гантелі в боки до відчуття розтягнення.",
    gifUrl: "chest-fly",
  },
  {
    title: "Зведення рук у кросовері",
    muscleGroup: "chest",
    description: "Зводьте рукоятки блоків перед собою дугою, стискаючи груди в кінці.",
    gifUrl: "cable-crossover",
  },
  {
    title: "Підтягування широким хватом",
    muscleGroup: "back",
    description: "Підтягніться до рівня підборіддя над перекладиною, зводячи лопатки.",
    gifUrl: "pullup",
  },
  {
    title: "Тяга штанги в нахилі",
    muscleGroup: "back",
    description: "Спина пряма, тягніть штангу до низу живота, лікті вздовж тіла.",
    gifUrl: "bent-row",
  },
  {
    title: "Тяга верхнього блоку",
    muscleGroup: "back",
    description: "Тягніть рукоятку до верху грудей, зводячи лопатки, не розгойдуйте корпус.",
    gifUrl: "lat-pulldown",
  },
  {
    title: "Станова тяга",
    muscleGroup: "back",
    description: "Спина нейтральна, штанга близько до ніг. Піднімайтесь за рахунок ніг і спини.",
    gifUrl: "deadlift",
  },
  {
    title: "Тяга гантелі однією рукою",
    muscleGroup: "back",
    description: "Упор коліном і рукою в лаву, тягніть гантель до пояса.",
    gifUrl: "one-arm-row",
  },
  {
    title: "Присідання зі штангою",
    muscleGroup: "legs",
    description: "Штанга на трапеціях, присідайте до паралелі стегон з підлогою, коліна по лінії носків.",
    gifUrl: "squat",
  },
  {
    title: "Жим ногами",
    muscleGroup: "legs",
    description: "У тренажері видавлюйте платформу, не розпрямляючи коліна повністю.",
    gifUrl: "leg-press",
  },
  {
    title: "Румунська тяга",
    muscleGroup: "legs",
    description: "Майже прямі ноги, відводьте таз назад, штанга ковзає вздовж стегон.",
    gifUrl: "rdl",
  },
  {
    title: "Випади з гантелями",
    muscleGroup: "legs",
    description: "Крок уперед, опустіть заднє коліно до підлоги, поверніться у вихідне положення.",
    gifUrl: "lunge",
  },
  {
    title: "Підйом на носки стоячи",
    muscleGroup: "legs",
    description: "Піднімайтесь на носки на повну амплітуду, витримайте паузу вгорі.",
    gifUrl: "calf-raise",
  },
  {
    title: "Скручування лежачи",
    muscleGroup: "core",
    description: "Піднімайте лопатки від підлоги, скорочуючи прес, поперек притиснутий.",
    gifUrl: "crunch",
  },
  {
    title: "Планка",
    muscleGroup: "core",
    description: "Упор на передпліччях, тіло в одну лінію, живіт напружений.",
    gifUrl: "plank",
  },
  {
    title: "Підйом ніг у висі",
    muscleGroup: "core",
    description: "Висячи на перекладині, піднімайте прямі ноги до паралелі з підлогою.",
    gifUrl: "leg-raise",
  },
  {
    title: "Російські скручування",
    muscleGroup: "core",
    description: "Сидячи з піднятими ногами, повертайте корпус із боку в бік.",
    gifUrl: "russian-twist",
  },
  {
    title: "Велосипед",
    muscleGroup: "core",
    description: "Лежачи, по черзі тягніть лікоть до протилежного коліна.",
    gifUrl: "bicycle",
  },
  {
    title: "Підйом штанги на біцепс",
    muscleGroup: "arms",
    description: "Лікті притиснуті до корпусу, згинайте руки без розгойдування.",
    gifUrl: "barbell-curl",
  },
  {
    title: "Молотки з гантелями",
    muscleGroup: "arms",
    description: "Нейтральний хват, згинайте руки по черзі, працює біцепс і передпліччя.",
    gifUrl: "hammer-curl",
  },
  {
    title: "Французький жим лежачи",
    muscleGroup: "arms",
    description: "Опускайте штангу за голову, згинаючи лише лікті, і розгинайте назад.",
    gifUrl: "skull-crusher",
  },
  {
    title: "Розгинання рук на блоці",
    muscleGroup: "arms",
    description: "Лікті притиснуті, розгинайте руки вниз до повного випрямлення.",
    gifUrl: "triceps-pushdown",
  },
  {
    title: "Віджимання на брусах",
    muscleGroup: "arms",
    description: "Корпус вертикально, опускайтесь до кута 90° у ліктях, акцент на трицепс.",
    gifUrl: "dips",
  },
];

// gifUrl: slug локальної гіфки (assets/exercises) або повне посилання https://...
// Запуск: npx convex run exercises:run
// Можна запускати багато разів: вправи з цієї таблиці оновлюються за назвою
// (нові гіфки підтягуються), відсутні додаються, старі заглушки placehold.co
// видаляються, якщо їх не використовує жодне збережене тренування.
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("exercises").collect();
    const byTitle = new Map(all.map((e) => [e.title, e]));

    let inserted = 0;
    let updated = 0;
    for (const ex of EXERCISES) {
      const found = byTitle.get(ex.title);
      if (found) {
        await ctx.db.patch(found._id, ex);
        updated++;
      } else {
        await ctx.db.insert("exercises", ex);
        inserted++;
      }
    }

    const used = new Set<string>();
    for (const w of await ctx.db.query("workouts").collect()) {
      for (const it of w.exercises) used.add(it.exerciseId);
    }
    const titles = new Set(EXERCISES.map((e) => e.title));
    let removed = 0;
    for (const e of all) {
      if (!titles.has(e.title) && e.gifUrl.includes("placehold.co") && !used.has(e._id)) {
        await ctx.db.delete(e._id);
        removed++;
      }
    }

    return `Додано: ${inserted}, оновлено: ${updated}, видалено заглушок: ${removed}`;
  },
});
