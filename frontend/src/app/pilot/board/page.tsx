"use client";

import { useEffect, useState } from "react";
import { Activity, Terminal, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import SmartTaskGrid from "@/components/features/SmartTaskGrid";
import SystemIdle from "@/components/ui/SystemIdle";
import LuxSelect from "@/components/ui/LuxSelect";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import styles from "./PilotBoard.module.css";
import { toast } from "@/components/ui/Toaster";

export default function PilotBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialisation User & Templates
  useEffect(() => {
    const stored = localStorage.getItem("kyntus_user");
    if (stored) setUser(JSON.parse(stored));

    fetch("http://localhost:8080/api/templates")
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setTemplates(data); })
        .catch(err => console.error(err));
  }, []);

  // Fetch Tasks (Refresh Logic)
  const refreshTasks = () => {
    if (!user || !selectedTemplate) return;
    setLoading(true);
    fetch(`http://localhost:8080/api/tasks?assigneeId=${user.id}&templateId=${selectedTemplate}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setTasks(data); else setTasks([]); })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
  };

  useEffect(() => { refreshTasks(); }, [user, selectedTemplate]);

  // Update Data (Dynamic Fields)
  const handleUpdateData = async (taskId: number, key: string, value: any) => {
    // Optimistic UI pour la fluidité de la saisie
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dynamicData: { ...t.dynamicData, [key]: value } } : t));
    try {
        await fetch(`http://localhost:8080/api/tasks/${taskId}/data`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value })
        });
    } catch (err) { console.error(err); }
  };

  // ⏱️ CHRONO LOGIC - UPDATED BY RYUZAKI ⏱️
  const handleStatusToggle = async (taskId: number, currentStatus: string) => {
      let newStatus = "";
      // Cycle: A_FAIRE -> EN_COURS -> DONE
      if (currentStatus === "A_FAIRE") newStatus = "EN_COURS";
      else if (currentStatus === "EN_COURS") newStatus = "DONE";
      else return; // Si déjà DONE ou VALIDE, on ne touche pas ici

      // 1. Optimistic Update (Juste pour le visuel immédiat du bouton)
      setTasks(prev => prev.map(t => {
          if (t.id === taskId) return { ...t, status: newStatus }; // On ne touche pas au temps ici, on attend le serveur
          return t;
      }));

      try {
          // 2. Appel au Backend (C'est lui qui calcule le temps)
          const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/status`, {
              method: "PATCH", 
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus })
          });

          if (res.ok) {
              // 3. CRITICAL: On récupère la tâche mise à jour par le serveur
              // Elle contient maintenant le `cumulativeTimeSeconds` exact calculé par le Backend
              const updatedTask = await res.json();

              // 4. On met à jour l'état local avec la vérité du serveur
              setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

              // Notifications Tactiques
              if(newStatus === "EN_COURS") {
                  toast({message: "CHRONO STARTED ⏱️", type: "info"});
              }
              if(newStatus === "DONE") {
                  // Petit calcul pour montrer au pilote combien de temps il a mis (optionnel mais cool)
                  const timeSpent = Math.round((updatedTask.cumulativeTimeSeconds || 0) / 60);
                  toast({message: `MISSION COMPLETE (${timeSpent} min) ✅`, type: "success"});
              }
          } else {
              throw new Error("Server Response Not OK");
          }

      } catch(e) {
          console.error("Sync Error:", e);
          toast({message: "ERREUR SYNCHRO - REVERTING", type: "error"});
          refreshTasks(); // En cas d'erreur, on recharge tout pour être sûr
      }
  };

  const activeTasks = tasks.filter(t => t.status !== "VALIDE" && t.status !== "REJETE" && t.status !== "DONE");
  
  // 🔥 AUTO-EJECT LOGIC (Mission Cleared) 🔥
  useEffect(() => {
      if (selectedTemplate && tasks.length > 0 && activeTasks.length === 0) {
          const timer = setTimeout(() => {
              toast({message: "SECTEUR SÉCURISÉ - ARCHIVAGE... 📁", type: "success"});
              setTemplates(prev => prev.filter(t => t.id.toString() !== selectedTemplate));
              setSelectedTemplate("");
              setTasks([]); 
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [activeTasks.length, selectedTemplate, tasks.length]);

  const missionOptions = templates.map(t => ({ value: t.id.toString(), label: `MISSION: ${t.name.toUpperCase()}` }));

  return (
    <div className={styles.container}>
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:-1, pointerEvents:'none', opacity: 0.6}}>
            <InteractiveBackground />
        </div>

        <header className={styles.headerHud}>
            <div className={styles.pilotInfo}>
                <div className={styles.pilotName}><div className={styles.statusDot}></div>UNIT: {user?.username}</div>
                <span className={styles.roleBadge}>// AUTHORIZED_ACCESS_LEVEL_3</span>
            </div>
            <div className={styles.selectorZone}>
                <ArrowRight size={16} className={styles.arrowIcon} />
                <div style={{width: 300}}>
                    <LuxSelect 
                        label="" 
                        options={missionOptions} 
                        value={selectedTemplate} 
                        onChange={setSelectedTemplate} 
                        placeholder="[ LOAD CARTRIDGE ]" 
                    />
                </div>
            </div>
        </header>

        {!selectedTemplate ? (
            <div className={styles.emptyStateWrapper}><SystemIdle /></div>
        ) : loading ? (
            <div className={styles.emptyStateWrapper}>
                <div style={{textAlign:"center", color:"#00f2ea", fontFamily:"monospace"}}>
                    <Activity className="spin" size={40} style={{marginBottom:20}}/>
                    <div style={{letterSpacing:3}}>INITIALIZING PROTOCOLS...</div>
                </div>
            </div>
        ) : (
            <div style={{flex: 1, display:"flex", flexDirection:"column", animation:"fadeIn 0.5s"}}>
                <div className={styles.dataHeader}>
                    <div className={styles.matrixTitle}><Terminal size={20} color="#00f2ea"/> MATRIX VIEW</div>
                    <div className={styles.countBadge}>{tasks.length} ENTRIES</div>
                </div>
                <SmartTaskGrid 
                    tasks={tasks} 
                    onUpdateData={handleUpdateData} 
                    onToggleStatus={handleStatusToggle} 
                />
            </div>
        )}
    </div>
  );
}