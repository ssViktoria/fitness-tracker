import { useColorScheme } from "nativewind";

const palette = {
  light: { bg: "#F8FAFC", surface: "#FFFFFF", text: "#0F172A", border: "#E2E8F0" },
  dark: { bg: "#0F172A", surface: "#1E293B", text: "#F1F5F9", border: "#334155" },
};

export function useTheme() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  return { dark, c: dark ? palette.dark : palette.light, muted: "#64748B", primary: "#22C55E" };
}