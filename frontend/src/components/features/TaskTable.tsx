import React from "react";
import styles from "./TaskTable.module.css";
import Badge from "../ui/Badge";

interface TaskTableProps {
  tasks: any[];
  selectedIds?: number[];
  onToggleRow?: (id: number) => void;
  onToggleAll?: (checked: boolean) => void;
  onRowClick?: (task: any) => void;
}

export default function TaskTable({ 
  tasks, 
  selectedIds = [], 
  onToggleRow, 
  onToggleAll, 
  onRowClick 
}: TaskTableProps) {
  if (tasks.length === 0) return <p className={styles.empty}>Aucune donnée disponible.</p>;

  const dynamicColumns = tasks[0].dynamicData ? Object.keys(tasks[0].dynamicData) : [];
  const allSelected = tasks.length > 0 && selectedIds.length === tasks.length;
  const hasSelectionFeature = onToggleRow && onToggleAll;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {hasSelectionFeature && (
              <th style={{width: "40px"}}>
                <input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={(e) => onToggleAll(e.target.checked)}
                    style={{cursor: "pointer", transform: "scale(1.2)"}}
                />
              </th>
            )}
            <th style={{ width: "150px" }}>Référence EPS</th>
            <th style={{ width: "120px" }}>Assigné à</th>
            <th style={{ width: "100px" }}>Statut</th>
            {dynamicColumns.map((col) => (
              <th key={col} style={{ textTransform: "capitalize" }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
             const isSelected = selectedIds.includes(task.id);
             return (
                <tr 
                  key={task.id} 
                  style={{ background: isSelected ? "#e6f7ff" : "white" }}
                >
                  {hasSelectionFeature && (
                    <td style={{textAlign: "center"}}>
                        <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => onToggleRow(task.id)}
                            style={{cursor: "pointer", transform: "scale(1.2)"}}
                        />
                    </td>
                  )}

                  <td className={styles.eps} onClick={() => onRowClick && onRowClick(task)} style={{cursor: "pointer"}}>
                      {task.epsReference}
                  </td>

                  <td>
                      {task.assignee ? (
                          <span style={{fontSize:"0.8rem", fontWeight:"bold", color: "#555", background:"#eee", padding:"2px 6px", borderRadius:"4px"}}>
                            👤 {task.assignee.username}
                          </span>
                      ) : (
                          <span style={{color: "#ccc", fontSize:"0.8rem"}}>--</span>
                      )}
                  </td>

                  <td>
                    <Badge variant={task.status === "A_FAIRE" ? "warning" : task.status === "VALIDE" ? "success" : task.status === "DONE" ? "success" : "danger"}>
                      {task.status}
                    </Badge>
                  </td>
                  
                  {dynamicColumns.map((col) => (
                    <td key={col} className={styles.dynamicCell}>
                      {task.dynamicData && task.dynamicData[col] ? String(task.dynamicData[col]) : "-"}
                    </td>
                  ))}
                </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
}