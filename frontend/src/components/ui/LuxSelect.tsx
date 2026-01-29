"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import styles from "./LuxSelect.module.css";

interface Option {
  value: string;
  label: string;
}

interface LuxSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function LuxSelect({ label, options, value, onChange, disabled, placeholder }: LuxSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`} ref={ref}>
      <span className={styles.label}>{label}</span>
      
      <div 
        className={`${styles.trigger} ${isOpen ? styles.active : ''}`} 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? styles.textVal : styles.placeholder}>
          {selectedLabel || placeholder || "Sélectionner..."}
        </span>
        <ChevronDown size={16} className={`${styles.arrow} ${isOpen ? styles.rotated : ''}`} />
        
        {/* Glow Line en bas */}
        <div className={styles.glowLine}></div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.length > 0 ? (
            options.map((opt) => (
              <div 
                key={opt.value} 
                className={`${styles.option} ${opt.value === value ? styles.selected : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
                {opt.value === value && <Check size={14} className={styles.check} />}
              </div>
            ))
          ) : (
            <div className={styles.empty}>Aucune donnée</div>
          )}
        </div>
      )}
    </div>
  );
}