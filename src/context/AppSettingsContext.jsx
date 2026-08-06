import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { TRANSLATIONS, FEEDBACK_TRANSLATIONS, formatAmountWith } from "../lib/i18n";

const AppSettingsContext = createContext(null);
export function useAppSettings() {
  return useContext(AppSettingsContext);
}
// Convenience hooks so components only pull in what they need.
export function useLang() {
  const { lang, setLang, t, dir } = useAppSettings();
  return { lang, setLang, t, dir };
}
export function useCurrency() {
  const { currency, setCurrency, formatAmount } = useAppSettings();
  return { currency, setCurrency, formatAmount };
}

export function AppSettingsProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("qar");

  const t = useCallback((path, fallback, params) => {
    const lookup = (dict) => path.split(".").reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict
    );
    let result = lookup(TRANSLATIONS[lang]);
    if (result === undefined) result = lookup(TRANSLATIONS.en);
    if (result === undefined) result = fallback !== undefined ? fallback : path;
    if (typeof result === "string" && params) {
      Object.keys(params).forEach((key) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, "g"), params[key]);
      });
    }
    return result;
  }, [lang]);

  // Same fallback pattern as t(), scoped to the per-page feedback toasts.
  const tFeedback = useCallback((kind, pageKey, fallback) => {
    const dict = FEEDBACK_TRANSLATIONS[lang] || FEEDBACK_TRANSLATIONS.en;
    return dict[kind]?.[pageKey] || FEEDBACK_TRANSLATIONS.en[kind]?.[pageKey] || fallback;
  }, [lang]);

  const formatAmount = useCallback((value) => formatAmountWith(currency, value), [currency]);

  const dir = lang === "ar" ? "rtl" : "ltr";

  // Reflects the active language on <html> globally (lang + text direction)
  // so native browser behavior (fonts, RTL flow for Arabic) applies
  // app-wide immediately, without a reload.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  const value = useMemo(
    () => ({ lang, setLang, currency, setCurrency, t, tFeedback, formatAmount, dir }),
    [lang, currency, t, tFeedback, formatAmount, dir]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

