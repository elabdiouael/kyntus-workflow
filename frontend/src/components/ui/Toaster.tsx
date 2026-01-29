"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import styles from "./Toaster.module.css";

// Petit hack pour écouter les events globaux (comme un Bus)
// Tu peux trigger ça depuis n'importe où avec window.dispatchEvent
export const toast = (detail: { message: string, type: 'success'|'error'|'info' }) => {
  const event = new CustomEvent('kyntus-toast', { detail });
  window.dispatchEvent(event);
};

export default function Toaster() {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...e.detail, id }]);
      
      // Auto remove
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('kyntus-toast', handleToast);
    return () => window.removeEventListener('kyntus-toast', handleToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <div className={styles.borderBar}></div>
          <div className={styles.content}>
             <div className={styles.title}>
                {t.type === 'success' ? 'TRANSMISSION RECEIVED' : t.type === 'error' ? 'SYSTEM ALERT' : 'INFO'}
             </div>
             <div className={styles.message}>{t.message}</div>
          </div>
          <button onClick={() => removeToast(t.id)} className={styles.closeBtn}>
             <X size={16}/>
          </button>
        </div>
      ))}
    </div>
  );
}