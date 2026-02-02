"use client";

import React, { useState } from "react";
import styles from "./TaskDetailModal.module.css";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface TaskDetailModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (taskId: number, newStatus: string) => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdateStatus }: TaskDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !task) return null;

  const handleAction = async (status: string) => {
    setUpdating(true);
    await onUpdateStatus(task.id, status);
    setUpdating(false);
    onClose(); // On ferme la modal après l'action
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>Détail Tâche</h2>
            <span className={styles.ref}>{task.epsReference}</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>&times;</button>
        </div>

        {/* Content (JSON Data) */}
        <div className={styles.content}>
          <div className={styles.grid}>
            {Object.entries(task.dynamicData || {}).map(([key, value]) => (
              <div key={key} className={styles.field}>
                <label>{key}</label>
                <div className={styles.value}>{String(value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (Actions) */}
        <div className={styles.footer}>
          <div className={styles.currentStatus}>
            Actuel: <Badge variant={task.status === "A_FAIRE" ? "warning" : task.status === "VALIDE" ? "success" : "danger"}>{task.status}</Badge>
          </div>
          
          <div className={styles.actions}>
            <Button 
              variant="danger" 
              onClick={() => handleAction("REJETE")}
              disabled={updating}
            >
              🚨 Rejeter
            </Button>
            <Button 
              variant="primary" // Vert (Success) n'existe pas dans notre Button de base, on utilise primary ou on ajoute success
              style={{ backgroundColor: "var(--success)", borderColor: "var(--success)" }}
              onClick={() => handleAction("VALIDE")}
              disabled={updating}
            >
              ✅ Valider
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}