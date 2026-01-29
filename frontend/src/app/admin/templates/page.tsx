"use client";

import { useState, useEffect } from "react";
import styles from "@/components/features/TemplatesPage.module.css";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const router = useRouter();
  
  // State pour le Formulaire
  const [name, setName] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [currentCol, setCurrentCol] = useState("");
  
  // State pour la Liste
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Charger les templates existants
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = () => {
    fetch("http://localhost:8080/api/templates")
      .then(res => res.json())
      .then(data => setTemplates(data || []));
  };

  // 2. Gestion des Colonnes (Modules)
  const addColumn = () => {
    if (!currentCol.trim()) return;
    setColumns([...columns, currentCol]);
    setCurrentCol(""); // Reset input
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

  // 3. Sauvegarder (Compiler)
  const handleSave = async () => {
    // MODIFICATION HNA: Heyydt l condition dyal columns.length === 0
    // Daba ghir l name li darori
    if (!name) {
      alert("ERREUR SYSTEME: Le nom du protocole est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      // Note: L'backend khasso ykoun 9abel 'columns' ola 'fields' vide
      const res = await fetch("http://localhost:8080/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Kansefto columns wakha tkoun khawya []
        body: JSON.stringify({ name, columns }), 
      });

      if (res.ok) {
        fetchTemplates(); // Refresh liste
        setName("");
        setColumns([]);
        alert("PROTOCOL COMPILED SUCCESSFULLY.");
      } else {
        alert("Erreur lors de la sauvegarde.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* --- LEFT PANEL: CONSTRUCTOR --- */}
      <div className={styles.builderPanel}>
        <div className={styles.builderHeader}>
          <h1 className={styles.title}>System Architect</h1>
          <p className={styles.subtitle}>// DEFINE NEW WORKFLOW PROTOCOLS</p>
        </div>

        {/* Name Input */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>1. PROTOCOL NAME (TEMPLATE)</label>
          <input 
            type="text" 
            className={styles.neonInput} 
            placeholder="Ex: FIBER_OPTIC_ROLLOUT_V2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Columns Builder */}
        <div className={styles.inputGroup}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
            <label className={styles.label}>2. DATA STRUCTURE (OPTIONAL)</label>
          </div>
          
          {/* Message d'aide zedto hna */}
          <p style={{fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "10px", fontStyle: "italic"}}>
            * Leave empty to auto-generate columns from Excel import.
          </p>
          
          {/* Liste des champs ajoutés */}
          <div className={styles.fieldsContainer}>
            {columns.map((col, idx) => (
              <div key={idx} className={styles.fieldModule}>
                <div style={{
                    flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", 
                    color: "white", fontFamily: "monospace", borderLeft: "2px solid #0070f3"
                }}>
                    {col}
                </div>
                <button onClick={() => removeColumn(idx)} className={styles.removeBtn}>✕</button>
              </div>
            ))}
          </div>

          {/* Input d'ajout */}
          <div style={{display: "flex", gap: "10px"}}>
              <input 
                type="text" 
                className={styles.neonInput} 
                placeholder="Type field name (e.g., PBO, Address)..."
                value={currentCol}
                onChange={(e) => setCurrentCol(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button 
                onClick={addColumn}
                style={{
                    background: "var(--neon-cyan)", border: "none", width: "60px", 
                    color: "black", fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer"
                }}
              >
                  +
              </button>
          </div>
        </div>

        {/* Save Action */}
        <button 
            className={styles.saveBtn} 
            onClick={handleSave}
            disabled={loading}
        >
            {loading ? "COMPILING..." : "⚡ COMPILE & SAVE PROTOCOL"}
        </button>

        {/* Decoration background grid */}
        <div style={{
            position: "absolute", top:0, left:0, width:"100%", height:"100%", 
            backgroundImage: "linear-gradient(rgba(0,242,234,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,234,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px", zIndex: -1, pointerEvents: "none"
        }}></div>
      </div>


      {/* --- RIGHT PANEL: SERVER RACK (LIST) --- */}
      <div className={styles.rackPanel}>
         <div className={styles.rackHeader}>
             Available Protocols: {templates.length}
         </div>

         {/* Liste des Templates */}
         {templates.map((t) => (
             <div key={t.id} className={styles.cartridge}>
                 <div className={styles.cartridgeStatus}></div>
                 <div className={styles.cartridgeId}>ID_REF: {t.id.toString().padStart(4, '0')}</div>
                 <div className={styles.cartridgeName}>{t.name}</div>
                 <div style={{marginTop: "10px", fontSize: "0.8rem", color: "#666"}}>
                    fields: {t.columns ? t.columns.length : (t.fields ? t.fields.length : 0)} modules loaded
                 </div>
                 
                 {/* Delete icon (Optionnel) */}
                 <div style={{
                     position: "absolute", bottom: "10px", right: "10px", 
                     opacity: 0.3, fontSize: "1.5rem"
                 }}>
                     💾
                 </div>
             </div>
         ))}

         {templates.length === 0 && (
             <div style={{textAlign: "center", color: "#444", marginTop: 20}}>
                 [ RACK EMPTY ]
             </div>
         )}
      </div>

    </div>
  );
}