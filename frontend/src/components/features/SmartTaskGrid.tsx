"use client";

import React, { useState, useRef } from "react";
import { Copy, Check, Hash, Play, Clock, AlertTriangle } from "lucide-react";
import styles from "./SmartTaskGrid.module.css";
import LiveTimer from "../ui/LiveTimer";

interface SmartGridProps {
  tasks: any[];
  onUpdateData: (taskId: number, key: string, value: any) => void;
  onToggleStatus?: (taskId: number, currentStatus: string) => void;
}

export default function SmartTaskGrid({ tasks, onUpdateData, onToggleStatus }: SmartGridProps) {
  const dynamicCols = tasks.length > 0 && tasks[0].dynamicData ? Object.keys(tasks[0].dynamicData) : [];
  
  const [editing, setEditing] = useState<{id: number, col: string} | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    type: 'START' | 'STOP';
    taskId: number;
    currentStatus: string;
    targetCol?: string;
  } | null>(null);

  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  const handleCopyEPS = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const calculateScore = (seconds: number) => {
    if (seconds === undefined || seconds === null) return 100; // Par défaut
    const minutes = seconds / 60;
    const score = 100 - (minutes * 0.5);
    return Math.floor(Math.max(10, score));
  };

  const handleInputFocus = (task: any, col: string) => {
    if (task.status === "DONE") return;
    if (task.status !== "EN_COURS") {
      if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
      setConfirmModal({ type: 'START', taskId: task.id, currentStatus: task.status, targetCol: col });
      return;
    }
    setEditing({ id: task.id, col });
    setTempValue(task.dynamicData[col] || "");
  };

  const handleActionClick = (task: any) => {
    if (!onToggleStatus || task.status === "DONE") return;
    if (task.status === "EN_COURS") {
      setConfirmModal({ type: 'STOP', taskId: task.id, currentStatus: task.status });
    } else {
      setConfirmModal({ type: 'START', taskId: task.id, currentStatus: task.status });
    }
  };

  const confirmAction = () => {
    if (!confirmModal || !onToggleStatus) return;
    onToggleStatus(confirmModal.taskId, confirmModal.currentStatus);
    if (confirmModal.type === 'START' && confirmModal.targetCol) {
      setTimeout(() => {
        const key = `${confirmModal.taskId}-${confirmModal.targetCol}`;
        inputRefs.current[key]?.focus();
      }, 100);
    }
    setConfirmModal(null);
  };

  const handleBlur = () => {
    if (editing) {
      onUpdateData(editing.id, editing.col, tempValue);
      setEditing(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  if (tasks.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {onToggleStatus && <th className={styles.stickyHeader} style={{width:"80px"}}>STATUS</th>}
              <th className={styles.stickyHeader} style={{width:"100px"}}><Clock size={14} style={{display:"inline", marginRight:5}}/> TIME</th>
              <th className={styles.stickyHeader} style={{width: "180px"}}><Hash size={14} style={{display:"inline", marginRight:5}}/> REF EPS</th>
              {dynamicCols.map(col => <th key={col} className={styles.stickyHeader} style={{minWidth: "200px"}}>{col.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const isActive = task.status === "EN_COURS";
              const isDone = task.status === "DONE";
              // On s'assure que le temps est bien un nombre, sinon 0
              const safeTime = task.cumulativeTimeSeconds || 0; 
              const score = calculateScore(safeTime);
              
              return (
                <tr key={task.id} className={`${styles.row} ${isActive ? styles.rowActive : ''} ${isDone ? styles.rowDone : ''}`}>
                  
                  <td className={styles.actionCell}>
                      {isDone ? (
                          <div className={styles.scoreBadge} title={`Score Final: ${score} pts`}>
                              <span className={styles.scoreVal}>{score}</span>
                              <span className={styles.scoreLabel}>PTS</span>
                          </div>
                      ) : (
                          onToggleStatus && (
                            <button 
                                className={`${styles.actionBtn} ${isActive ? styles.btnActive : styles.btnIdle}`}
                                onClick={() => handleActionClick(task)}
                                title={isActive ? "Terminer" : "Commencer"}
                            >
                                {isActive ? <Check size={18} strokeWidth={4} /> : <Play size={14} style={{marginLeft:2}}/>}
                            </button>
                          )
                      )}
                  </td>

                  {/* 🔥 FIX TIMER AFFICHAGE 🔥 */}
                  <td className={styles.timerCell}>
                      {isActive ? (
                        <LiveTimer startTime={task.lastStartedAt} cumulativeSeconds={safeTime} />
                      ) : (
                        <span className={styles.staticTime}>
                            {/* On affiche le temps même si c'est 00:00 si c'est fini */}
                            {formatStaticTime(safeTime, isDone)}
                        </span>
                      )}
                  </td>

                  <td className={styles.epsCell}>
                      <div className={styles.epsWrapper} onClick={() => handleCopyEPS(task.id, task.epsReference)}>
                          <span className={styles.epsText}>{task.epsReference}</span>
                          <div className={`${styles.copyFeedback} ${copiedId === task.id ? styles.copied : ''}`}>
                             {copiedId === task.id ? <Check size={14} color="#39ff14"/> : <Copy size={14} className={styles.copyIcon}/>}
                          </div>
                      </div>
                  </td>

                  {dynamicCols.map(col => (
                    <td key={col} className={styles.dataCell}>
                        <input 
                          ref={el => inputRefs.current[`${task.id}-${col}`] = el}
                          type="text"
                          className={styles.inputCell}
                          value={editing?.id === task.id && editing?.col === col ? tempValue : (task.dynamicData[col] || "")}
                          onChange={(e) => setTempValue(e.target.value)}
                          onFocus={() => handleInputFocus(task, col)}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          placeholder="-"
                          autoComplete="off"
                          disabled={isDone}
                        />
                        {!isDone && <div className={`${styles.focusLine} ${isActive ? styles.lineGreen : ''}`}></div>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} color={confirmModal.type === 'START' ? "#00f2ea" : "#ff0055"} />
              <h3>{confirmModal.type === 'START' ? 'LANCEMENT MISSION' : 'FIN DE MISSION'}</h3>
            </div>
            <p className={styles.modalText}>
              {confirmModal.type === 'START' 
                ? "Démarrer le chronomètre pour cette tâche ?" 
                : "Arrêter le chronomètre et valider la tâche ?"
              }
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmModal(null)}>ANNULER</button>
              <button className={`${styles.btnConfirm} ${confirmModal.type === 'START' ? styles.btnConfirmStart : styles.btnConfirmStop}`} onClick={confirmAction}>
                {confirmModal.type === 'START' ? 'ENGAGER 🚀' : 'VALIDER ✅'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔥 Helper amélioré pour gérer le 0 et le Done
function formatStaticTime(sec: number, isDone: boolean = false) {
    if (sec === 0 && isDone) return "00:00"; // Si fini et 0 => 00:00 (pas --:--)
    if (!sec) return "--:--";
    
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}