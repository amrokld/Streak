import { createContext, useContext, useState, useEffect } from "react";
import { en } from "../locales/en";
import { ar } from "../locales/ar";

const translations = { en, ar };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("streak_lang") || "en";
  });

  // Set document direction + font whenever language changes
  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;

    // Apply Arabic font when needed
    if (lang === "ar") {
      document.documentElement.style.fontFamily = "'Cairo', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "";
    }

    localStorage.setItem("streak_lang", lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] ?? translations.en?.[key] ?? key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
