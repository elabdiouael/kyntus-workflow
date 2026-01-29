"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, CheckCircle, XCircle, LayoutGrid, Zap, 
  Archive, ArrowRight, ArrowLeft, RotateCcw
} from "lucide-react";
import styles from "./AdminKanban.module.css";
import LuxSelect from "@/components/ui/LuxSelect";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import { toast } from "@/components/ui/Toaster";

export default function AdminKanban() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [pilots, setPilots] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Filtres
  const [selectedPilot, setSelectedPilot] = useState<string>("ALL");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ALL");

  // Initialisation Sécurisée (Anti-Crash)
  useEffect(() => {
    const initData = async () => {
        try {
            // 1. Pilotes
            const resPilots = await fetch("http://localhost:8080/api/users");
            if(resPilots.ok) {
                const data = await resPilots.json();
                if(Array.isArray(data)) setPilots(data.filter((u:any) => u.role !== 'ADMIN'));
            }

            // 2. Templates
            const resTempl = await fetch("http://localhost:8080/api/templates");
            if(resTempl.ok) {
                const data = await resTempl.json();
                if(Array.isArray(data)) setTemplates(data);
            }

            // 3. Tâches
            fetchTasks();

        } catch (error) {
            console.warn("Backend non disponible ou erreur réseau", error);
            // Pas de toast ici pour ne pas spammer au chargement, 
            // mais l'app ne crashera pas (écran rouge).
        }
    };

    initData();
  }, []);

  const fetchTasks = async () => {
    try {
        const res = await fetch("http://localhost:8080/api/tasks");
        if(res.ok) {
            const data = await res.json();
            if(Array.isArray(data)) setTasks(data);
        }
    } catch (e) {
        console.error("Erreur chargement tâches:", e);
    }
  };

  // --- ACTIONS ---

  // 1. Mise à jour individuelle
  const updateTaskStatus = async (task: any, newStatus: string) => {
    // Optimistic Update (Mise à jour visuelle immédiate)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    try {
      await fetch(`http://localhost:8080/api/tasks/${task.id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      toast({message: `STATUT MIS À JOUR: ${newStatus}`, type: "info"});
    } catch (e) {
      toast({message: "ERREUR SYNCHRONISATION", type: "error"});
      fetchTasks(); // Annuler en rechargeant
    }
  };

  // 2. BULK ACTION (Validation Massive)
  const handleBulkAction = async (action: "VALIDE" | "REJETE") => {
    const targets = filteredTasks.filter(t => t.status === "DONE");
    
    if (targets.length === 0) return;
    if (!confirm(`CONFIRMER L'ACTION MASSIVE : ${action} SUR ${targets.length} TÂCHES ?`)) return;

    // Optimistic Update
    setTasks(prev => prev.map(t => targets.find(target => target.id === t.id) ? { ...t, status: action } : t));

    // Exécution en boucle (Sécurisée)
    let successCount = 0;
    for (const task of targets) {
      try {
        await fetch(`http://localhost:8080/api/tasks/${task.id}/status`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: action })
        });
        successCount++;
      } catch (e) { console.error(e); }
    }
    
    toast({message: `OPÉRATION TERMINÉE: ${successCount} ${action}`, type: "success"});
  };

  // --- FILTRAGE ---
  const filteredTasks = tasks.filter(t => {
    const matchPilot = selectedPilot === "ALL" || (t.assignee?.id && t.assignee.id.toString() === selectedPilot);
    const matchTemplate = selectedTemplate === "ALL" || (t.template?.id && t.template.id.toString() === selectedTemplate);
    return matchPilot && matchTemplate;
  });

  const pending = filteredTasks.filter(t => t.status === "A_FAIRE");
  const active = filteredTasks.filter(t => t.status === "EN_COURS");
  const validation = filteredTasks.filter(t => t.status === "DONE"); 
  const history = filteredTasks.filter(t => ["VALIDE", "REJETE"].includes(t.status));

  const pilotOpts = [{value: "ALL", label: "TOUS LES PILOTES"}, ...pilots.map(p => ({value: p.id.toString(), label: p.username.toUpperCase()}))];
  const tmplOpts = [{value: "ALL", label: "TOUTES MISSIONS"}, ...templates.map(t => ({value: t.id.toString(), label: t.name.toUpperCase()}))];

  return (
    <div className={styles.container}>
      
      {/* Fond Interactif */}
      <InteractiveBackground />

      {/* HEADER COMMAND */}
      <div className={styles.headerControl}>
        <div className={styles.titleBlock}>
          <h1>OVERWATCH COMMAND</h1>
          <p>// GESTION GLOBALE & VALIDATION QC</p>
        </div>
        <div className={styles.filters}>
          <div style={{width: 200}}>
             <LuxSelect label="" options={pilotOpts} value={selectedPilot} onChange={setSelectedPilot} />
          </div>
          <div style={{width: 220}}>
             <LuxSelect label="" options={tmplOpts} value={selectedTemplate} onChange={setSelectedTemplate} />
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className={styles.kanbanGrid}>
        
        {/* COL 1: PENDING */}
        <div className={`${styles.column} ${styles.colPending}`}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}><LayoutGrid size={14}/> FILE D'ATTENTE</div>
            <span className={styles.countBadge}>{pending.length}</span>
          </div>
          <div className={styles.cardList}>
            {pending.map(t => <AdminCard key={t.id} task={t} onUpdate={updateTaskStatus} type="PENDING"/>)}
          </div>
        </div>

        {/* COL 2: ACTIVE */}
        <div className={`${styles.column} ${styles.colActive}`}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}><Zap size={14} color="#00f2ea"/> EN COURS</div>
            <span className={styles.countBadge}>{active.length}</span>
          </div>
          <div className={styles.cardList}>
            {active.map(t => <AdminCard key={t.id} task={t} onUpdate={updateTaskStatus} type="ACTIVE"/>)}
          </div>
        </div>

        {/* COL 3: VALIDATION (GOLD) */}
        <div className={`${styles.column} ${styles.colValidation}`}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}><ShieldAlert size={14} color="#ffd700"/> À VALIDER</div>
            <span className={styles.countBadge}>{validation.length}</span>
          </div>
          
          {validation.length > 0 && (
              <div className={styles.bulkActions}>
                  <button className={`${styles.bulkBtn} ${styles.bulkValide}`} onClick={() => handleBulkAction("VALIDE")}>
                      <CheckCircle size={14}/> TOUT OK
                  </button>
                  <button className={`${styles.bulkBtn} ${styles.bulkRefuse}`} onClick={() => handleBulkAction("REJETE")}>
                      <XCircle size={14}/> REFUS
                  </button>
              </div>
          )}

          <div className={styles.cardList}>
            {validation.map(t => <AdminCard key={t.id} task={t} onUpdate={updateTaskStatus} type="VALIDATION"/>)}
          </div>
        </div>

        {/* COL 4: HISTORIQUE */}
        <div className={`${styles.column} ${styles.colHistory}`}>
          <div className={styles.colHeader}>
            <div className={styles.colTitle}><Archive size={14}/> ARCHIVES</div>
            <span className={styles.countBadge}>{history.length}</span>
          </div>
          <div className={styles.cardList}>
            {history.slice(0, 20).map(t => <AdminCard key={t.id} task={t} onUpdate={updateTaskStatus} type="HISTORY"/>)}
          </div>
        </div>

      </div>
    </div>
  );
}

// COMPOSANT CARTE INTERNE
function AdminCard({ task, onUpdate, type }: { task: any, onUpdate: Function, type: string }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardRef}>{task.epsReference}</span>
                <div className={styles.pilotBadge}>
                    <div className={styles.pAvatar}>{task.assignee?.username?.substring(0,1).toUpperCase() || "?"}</div>
                    <span className={styles.pName}>{task.assignee?.username || "N/A"}</span>
                </div>
            </div>

            <div style={{fontSize:"0.6rem", color:"#666", marginBottom:8}}>{task.template?.name}</div>

            <div className={styles.cardActions}>
                {type === "PENDING" && (
                    <div className={styles.adminControls} style={{width:'100%', justifyContent:'flex-end'}}>
                        <button className={styles.miniBtn} onClick={() => onUpdate(task, "EN_COURS")} title="Force Start">
                            <ArrowRight size={14}/>
                        </button>
                    </div>
                )}

                {type === "ACTIVE" && (
                     <div className={styles.adminControls} style={{width:"100%", justifyContent:"space-between"}}>
                         <span style={{color:"#00f2ea", fontSize:"0.65rem", fontWeight:'bold'}}>LIVE...</span>
                         <button className={styles.miniBtn} onClick={() => onUpdate(task, "A_FAIRE")} title="Pause / Reset">
                             <RotateCcw size={14}/>
                         </button>
                     </div>
                )}

                {type === "VALIDATION" && (
                    <div className={styles.valBtns}>
                        <button className={`${styles.btnV} ${styles.btnKo}`} onClick={() => onUpdate(task, "REJETE")} title="Refuser">
                            <XCircle size={16}/>
                        </button>
                        <button className={`${styles.btnV} ${styles.btnOk}`} onClick={() => onUpdate(task, "VALIDE")} title="Valider">
                            <CheckCircle size={16}/>
                        </button>
                    </div>
                )}

                {type === "HISTORY" && (
                    <div style={{display:'flex', width:'100%', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:"0.6rem", fontWeight:"bold", color: task.status==="VALIDE" ? "#39ff14":"#ff0055"}}>
                            {task.status}
                        </span>
                        <button className={styles.miniBtn} onClick={() => onUpdate(task, "DONE")} title="Annuler Décision">
                             <ArrowLeft size={14}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}