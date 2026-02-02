"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: TranslationKey, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr"); // Défaut FR

  // Charger la préférence au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("kyntus_lang") as Language;
    if (saved) setLanguage(saved);
  }, []);

  // Sauvegarder quand ça change
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("kyntus_lang", lang);
  };

  // La fonction magique "t" pour traduire
  const t = (section: TranslationKey, key: string) => {
    // @ts-ignore
    return translations[language][section]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé pour l'utiliser partout
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};