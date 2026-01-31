"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  return (
    <button 
      onClick={toggle}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: language === "fr" ? "#00f2ea" : "#39ff14", // Cyan pour FR, Vert pour EN
        padding: "8px 12px",
        borderRadius: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: "0.8rem",
        transition: "all 0.3s"
      }}
      title="Switch Language"
    >
      <Globe size={14} />
      {language.toUpperCase()}
    </button>
  );
}