"use client";

import { useEffect, useState } from "react";
import Container from "@/components/layout/Container";
import KanbanBoard from "@/components/features/KanbanBoard"; // On réutilise le composant qu'on a créé !
import Card from "@/components/layout/Card";
import Button from "@/components/ui/Button";

export default function AdminKanbanPage() {
  const [pilots, setPilots] = useState<any[]>([]);
  const [selectedPilot, setSelectedPilot] = useState<any>(null); // L'objet user complet
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Charger la liste des pilotes au démarrage
  useEffect(() => {
    fetch("http://localhost:8080/api/users/pilots")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPilots(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 2. Quand on clique sur un pilote, on charge ses tâches
  const handleSelectPilot = (pilot: any) => {
    setSelectedPilot(pilot);
    setLoading(true);
    
    // On ne récupère pas les VALIDÉES (elles sortent du board), juste l'actif
    fetch(`http://localhost:8080/api/tasks?assigneeId=${pilot.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
            // On filtre pour ne garder que le flux actif (A_FAIRE, EN_COURS, DONE)
            // On cache REJETE et VALIDE du board pour que ce soit propre
            const activeTasks = data.filter((t: any) => t.status !== "VALIDE" && t.status !== "REJETE");
            setTasks(activeTasks);
        } else {
            setTasks([]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // 3. Admin peut aussi bouger les cartes ! (Super-pouvoir)
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
        await fetch(`http://localhost:8080/api/tasks/${taskId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (e) {
        console.error(e);
    }
  };

  // --- VUE 1 : SÉLECTION DU PILOTE ---
  if (!selectedPilot) {
    return (
      <Container>
        <h1 style={{ marginBottom: "10px" }}>🏗️ Supervision Kanban</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>Sélectionnez un pilote pour voir son avancement en temps réel.</p>

        {loading ? <p>Chargement des pilotes...</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {pilots.map((pilot) => (
              <div 
                key={pilot.id}
                onClick={() => handleSelectPilot(pilot)}
                style={{
                    background: "white", 
                    padding: "25px", 
                    borderRadius: "12px", 
                    border: "1px solid #eee",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "15px"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Avatar */}
                <div style={{
                    width: "60px", height: "60px", 
                    background: "#e6f7ff", color: "#0070f3", 
                    borderRadius: "50%", 
                    display: "flex", justifyContent: "center", alignItems: "center",
                    fontSize: "1.5rem", fontWeight: "bold"
                }}>
                    {pilot.username.substring(0, 2).toUpperCase()}
                </div>
                
                {/* Info */}
                <div style={{textAlign: "center"}}>
                    <h3 style={{margin: 0, fontSize: "1.1rem"}}>{pilot.username}</h3>
                    <span style={{fontSize: "0.85rem", color: "#888"}}>Pilote</span>
                </div>

                <div style={{width: "100%", height: "1px", background: "#f0f0f0"}}></div>

                <span style={{color: "#0070f3", fontSize: "0.9rem", fontWeight: "500"}}>
                    Voir le Board →
                </span>
              </div>
            ))}
          </div>
        )}
      </Container>
    );
  }

  // --- VUE 2 : LE BOARD DU PILOTE ---
  return (
    <Container>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
        <Button variant="outline" onClick={() => setSelectedPilot(null)}>
            ← Retour
        </Button>
        <div>
            <h1 style={{ margin: 0 }}>Board de {selectedPilot.username}</h1>
            <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>Supervision en temps réel</p>
        </div>
      </div>

      {loading ? (
        <p>Chargement des tâches...</p>
      ) : (
        <KanbanBoard 
            tasks={tasks} 
            onStatusChange={handleStatusChange} 
        />
      )}
    </Container>
  );
}