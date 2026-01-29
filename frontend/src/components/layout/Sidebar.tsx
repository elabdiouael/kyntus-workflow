"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutGrid, Target, SquareActivity, DatabaseZap, UsersRound, Cpu, LogOut 
} from "lucide-react";
import styles from "./Sidebar.module.css"; // ✅ IMPORT S7I7
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("kyntus_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
      localStorage.removeItem("kyntus_user");
      router.push("/login");
  };

  const menuItems = [
    { name: "Command Center", path: "/", icon: LayoutGrid },
    { name: "Task Dispatch", path: "/admin/tasks", icon: Target },
    { name: "Tactical Board", path: "/admin/kanban", icon: SquareActivity },
    { name: "Data Injection", path: "/import", icon: DatabaseZap },
    { name: "Team Ops", path: "/admin/stats", icon: UsersRound },
    { name: "System Config", path: "/admin/templates", icon: Cpu },
  ];

  return (
    <div className={styles.sidebar}>
      {/* HEADER / LOGO */}
      <div className={styles.logoArea}>
          <div className={styles.logoHex}>K</div>
          <div className={styles.logoText}>KYNTUS<span style={{color:"#00f2ea"}}>OS</span></div>
      </div>
      
      {/* MENU */}
      <div className={styles.menu}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`${styles.menuItem} ${pathname === item.path ? styles.active : ""}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
            {pathname === item.path && <div className={styles.activeDot}></div>}
          </div>
        ))}
      </div>

      {/* FOOTER / USER */}
      <div className={styles.footer}>
          <div className={styles.userSection}>
              <div className={styles.avatar}>{user?.username?.charAt(0).toUpperCase() || "A"}</div>
              <div className={styles.userInfo}>
                  <div className={styles.userName}>{user?.username || "Admin"}</div>
                  <div className={styles.userStatus}>SECURE LINK ●</div>
              </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Disconnect">
              <LogOut size={18} />
          </button>
      </div>
    </div>
  );
}