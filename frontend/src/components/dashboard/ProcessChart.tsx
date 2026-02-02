"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, Zap } from "lucide-react";
import styles from "./ProcessChart.module.css";

interface ProjectData {
  templateName: string;
  progress: number;
  templateId: number;
}

interface ProcessChartProps {
  projects: ProjectData[];
}

export default function ProcessChart({ projects }: ProcessChartProps) {
  // Trier par progression pour un look plus "analytique"
  const sortedProjects = useMemo(() => {
    return [...(projects || [])].sort((a, b) => b.progress - a.progress);
  }, [projects]);

  const maxVal = 100;

  return (
    <div className={styles.chartContainer}>
      
      {/* Header du Chart */}
      <div className={styles.chartHeader}>
        <div className={styles.titleBox}>
            <BarChart3 size={24} color="#00f2ea" />
            <h2 className={styles.title}>ANALYSE DE PERFORMANCE</h2>
        </div>
        <div className={styles.metaBox}>
            <span className={styles.metaItem}><TrendingUp size={14}/> GLOBAL VELOCITY: HIGH</span>
            <span className={styles.metaItem}><Zap size={14}/> ACTIVE NODES: {projects?.length || 0}</span>
        </div>
      </div>

      {/* Le Graphique 2D */}
      <div className={styles.graphBody}>
        
        {/* Grille de fond (Lignes Y) */}
        <div className={styles.gridLines}>
            {[0, 25, 50, 75, 100].map((val) => (
                <div key={val} className={styles.gridLine} style={{bottom: `${val}%`}}>
                    <span className={styles.gridLabel}>{val}%</span>
                </div>
            ))}
        </div>

        {/* Les Barres (Data) */}
        <div className={styles.barsArea}>
            {sortedProjects.map((p, i) => (
                <div key={p.templateId} className={styles.barGroup}>
                    {/* La Barre */}
                    <div className={styles.barTrack}>
                        <div 
                            className={styles.barFill} 
                            style={{ 
                                height: `${p.progress}%`,
                                animationDelay: `${i * 0.1}s`, // Stagger effect
                                backgroundColor: p.progress === 100 ? '#39ff14' : (p.progress < 30 ? '#ff0055' : '#00f2ea')
                            }}
                        >
                            <span className={styles.barValue}>{p.progress}%</span>
                            <div className={styles.barGlow}></div>
                        </div>
                    </div>
                    {/* Label X-Axis */}
                    <span className={styles.barLabel} title={p.templateName}>
                        {p.templateName.substring(0, 10)}{p.templateName.length > 10 ? '..' : ''}
                    </span>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}