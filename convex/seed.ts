import { mutation } from "./_generated/server";

const ph = (name: string) =>
  `https://placehold.co/400x300/png?text=${encodeURIComponent(name)}`;

const EXERCISES = [
  { title: "Жим штанги лежачи", muscleGroup: "chest", description: "Ляжте на лаву, опустіть штангу до середини грудей і видихаючи видавіть угору." },
  { title: "Жим гантелей на похилій лаві", muscleGroup: "chest", description: "Лава під кутом 30°. Видавлюйте гантелі вгору, акцент на верх грудей." },
  { title: "Віджимання від підлоги", muscleGroup: "chest", description: "Тіло рівне, лікті під кутом 45°. Опускайтесь до торкання грудьми підлоги." },
  { title: "Розведення гантелей лежачи", muscleGroup: "chest", description: "Руки трохи зігнуті в ліктях, розводьте гантелі в боки до відчуття розтягнення." },
  { title: "Зведення рук у кросовері", muscleGroup: "chest", description: "Зводьте рукоятки блоків перед собою дугою, стискаючи груди в кінці." },
  { title: "Підтягування широким хватом", muscleGroup: "back", description: "Підтягніться до рівня підборіддя над перекладиною, зводячи лопатки." },
  { title: "Тяга штанги в нахилі", muscleGroup: "back", description: "Спина пряма, тягніть штангу до низу живота, лікті вздовж тіла." },
  { title: "Тяга верхнього блоку", muscleGroup: "back", description: "Тягніть рукоятку до верху грудей, зводячи лопатки, не розгойдуйте корпус." },
  { title: "Станова тяга", muscleGroup: "back", description: "Спина нейтральна, штанга близько до ніг. Піднімайтесь за рахунок ніг і спини." },
  { title: "Тяга гантелі однією рукою", muscleGroup: "back", description: "Упор коліном і рукою в лаву, тягніть гантель до пояса." },
  { title: "Присідання зі штангою", muscleGroup: "legs", description: "Штанга на трапеціях, присідайте до паралелі стегон з підлогою, коліна по лінії носків." },
  { title: "Жим ногами", muscleGroup: "legs", description: "У тренажері видавлюйте платформу, не розпрямляючи коліна повністю." },
  { title: "Румунська тяга", muscleGroup: "legs", description: "Майже прямі ноги, відводьте таз назад, штанга ковзає вздовж стегон." },
  { title: "Випади з гантелями", muscleGroup: "legs", description: "Крок уперед, опустіть заднє коліно до підлоги, поверніться у вихідне положення." },
  { title: "Підйом на носки стоячи", muscleGroup: "legs", description: "Піднімайтесь на носки на повну амплітуду, витримайте паузу вгорі." },
  { title: "Скручування лежачи", muscleGroup: "core", description: "Піднімайте лопатки від підлоги, скорочуючи прес, поперек притиснутий." },
  { title: "Планка", muscleGroup: "core", description: "Упор на передпліччях, тіло в одну лінію, живіт напружений." },
  { title: "Підйом ніг у висі", muscleGroup: "core", description: "Висячи на перекладині, піднімайте прямі ноги до паралелі з підлогою." },
  { title: "Російські скручування", muscleGroup: "core", description: "Сидячи з піднятими ногами, повертайте корпус із боку в бік." },
  { title: "Велосипед", muscleGroup: "core", description: "Лежачи, по черзі тягніть лікоть до протилежного коліна." },
  { title: "Підйом штанги на біцепс", muscleGroup: "arms", description: "Лікті притиснуті до корпусу, згинайте руки без розгойдування." },
  { title: "Молотки з гантелями", muscleGroup: "arms", description: "Нейтральний хват, згинайте руки по черзі, працює біцепс і передпліччя." },
  { title: "Французький жим лежачи", muscleGroup: "arms", description: "Опускайте штангу за голову, згинаючи лише лікті, і розгинайте назад." },
  { title: "Розгинання рук на блоці", muscleGroup: "arms", description: "Лікті притиснуті, розгинайте руки вниз до повного випрямлення." },
  { title: "Віджимання на брусах", muscleGroup: "arms", description: "Корпус вертикально, опускайтесь до кута 90° у ліктях, акцент на трицепс." },
];

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("exercises").first();
    if (existing) {
      return "Вправи вже додані, seed пропущено";
    }
    for (const ex of EXERCISES) {
      await ctx.db.insert("exercises", { ...ex, gifUrl: ph(ex.title) });
    }
    return `Додано вправ: ${EXERCISES.length}`;
  },
});