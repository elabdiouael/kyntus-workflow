"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutGrid, Target, SquareActivity, DatabaseZap, UsersRound, Cpu, LogOut, ScanSearch, FileDown,
  TableProperties
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider"; // ✅ Hook de traduction

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const { t } = useLanguage(); // ✅ On récupère la fonction t

  useEffect(() => {
    const stored = localStorage.getItem("kyntus_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
      localStorage.removeItem("kyntus_user");
      window.location.href = "/login";
  };

  // ✅ Menu traduit dynamiquement
  const menuItems = [
    { name: t('sidebar', 'command'), path: "/", icon: LayoutGrid },
    { name: t('sidebar', 'dispatch'), path: "/admin/tasks", icon: Target },
    { name: t('sidebar', 'tactical'), path: "/admin/kanban", icon: SquareActivity },
    { name: t('sidebar', 'inspector'), path: "/admin/check", icon: ScanSearch },
    { name: t('sidebar', 'omni'), path: "/admin/data", icon: TableProperties },
    { name: t('sidebar', 'export'), path: "/admin/export", icon: FileDown },
    { name: t('sidebar', 'import'), path: "/import", icon: DatabaseZap },
    { name: t('sidebar', 'team'), path: "/admin/stats", icon: UsersRound },
    { name: t('sidebar', 'config'), path: "/admin/templates", icon: Cpu },
  ];

  return (
    <div className={styles.sidebar}>
      {/* HEADER */}
      <div className={styles.logoArea}>
         <div className={styles.logoHex}>K</div>
         <div className={styles.logoText}>KYNTUS<span style={{color:"#00f2ea"}}>OS</span></div>
      </div>
      
      {/* MENU */}
      <div className={styles.menu}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
            >
              <item.icon size={22} />
              <span className={styles.itemLabel}>{item.name}</span>
              {isActive && <div className={styles.activeBar}></div>}
            </Link>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
          <div className={styles.userSection}>
              <div className={styles.avatar}>{user?.username?.charAt(0).toUpperCase() || "A"}</div>
              <div className={styles.userInfo}>
                  <div className={styles.userName}>{user?.username || "Admin"}</div>
                  <div className={styles.userStatus}>SECURE LINK ●</div>
              </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title={t('sidebar', 'logout')}>
              <LogOut size={18} />
          </button>
      </div>
    </div>
  );
}