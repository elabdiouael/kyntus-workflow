"use client";

import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Send, 
  Map, 
  Database, 
  Users, 
  Settings,
  LogOut
} from "lucide-react";
// 👇 ON UTILISE LE HOOK GLOBAL
import { useTransition } from "@/components/providers/TransitionProvider";
import styles from "./AdminSidebar.module.css"; 

export default function AdminSidebar() {
  const pathname = usePathname();
  const { navigate } = useTransition(); // ✅ Récupère la commande Warp

  const menuItems = [
    { name: "Command Center", icon: <LayoutDashboard size={20} />, path: "/" },
    { name: "Task Dispatch", icon: <Send size={20} />, path: "/admin/tasks" }, 
    { name: "Tactical Board", icon: <Map size={20} />, path: "/admin/tactical" },
    { name: "Data Injection", icon: <Database size={20} />, path: "/import" },
    { name: "Team Ops", icon: <Users size={20} />, path: "/admin/team" },
    { name: "System Config", icon: <Settings size={20} />, path: "/admin/templates" },
  ];

  const handleLogout = () => {
      localStorage.removeItem("kyntus_user");
      navigate("/login");
  };

  return (
    <div className={styles.sidebar}>
      {/* HEADER / LOGO */}
      <div className={styles.logoArea}>
         <div className={styles.logoHex}>K</div>
         <div className={styles.logoText}>KYNTUS<span style={{color:"#0070f3"}}>OS</span></div>
      </div>
      
      {/* MENU */}
      <div className={styles.menu}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            // 👇 CLICK déclenche le WARP au lieu d'un lien simple
            onClick={() => navigate(item.path)} 
            className={`${styles.menuItem} ${pathname === item.path ? styles.active : ""}`}
          >
            {item.icon}
            <span>{item.name}</span>
            {/* Petit indicateur actif */}
            {pathname === item.path && <div className={styles.activeDot}></div>}
          </div>
        ))}
      </div>

      {/* FOOTER / USER */}
      <div className={styles.footer}>
          <div className={styles.userSection}>
              <div className={styles.avatar}>A</div>
              <div className={styles.userInfo}>
                  <div className={styles.userName}>elabdi</div>
                  <div className={styles.userStatus}>ONLINE ●</div>
              </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} title="Disconnect">
              <LogOut size={18} />
          </button>
      </div>
    </div>
  );
}