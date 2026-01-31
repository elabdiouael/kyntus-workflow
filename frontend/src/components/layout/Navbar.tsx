"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, ChevronRight } from "lucide-react";
import styles from "./Navbar.module.css";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher"; // ✅ Import du Switcher

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState("");

  // 1. Get User
  useEffect(() => {
    const stored = localStorage.getItem("kyntus_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // 2. Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Generate Breadcrumb
  const getBreadcrumb = () => {
    if (pathname === "/") return "DASHBOARD";
    const parts = pathname?.split("/").filter(Boolean) || [];
    return parts.length > 0 ? parts[parts.length - 1].toUpperCase() : "HOME";
  };

  const section = pathname?.includes("admin") ? "COMMAND" : "WORKSPACE";

  return (
    <nav className={styles.navbar}>
      
      {/* ZONE GAUCHE : LOCALISATION */}
      <div className={styles.leftZone}>
        <div className={styles.pathBox}>
           <span>{section}</span>
           <ChevronRight size={14} className={styles.separator} />
           <span className={styles.currentPath}>
              {getBreadcrumb()}
           </span>
        </div>
      </div>

      {/* ZONE DROITE : OUTILS & STATUTS */}
      <div className={styles.rightZone}>
        
        {/* ✅ SWITCHER DE LANGUE */}
        <LanguageSwitcher />

        {/* System Status */}
        <div className={styles.systemStatus}>
           <div className={styles.pulseDot}></div>
           NET_LINK: STABLE
        </div>

        {/* Clock */}
        <div className={styles.clock}>
           {time || "--:--"}
        </div>

        {/* User Mini Profile */}
        <div className={styles.profile}>
           <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.username || "GUEST"}</span>
              <span className={styles.userRole}>
                 {user?.role === "ADMIN" ? "LEVEL 5 ACCESS" : "PILOT UNIT"}
              </span>
           </div>
           <div className={styles.avatar}>
              {user?.role === "ADMIN" ? <Shield size={16}/> : (user?.username?.[0] || "U")}
           </div>
        </div>

      </div>
    </nav>
  );
}