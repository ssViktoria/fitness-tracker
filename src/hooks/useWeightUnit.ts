import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WeightUnit } from "@/utils/units";

const KEY = "fitpulse.weightUnit";
let current: WeightUnit = "kg";
let loaded = false;
const listeners = new Set<(u: WeightUnit) => void>();

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === "kg" || v === "lb") {
      current = v;
      listeners.forEach((l) => l(current));
    }
  } catch {}
}

export function useWeightUnit() {
  const [unit, setUnitState] = useState<WeightUnit>(current);

  useEffect(() => {
    listeners.add(setUnitState);
    setUnitState(current);
    void load();
    return () => {
      listeners.delete(setUnitState);
    };
  }, []);

  const setUnit = useCallback((u: WeightUnit) => {
    current = u;
    listeners.forEach((l) => l(u));
    AsyncStorage.setItem(KEY, u).catch(() => {});
  }, []);

  return { unit, setUnit };
}