"use client";

import React from "react";
import styles from "./AdminKanban.module.css";

const COLUMNS = [
  { id: "A_FAIRE", label: "PENDING", color: "#f5a623" }, // ORANGE
  { id: "EN_COURS", label: "ACTIVE", color: "#00f2ea" },  // CYAN
  { id: "DONE", label: "SECURED", color: "#39ff14" },     // GREEN
];

interface KanbanProps {
  tasks: any[];
}

export default function AdminKanbanBoard({ tasks }: KanbanProps) {
  return (
    <div className={styles.scene}>
      <div className={styles.board}>
        {COLUMNS.map((col) => {
          // Filtrer les tâches par colonne
          const colTasks = tasks.filter((t) => t.status === col.id || (col.id === "DONE" && t.status === "VALIDE"));

          return (
            <div 
              key={col.id} 
              className={styles.column}
              style={{ "--col-color": col.color } as React.CSSProperties}
            >
              {/* Header avec Glow */}
              <div className={styles.header}>
                {col.label}
                <span className={styles.countBadge}>
                  {colTasks.length.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Zone des Cartouches */}
              <div className={styles.droppableArea}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className={styles.card}
                  >
                    {/* Background Grid Décoratif */}
                    <div className={styles.cardBg}></div>

                    {/* Contenu qui flotte en 3D */}
                    <div className={styles.cardContent}>
                        
                        <div className={styles.topRow}>
                            <span className={styles.idPill}>ID_{task.id}</span>
                            <span className={styles.statusDot}></span>
                        </div>

                        <div className={styles.epsRef}>
                            {task.epsReference}
                        </div>

                        {/* Data Grid */}
                        <div className={styles.metaGrid}>
                            <div>
                                <div className={styles.metaLabel}>Assigné à</div>
                                <div className={styles.metaValue}>
                                    {task.assignee ? task.assignee.username.toUpperCase() : "SYSTEM"}
                                </div>
                            </div>
                            <div style={{textAlign: "right"}}>
                                <div className={styles.metaLabel}>Data</div>
                                <div className={styles.metaValue}>
                                    {task.dynamicData?.PBO || "N/A"}
                                </div>
                            </div>
                        </div>

                    </div>
                  </div>
                ))}
                
                {colTasks.length === 0 && (
                    <div style={{
                        textAlign: "center", 
                        color: "rgba(255,255,255,0.1)", 
                        marginTop: 60, 
                        fontFamily: "monospace", 
                        fontSize: "0.8rem",
                        letterSpacing: "2px"
                    }}>
                        [ NO SIGNAL ]
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}