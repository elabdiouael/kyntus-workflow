"use client";

import React, { useState } from "react";
import styles from "./KanbanBoard.module.css";

// Config des colonnes avec couleurs Neon
const COLUMNS = [
  { id: "A_FAIRE", label: "⏳ Pending", color: "#f5a623" }, // Orange/Yellow
  { id: "EN_COURS", label: "⚡ Active", color: "#00f2ea" },  // Cyan
  { id: "DONE", label: "✅ Secured", color: "#39ff14" },     // Green
];

interface KanbanProps {
  tasks: any[];
  onStatusChange: (taskId: number, newStatus: string) => void;
}

export default function KanbanBoard({ tasks, onStatusChange }: KanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    // Petit hack pour ghost image propre (optionnel)
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
            {/* Header Tech */}
            <div className={styles.header} style={{color: col.color, textShadow: `0 0 10px ${col.color}`}}>
              {col.label}
              <span className={styles.count} style={{borderColor: col.color, color: "white"}}>
                {colTasks.length.toString().padStart(2, '0')} {/* 01, 02... */}
              </span>
            </div>

            {/* Zone Drop */}
            <div className={`${styles.droppableArea} ${dragOverCol === col.id ? styles.dragOver : ''}`}>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className={styles.card}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  style={{ "--border-color": col.color } as React.CSSProperties} // Variable CSS dynamique
                >
                  <div className={styles.cardHeader}>
                    <span>ID: {task.id}</span>
                    <span>∷∷</span>
                  </div>
                  
                  <div className={styles.eps}>{task.epsReference}</div>
                  
                  <div className={styles.cardBody}>
                      {task.dynamicData && Object.keys(task.dynamicData).slice(0, 3).map(key => (
                          <div key={key} className={styles.miniInfo}>
                             <span className={styles.label}>{key}</span>
                             <span className={styles.value}>{task.dynamicData[key]}</span>
                          </div>
                      ))}
                  </div>
                </div>
              ))}
              
              {colTasks.length === 0 && (
                  <div style={{
                      textAlign: "center", color: "rgba(255,255,255,0.1)", 
                      marginTop: 40, fontFamily: "monospace", fontSize: "0.8rem"
                  }}>
                      [ NO DATA SIGNAL ]
                  </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}