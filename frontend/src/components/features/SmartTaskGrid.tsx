"use client";

import React, { useState, useRef } from "react";
import { Copy, Check, Hash, Play, Clock, AlertTriangle, AlertOctagon } from "lucide-react";
import styles from "./SmartTaskGrid.module.css";
import LiveTimer from "../ui/LiveTimer";

interface SmartGridProps {
  tasks: any[];
  onUpdateData: (taskId: number, key: string, value: any) => void;
  onToggleStatus?: (taskId: number, currentStatus: string) => void;
}

export default function SmartTaskGrid({ tasks, onUpdateData, onToggleStatus }: SmartGridProps) {
  // 🔥 1. Logic d'Isolation (On sépare l'Anomalie du reste)
  const allKeys = tasks.length > 0 && tasks[0].dynamicData ? Object.keys(tasks[0].dynamicData) : [];
  const anomalyKey = allKeys.find(k => k.toLowerCase().includes("anomalie")); // Trouve "Anomalie", "ANOMALIE", etc.
  const dynamicCols = allKeys.filter(k => k !== anomalyKey); // Les colonnes normales (PBO, Signal...)

  const [editing, setEditing] = useState<{id: number, col: string} | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [copiedId, setCopiedId] = useState<{id: number, type: 'EPS'|'ANOMALY'} | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    type: 'START' | 'STOP';
    taskId: number;
    currentStatus: string;
    targetCol?: string;
  } | null>(null);

  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  // --- ACTIONS ---
  const handleCopyEPS = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId({id, type: 'EPS'});
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAnomaly = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId({id, type: 'ANOMALY'});
    setTimeout(() => setCopiedId(null), 1500);
  };

  const calculateScore = (seconds: number) => {
    if (seconds === undefined || seconds === null) return 100;
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
              {onToggleStatus ? <th className={styles.stickyHeader} style={{width:"60px"}}></th> : null}
              <th className={styles.stickyHeader} style={{width:"90px"}}><Clock size={14} style={{display:"inline", marginRight:5}}/> TIME</th>
              <th className={styles.stickyHeader} style={{width: "160px"}}><Hash size={14} style={{display:"inline", marginRight:5}}/> REF EPS</th>
              {dynamicCols.map(col => <th key={col} className={styles.stickyHeader} style={{minWidth: "150px"}}>{col.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const isActive = task.status === "EN_COURS";
              const isDone = task.status === "DONE";
              const safeTime = task.cumulativeTimeSeconds || 0; 
              const score = calculateScore(safeTime);
              
              // Check Anomaly Value
              const anomalyVal = anomalyKey ? task.dynamicData[anomalyKey] : null;
              const hasAnomaly = !!anomalyVal;
              
              return (
                <React.Fragment key={task.id}>
                  {/* --- ROW PRINCIPAL (Les données normales) --- */}
                  <tr className={`${styles.row} ${isActive ? styles.rowActive : ''} ${isDone ? styles.rowDone : ''} ${hasAnomaly ? styles.rowWithAnomaly : ''}`}>
                    
                    <td className={styles.actionCell}>
                        {isDone ? (
                            <div className={styles.scoreBadge} title={`Score Final: ${score} pts`}>
                                <span className={styles.scoreVal}>{score}</span>
                            </div>
                        ) : (
                            onToggleStatus && (
                              <button 
                                  className={`${styles.actionBtn} ${isActive ? styles.btnActive : styles.btnIdle}`}
                                  onClick={() => handleActionClick(task)}
                                  title={isActive ? "Terminer" : "Commencer"}
                              >
                                  {isActive ? <Check size={16} strokeWidth={4} /> : <Play size={12} style={{marginLeft:2}}/>}
                              </button>
                            )
                        )}
                    </td>

                    <td className={styles.timerCell}>
                        {isActive ? (
                          <LiveTimer startTime={task.lastStartedAt} cumulativeSeconds={safeTime} />
                        ) : (
                          <span className={styles.staticTime}>
                              {formatStaticTime(safeTime, isDone)}
                          </span>
                        )}
                    </td>

                    <td className={styles.epsCell}>
                        <div className={styles.epsWrapper} onClick={() => handleCopyEPS(task.id, task.epsReference)}>
                            <span className={styles.epsText}>{task.epsReference}</span>
                            <div className={`${styles.copyFeedback} ${copiedId?.id === task.id && copiedId?.type === 'EPS' ? styles.copied : ''}`}>
                               {copiedId?.id === task.id && copiedId?.type === 'EPS' ? <Check size={12} color="#39ff14"/> : <Copy size={12} className={styles.copyIcon}/>}
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

                  {/* 🔥 --- ROW SECONDAIRE (L'ANOMALIE) --- 🔥 */}
                  {hasAnomaly && (
                    <tr className={styles.anomalyRow}>
                      <td colSpan={3 + dynamicCols.length}>
                        <div 
                          className={`${styles.anomalyBanner} ${copiedId?.id === task.id && copiedId?.type === 'ANOMALY' ? styles.anomalyCopied : ''}`}
                          onClick={() => handleCopyAnomaly(task.id, anomalyVal)}
                          title="Cliquer pour copier l'anomalie"
                        >
                            <div className={styles.anomalyIconBox}>
                                <AlertOctagon size={18} />
                            </div>
                            <div className={styles.anomalyContent}>
                                <span className={styles.anomalyLabel}>ANOMALIE CRITIQUE:</span>
                                <span className={styles.anomalyText}>{anomalyVal}</span>
                            </div>
                            <div className={styles.anomalyAction}>
                                {copiedId?.id === task.id && copiedId?.type === 'ANOMALY' ? 
                                    <span className={styles.copiedMsg}><Check size={14}/> COPIÉ</span> : 
                                    <Copy size={14} className={styles.copyHintIcon}/>
                                }
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

function formatStaticTime(sec: number, isDone: boolean = false) {
    if (sec === 0 && isDone) return "00:00";
    if (!sec) return "--:--";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}