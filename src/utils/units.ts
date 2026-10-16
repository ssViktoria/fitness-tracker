export type WeightUnit = "kg" | "lb";

const LB_PER_KG = 2.20462262185;

export const kgToLb = (kg: number) => kg * LB_PER_KG;
export const lbToKg = (lb: number) => lb / LB_PER_KG;

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const round2 = (n: number) => Math.round(n * 100) / 100;

export const toUnit = (kg: number, unit: WeightUnit) => (unit === "lb" ? kgToLb(kg) : kg);
export const fromUnit = (value: number, unit: WeightUnit) => (unit === "lb" ? lbToKg(value) : value);

export const unitLabel = (unit: WeightUnit, locale: string) => {
  const uk = locale.startsWith("uk");
  if (unit === "lb") return uk ? "фунт" : "lb";
  return uk ? "кг" : "kg";
};

export function formatWeight(kg: number, unit: WeightUnit, locale: string) {
  const v = unit === "lb" ? Math.round(kgToLb(kg)) : round1(kg);
  return `${v.toLocaleString(locale)} ${unitLabel(unit, locale)}`;
}