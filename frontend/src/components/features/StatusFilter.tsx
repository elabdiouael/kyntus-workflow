import React from "react";
import styles from "./StatusFilter.module.css";

interface StatusFilterProps {
  currentFilter: string;
  onChange: (status: string) => void;
  counts: { all: number; todo: number; waiting: number; validated: number; rejected: number };
}

export default function StatusFilter({ currentFilter, onChange, counts }: StatusFilterProps) {
  const filters = [
    { key: "ALL", label: "Tous", count: counts.all, color: "gray" },
    { key: "A_FAIRE", label: "À Faire", count: counts.todo, color: "#ffc107" },
    
    // --- HADA HOWA L'BOUTON JDIID ---
    { key: "DONE", label: "⏳ À Valider", count: counts.waiting, color: "#0070f3" }, // Bleu = Action requise
    
    { key: "VALIDE", label: "✅ Validés", count: counts.validated, color: "#28a745" },
    { key: "REJETE", label: "❌ Rejetés", count: counts.rejected, color: "#dc3545" },
  ];

  return (
    <div className={styles.wrapper}>
      {filters.map((f) => (
        <button
          key={f.key}
          className={`${styles.filterBtn} ${currentFilter === f.key ? styles.active : ""}`}
          onClick={() => onChange(f.key)}
          style={{ 
              borderBottom: currentFilter === f.key ? `2px solid ${f.color}` : "2px solid transparent",
              color: currentFilter === f.key ? f.color : "#666"
          }}
        >
          {f.label}
          <span className={styles.badge} style={{background: currentFilter === f.key ? f.color : "#eee", color: currentFilter === f.key ? "white" : "#666"}}>
            {f.count}
          </span>
        </button>
      ))}
    </div>
  );
}