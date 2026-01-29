"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("kyntus_user");
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        🚀 Kyntus<span className={styles.highlight}>Pilot</span>
      </div>
      
      <div className={styles.menu}>
         <Link href="/pilot/board" className={`${styles.link} ${pathname === '/pilot/board' ? styles.active : ''}`}>
            📝 Mes Tâches
         </Link>
         <Link href="/pilot/kanban" className={`${styles.link} ${pathname === '/pilot/kanban' ? styles.active : ''}`}>
            🏗️ Kanban (Drag)
         </Link>
         
         {/* --- LIEN ACTIVÉ --- */}
         <Link href="/pilot/history" className={`${styles.link} ${pathname === '/pilot/history' ? styles.active : ''}`}>
            🕒 Historique
         </Link>
      </div>

      <div className={styles.userZone}>
        <div className={styles.userInfo}>
            <strong>{user?.username}</strong>
            <span className={styles.role}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
            Déconnexion
        </button>
      </div>
    </nav>
  );
}