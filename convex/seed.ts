import { mutation } from "./_generated/server";

// Єдине джерело вправ. gifUrl — посилання на гіфку з сайту.
// Запуск: npx convex run seedExercises:run
// Можна запускати багато разів: існуючі вправи оновлюються за назвою,
// відсутні додаються, старі вправи-заглушки (placehold.co) прибираються,
// якщо їх не використовує жодне збережене тренування.

const EXERCISES = [
  {
    title: "Жим штанги лежачи",
    muscleGroup: "chest",
    description: "Ляжте на лаву, опустіть штангу до середини грудей і видихаючи видавіть угору.",
    gifUrl: "https://v2.exercisedb.io/image/gGMT8ESWW0y0pC",
  },
  {
    title: "Жим гантелей на похилій лаві",
    muscleGroup: "chest",
    description: "Лава під кутом 30°. Видавлюйте гантелі вгору, акцент на верх грудей.",
    gifUrl: "https://v2.exercisedb.io/image/pEJCWZ22USVJkd",
  },
  {
    title: "Віджимання від підлоги",
    muscleGroup: "chest",
    description: "Тіло рівне, лікті під кутом 45°. Опускайтесь до торкання грудьми підлоги.",
    gifUrl: "https://v2.exercisedb.io/image/GxJlcFBjtqVRsv",
  },
  {
    title: "Розведення гантелей лежачи",
    muscleGroup: "chest",
    description: "Руки трохи зігнуті в ліктях, розводьте гантелі в боки до відчуття розтягнення.",
    gifUrl: "https://v2.exercisedb.io/image/LhTRXKFDOcgFHR",
  },
  {
    title: "Зведення рук у кросовері",
    muscleGroup: "chest",
    description: "Зводьте рукоятки блоків перед собою дугою, стискаючи груди в кінці.",
    gifUrl: "https://v2.exercisedb.io/image/GGG9Op-pn9zCaA",
  },
  {
    title: "Підтягування широким хватом",
    muscleGroup: "back",
    description: "Підтягніться до рівня підборіддя над перекладиною, зводячи лопатки.",
    gifUrl: "https://v2.exercisedb.io/image/vLwBJE1lMxZeXZ",
  },
  {
    title: "Тяга штанги в нахилі",
    muscleGroup: "back",
    description: "Спина пряма, тягніть штангу до низу живота, лікті вздовж тіла.",
    gifUrl: "https://v2.exercisedb.io/image/UaWFHDNMfCVeAB",
  },
  {
    title: "Тяга верхнього блоку",
    muscleGroup: "back",
    description: "Тягніть рукоятку до верху грудей, зводячи лопатки, не розгойдуйте корпус.",
    gifUrl: "https://v2.exercisedb.io/image/LijxMGVnKHzHaR",
  },
  {
    title: "Станова тяга",
    muscleGroup: "back",
    description: "Спина нейтральна, штанга близько до ніг. Піднімайтесь за рахунок ніг і спини.",
    gifUrl: "https://v2.exercisedb.io/image/gBGTLBfxK9GRYW",
  },
  {
    title: "Тяга гантелі однією рукою",
    muscleGroup: "back",
    description: "Упор коліном і рукою в лаву, тягніть гантель до пояса.",
    gifUrl: "https://v2.exercisedb.io/image/iYBLEGjTVxNNJZ",
  },
  {
    title: "Присідання зі штангою",
    muscleGroup: "legs",
    description: "Штанга на трапеціях, присідайте до паралелі стегон з підлогою, коліна по лінії носків.",
    gifUrl: "https://v2.exercisedb.io/image/uiVRRNKCMzMBNn",
  },
  {
    title: "Жим ногами",
    muscleGroup: "legs",
    description: "У тренажері видавлюйте платформу, не розпрямляючи коліна повністю.",
    gifUrl: "https://v2.exercisedb.io/image/MvEKWwCGwB2GBs",
  },
  {
    title: "Румунська тяга",
    muscleGroup: "legs",
    description: "Майже прямі ноги, відводьте таз назад, штанга ковзає вздовж стегон.",
    gifUrl: "https://v2.exercisedb.io/image/1jFYiIMvUZoM8C",
  },
  {
    title: "Випади з гантелями",
    muscleGroup: "legs",
    description: "Крок уперед, опустіть заднє коліно до підлоги, поверніться у вихідне положення.",
    gifUrl: "https://v2.exercisedb.io/image/3d3MJoFMhMgXmC",
  },
  {
    title: "Підйом на носки стоячи",
    muscleGroup: "legs",
    description: "Піднімайтесь на носки на повну амплітуду, витримайте паузу вгорі.",
    gifUrl: "https://v2.exercisedb.io/image/HnIstEciLCVBxL",
  },
  {
    title: "Скручування лежачи",
    muscleGroup: "core",
    description: "Піднімайте лопатки від підлоги, скорочуючи прес, поперек притиснутий.",
    gifUrl: "https://v2.exercisedb.io/image/2JmhRjn2yKS8bG",
  },
  {
    title: "Планка",
    muscleGroup: "core",
    description: "Упор на передпліччях, тіло в одну лінію, живіт напружений.",
    gifUrl: "https://v2.exercisedb.io/image/TxFjKgFRuGDhEP",
  },
  {
    title: "Підйом ніг у висі",
    muscleGroup: "core",
    description: "Висячи на перекладині, піднімайте прямі ноги до паралелі з підлогою.",
    gifUrl: "https://v2.exercisedb.io/image/kGFyS5bqiC2SjK",
  },
  {
    title: "Скручування",
    muscleGroup: "core",
    description: "Сидячи з піднятими ногами, повертайте корпус із боку в бік.",
    gifUrl: "https://v2.exercisedb.io/image/RjBT4AcJp3gDsC",
  },
  {
    title: "Велосипед",
    muscleGroup: "core",
    description: "Лежачи, по черзі тягніть лікоть до протилежного коліна.",
    gifUrl: "https://v2.exercisedb.io/image/bGCVuHFGIXwqX8",
  },
  {
    title: "Підйом штанги на біцепс",
    muscleGroup: "arms",
    description: "Лікті притиснуті до корпусу, згинайте руки без розгойдування.",
    gifUrl: "https://v2.exercisedb.io/image/vJaEfXqvqQXHxY",
  },
  {
    title: "Молотки з гантелями",
    muscleGroup: "arms",
    description: "Нейтральний хват, згинайте руки по черзі, працює біцепс і передпліччя.",
    gifUrl: "https://v2.exercisedb.io/image/FTGDBsHNfzJlKN",
  },
  {
    title: "Французький жим лежачи",
    muscleGroup: "arms",
    description: "Опускайте штангу за голову, згинаючи лише лікті, і розгинайте назад.",
    gifUrl: "https://v2.exercisedb.io/image/bMGoRxVb2vgjnU",
  },
  {
    title: "Розгинання рук на блоці",
    muscleGroup: "arms",
    description: "Лікті притиснуті, розгинайте руки вниз до повного випрямлення.",
    gifUrl: "https://v2.exercisedb.io/image/OEbJZqlGpHVKqB",
  },
  {
    title: "Віджимання на брусах",
    muscleGroup: "arms",
    description: "Корпус вертикально, опускайтесь до кута 90° у ліктях, акцент на трицепс.",
    gifUrl: "https://v2.exercisedb.io/image/OWHqWbMXmRXY6S",
  },
];

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

    // прибираємо вправи-заглушки зі старого seed, якщо вони ніде не використані
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