"use client";

import React, { useState } from "react";
import styles from "./PilotKanbanBoard.module.css"; // ✅ Import Style Pilot

// Les 3 Blocs (Mêmes colonnes, mais look différent)
const COLUMNS = [
  { id: "A_FAIRE", label: "⏳ PENDING" },
  { id: "EN_COURS", label: "⚡ ACTIVE" },
  { id: "DONE", label: "✅ SECURED" },
];

interface KanbanProps {
  tasks: any[];
  onStatusChange: (taskId: number, newStatus: string) => void;
}

export default function PilotKanbanBoard({ tasks, onStatusChange }: KanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    // Petit hack pour cacher l'image fantôme par défaut si tu veux (optionnel)
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedTaskId) {
      onStatusChange(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className={styles.board}>
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div 
            key={col.id} 
            className={`${styles.column} ${styles['col_' + col.id]}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Header 2080 */}
            <div className={styles.header}>
              {col.label}
              <span className={styles.count}>{colTasks.length}</span>
            </div>

            {/* Zone Drop */}
            <div className={`${styles.droppableArea} ${dragOverCol === col.id ? styles.dragOver : ''}`}>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.card}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <div className={styles.cardHeader}>
                    <span>ID: {task.id}</span>
                    <span style={{opacity:0.5}}>:::</span>
                  </div>
                  
                  <div className={styles.eps}>{task.epsReference}</div>
                  
                  <div className={styles.cardBody}>
                      {/* Affiche max 2 infos dynamiques */}
                      {task.dynamicData && Object.keys(task.dynamicData).slice(0, 2).map(key => (
                          <div key={key} className={styles.miniInfo}>
                             <span className={styles.label}>{key.toUpperCase()}</span>
                             <span className={styles.val}>{task.dynamicData[key]}</span>
                          </div>
                      ))}
                  </div>
                </div>
              ))}
              
              {colTasks.length === 0 && (
                  <div style={{textAlign: "center", color: "#444", fontStyle: "italic", marginTop: 20, fontSize:"0.8rem"}}>
                      [ EMPTY SLOT ]
                  </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}