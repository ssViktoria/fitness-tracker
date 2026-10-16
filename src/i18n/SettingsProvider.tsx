import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { colorScheme } from "nativewind";
import { storage } from "@/utils/storage";
import { translations, type Lang, type TKey } from "./translations";

export type ThemeMode = "system" | "light" | "dark";
type Vars = Record<string, string | number>;

type Ctx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  locale: string;
  t: (key: TKey, vars?: Vars) => string;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [lang, setLangState] = useState<Lang>("uk");

  useEffect(() => {
    (async () => {
      const m = await storage.get("pref_theme");
      const l = await storage.get("pref_lang");
      if (m === "light" || m === "dark" || m === "system") setModeState(m);
      if (l === "uk" || l === "en") setLangState(l);
    })();
  }, []);

  useEffect(() => {
    colorScheme.set(mode);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    storage.set("pref_theme", m);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set("pref_lang", l);
  }, []);

  const t = useCallback(
    (key: TKey, vars?: Vars) => {
      let s: string = translations[lang][key] ?? translations.uk[key] ?? key;
      if (vars) for (const k of Object.keys(vars)) s = s.replace(`{{${k}}}`, String(vars[k]));
      return s;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ mode, setMode, lang, setLang, t, locale: lang === "uk" ? "uk-UA" : "en-US" }),
    [mode, setMode, lang, setLang, t],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}