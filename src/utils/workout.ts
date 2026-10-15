export type SetDraft = {
  weight: string;
  reps: string;
  done: boolean;
};

export type ExerciseBlock = {
  exerciseId: string;
  title: string;
  muscleGroup: string;
  sets: SetDraft[];
};

export function parseSet(s: SetDraft) {
  const weightKg = Number(s.weight.replace(",", "."));
  const reps = Number(s.reps);
  const weightValid = s.weight.trim() !== "" && Number.isFinite(weightKg) && weightKg >= 0;
  const repsValid = /^\d+$/.test(s.reps) && reps >= 1;
  return {
    weightKg: weightValid ? weightKg : 0,
    reps: repsValid ? reps : 0,
    weightValid,
    repsValid,
    valid: weightValid && repsValid,
  };
}

// Тоннаж = сума (вага × повторення) по виконаних підходах
export function calcTonnage(blocks: ExerciseBlock[]) {
  let total = 0;
  for (const b of blocks) {
    for (const s of b.sets) {
      if (!s.done) continue;
      const p = parseSet(s);
      if (p.valid) total += p.weightKg * p.reps;
    }
  }
  return total;
}