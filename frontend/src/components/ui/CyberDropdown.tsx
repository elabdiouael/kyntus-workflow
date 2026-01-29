"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, FolderOpen, Check } from "lucide-react";
import styles from "./CyberDropdown.module.css";

interface Option {
  value: string;
  label: string;
}

interface CyberDropdownProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function CyberDropdown({ options, value, onChange, placeholder = "SELECT..." }: CyberDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.container} ${isOpen ? styles.open : ''}`} ref={dropdownRef}>
      
      {/* TRIGGER BUTTON */}
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <span style={{display:"flex", alignItems:"center", gap:10}}>
           {value ? <FolderOpen size={16} color="var(--neon-cyan)"/> : null} 
           {selectedLabel}
        </span>
        <ChevronDown size={18} className={styles.arrow} />
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.scrollable}>
            {options.map((opt) => (
              <div 
                key={opt.value} 
                className={`${styles.option} ${opt.value === value ? styles.selected : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.value === value && <Check size={14} />}
                {opt.label}
              </div>
            ))}
            {options.length === 0 && (
                <div className={styles.option} style={{fontStyle:"italic", opacity:0.5}}>
                    No missions available
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}