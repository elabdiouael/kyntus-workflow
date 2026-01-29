"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, FileText, Settings, Hexagon, UploadCloud, Crown, Zap, AlertTriangle } from "lucide-react";
import styles from "./page.module.css";
import AuthGuard from "@/components/layout/AuthGuard";

// --- TYPES ---
interface PilotStats {
  id: number;
  username: string;
  totalTasks: number;
  validatedTasks: number;
  rejectedTasks: number;
  efficiency: number;
}

// --- COMPOSANTS INTERNES ---

function PilotCard({ pilot, rank }: { pilot: PilotStats, rank: number }) {
  // Rank 1 = Gold, Rank 2 = Silver (Standard), Rank 3 = Bronze (Standard)
  // L'CSS dyalna deja fih .rank1, .rank2, .rank3
  const isGold = rank === 1;
  const rankClass = rank === 1 ? styles.rank1 : rank === 2 ? styles.rank2 : styles.rank3;

  return (
    <div className={`${styles.pilotCard} ${rankClass}`}>
      
      {/* Crown pour le Rank 1 */}
      {isGold && <div className={styles.crown}><Crown size={30} fill="#ffd700" stroke="none" /></div>}
      
      {/* Avatar Hexagonal */}
      <div className={styles.avatarFrame}>
        <div className={styles.hexInner}>
          {pilot.username.charAt(0).toUpperCase()}
        </div>
      </div>

      <h3 className={styles.pilotName}>{pilot.username}</h3>
      <span className={styles.pilotRole}>RANK #{rank} • {isGold ? "ACE PILOT" : "PILOT"}</span>

      {/* Stats Mini Grid */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statVal}>{pilot.efficiency}%</span>
          <span className={styles.statLabel}>EFFICIENCY</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statVal}>{pilot.validatedTasks}</span>
          <span className={styles.statLabel}>VALIDÉS</span>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, desc, count, label, icon: Icon, sysId, href }: any) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className={styles.glassCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}><Icon size={20} /></div>
          <div>
            <div className={styles.cardCount}>{count}</div>
            <span className={styles.countLabel}>{label}</span>
          </div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDesc}>{desc}</p>
          <div className={styles.cardFooter}>
            <button className={styles.initBtn}>INITIALIZE &gt;</button>
            <span className={styles.sysId}>SYS_ID: {sysId}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- MAIN PAGE ---

export default function CommandPage() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<PilotStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User
    const stored = localStorage.getItem("kyntus_user");
    if (stored) setUser(JSON.parse(stored));

    // 2. Fetch Leaderboard Real-time
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/stats/leaderboard");
        if (res.ok) {
          const data = await res.json();
          // On prend juste les 3 premiers pour le podium
          setLeaderboard(data.slice(0, 3)); 
        }
      } catch (err) {
        console.error("Erreur connexion stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Optionnel: Refresh toutes les 30 secondes pour le "Live" feel
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);

  }, []);

  return (
    <AuthGuard>
      <div className={styles.container}>
        
        {/* HEADER */}
        <header className={styles.header}>
          <h1 className={styles.welcomeTitle}>
            Welcome Back, <span className={styles.userName}>{user?.username || "elabdi"}</span>
          </h1>
          <div className={styles.metaInfo}>
            <span>KYNTUS OS v3.0</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span>DATA FEED: LIVE</span>
            <div className={styles.statusDot}></div>
          </div>
        </header>

        {/* HERO CARD */}
        <section className={styles.heroSection}>
          <Link href="/import" style={{ textDecoration: 'none' }}>
            <div className={styles.heroCard}>
              <div className={styles.scanlines}></div>
              <div className={styles.heroIcon}>
                <Hexagon size={60} color="#00f3ff" fill="rgba(0, 243, 255, 0.1)" strokeWidth={1.5} />
              </div>
              <h2 className={styles.heroTitle}>SYSTEM READY</h2>
              <div className={styles.heroSubtitle}>AWAITING PROJECT INJECTION...</div>
            </div>
          </Link>
        </section>

        {/* MODULES GRID */}
        <section className={styles.grid}>
          <DashboardCard 
            title="Team & Performance" desc="Gérer les accès et voir les stats en temps réel."
            count={loading ? "..." : leaderboard.length} label="TOP PILOTES" icon={Users} sysId="5270" href="/admin/users"
          />
          <DashboardCard 
            title="Production Flow" desc="Importer de nouveaux fichiers Excel et assigner."
            count="∞" label="TÂCHES" icon={UploadCloud} sysId="485" href="/import"
          />
          <DashboardCard 
            title="System Config" desc="Créer ou modifier les templates de workflow."
            count="1" label="PROJETS" icon={Settings} sysId="102" href="/admin/templates"
          />
        </section>

        {/* ELITE PILOTS SQUADRON (DYNAMIC) */}
        <section className={styles.pilotsSection}>
          <div className={styles.sectionHeader}>
            <Zap size={20} color="#00f3ff" />
            <h3 className={styles.sectionTitle}>ELITE SQUADRON (LIVE)</h3>
            <div className={styles.sectionLine}></div>
          </div>

          <div className={styles.pilotsGrid}>
            {loading ? (
                <div style={{ color: "#00f3ff", fontFamily: "monospace", padding: "50px" }}>
                   SYNCING NEURAL NETWORK...
                </div>
            ) : leaderboard.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", padding: "50px", textAlign: "center" }}>
                   <AlertTriangle size={40} style={{ marginBottom: 10 }}/>
                   <br/>AUCUNE DONNÉE PILOTE
                </div>
            ) : (
                <>
                  {/* LOGIC PODIUM: On veut afficher 2, 1, 3 visuellement */}
                  
                  {/* 2ème Place (A Gauche) */}
                  {leaderboard[1] && <PilotCard pilot={leaderboard[1]} rank={2} />}
                  
                  {/* 1ère Place (Au Centre - Gold) */}
                  {leaderboard[0] && <PilotCard pilot={leaderboard[0]} rank={1} />}
                  
                  {/* 3ème Place (A Droite) */}
                  {leaderboard[2] && <PilotCard pilot={leaderboard[2]} rank={3} />}
                </>
            )}
          </div>
        </section>

      </div>
    </AuthGuard>
  );
}