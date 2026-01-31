"use client";

import { useState, useEffect } from "react";
import styles from "@/components/features/TemplatesPage.module.css";
import { useRouter } from "next/navigation";
import { Plus, Save, Layers, Cpu, Database, Trash2 } from "lucide-react";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import { toast } from "@/components/ui/Toaster";

export default function TemplatesPage() {
  const router = useRouter();
  
  // State Formulaire
  const [name, setName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [currentCol, setCurrentCol] = useState("");
  
  // State Liste
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = () => {
    fetch("http://localhost:8080/api/templates")
      .then(res => res.json())
      .then(data => setTemplates(data || []))
      .catch(err => console.error("Erreur templates:", err));
  };

  // 2. Gestion des Colonnes
  const addColumn = () => {
    if (!currentCol.trim()) return;
    setColumns([...columns, currentCol.toUpperCase()]); // On force MAJ pour le style
    setCurrentCol("");
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColumn();
    }
  };

  // 3. Sauvegarde
  const handleSave = async () => {
    if (!name.trim()) {
      toast({message: "LE NOM DU PROTOCOLE EST REQUIS", type: "error"});
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, columns }), 
      });

      if (res.ok) {
        fetchTemplates();
        setName("");
        setColumns([]);
        toast({message: "PROTOCOLE INITIALISÉ AVEC SUCCÈS", type: "success"});
      } else {
        throw new Error("Erreur serveur");
      }
    } catch (e) {
      toast({message: "ERREUR DE CRÉATION", type: "error"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      <InteractiveBackground />
      
      {/* --- PANNEAU GAUCHE : CRÉATION --- */ }
      <div className={styles.builderPanel}>
        <div className={styles.contentRelatif}>
            <div className={styles.builderHeader}>
              <h1 className={styles.title}>ARCHITECTE SYSTÈME</h1>
              <span className={styles.subtitle}>// DÉFINITION DES PROTOCOLES DE FLUX</span>
            </div>

            {/* Nom du Template */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>1. NOM DU PROTOCOLE (PROJET)</label>
              <input 
                type="text" 
                className={styles.neonInput} 
                placeholder="Ex: FIBRE_OUJDA_PHASE_1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Structure de Données */}
            <div className={styles.inputGroup}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                <label className={styles.label}>2. STRUCTURE DE DONNÉES (CHAMPS DYNAMIQUES)</label>
              </div>
              
              <p style={{fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "15px", fontStyle: "italic", display:'flex', gap:6, alignItems:'center'}}>
                <Database size={12} />
                Laisser vide pour une auto-génération lors de l'import Excel.
              </p>
              
              {/* Zone des Chips */}
              {columns.length > 0 && (
                  <div className={styles.fieldsContainer}>
                    {columns.map((col, idx) => (
                      <div key={idx} className={styles.fieldModule}>
                        <span className={styles.fieldText}>{col}</span>
                        <button onClick={() => removeColumn(idx)} className={styles.removeBtn}><Trash2 size={12}/></button>
                      </div>
                    ))}
                  </div>
              )}

              {/* Input Ajout */}
              <div className={styles.addZone}>
                  <input 
                    type="text" 
                    className={styles.neonInput} 
                    placeholder="Nom du champ (ex: PBO, ADRESSE)..."
                    value={currentCol}
                    onChange={(e) => setCurrentCol(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button onClick={addColumn} className={styles.addBtn}>
                      <Plus size={24} strokeWidth={4} />
                  </button>
              </div>
            </div>

            {/* Bouton Action */}
            <button 
                className={styles.saveBtn} 
                onClick={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <span className="spin">INITIALISATION...</span>
                ) : (
                    <span style={{display:"flex", alignItems:"center", justifyContent:"center", gap:10}}>
                        <Cpu size={20} /> INITIALISER LE PROTOCOLE
                    </span>
                )}
            </button>
        </div>
      </div>


      {/* --- PANNEAU DROITE : LISTE (RACK) --- */}
      <div className={styles.rackPanel}>
         <div className={styles.rackHeader}>
             PROTOCOLES ACTIFS : {templates.length}
         </div>

         {templates.map((t) => (
             <div key={t.id} className={styles.cartridge}>
                 <div className={styles.led}></div>
                 
                 <div className={styles.cartridgeInfo}>
                     <div>
                         <div className={styles.idRef}>REF_ID: {t.id.toString().padStart(4, '0')}</div>
                         <div className={styles.cName}>{t.name}</div>
                         <div className={styles.cMeta}>
                            <Layers size={12} /> 
                            {t.fields?.length || t.columns?.length || 0} MODULES CHARGÉS
                         </div>
                     </div>
                 </div>
                 
                 <Save size={20} className={styles.iconSave} />
             </div>
         ))}

         {templates.length === 0 && (
             <div style={{textAlign: "center", color: "#444", marginTop: 40, fontFamily:"monospace"}}>
                 [ RACK VIDE - AUCUN PROTOCOLE ]
             </div>
         )}
      </div>

    </div>
  );
}