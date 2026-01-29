"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. On laisse passer l'accès à la page de login sans vérification
    if (pathname === "/login") {
      setAuthorized(true);
      return;
    }

    // 2. Vérification du LocalStorage
    const storedUser = localStorage.getItem("kyntus_user");

    if (!storedUser) {
      // Pas connecté ? -> Login direct
      console.log("⛔ Non connecté -> Login");
      router.push("/login");
    } else {
      const user = JSON.parse(storedUser);
      
      // 3. Sécurité par Rôle (Anti-Dssara)
      // Si c'est un PILOT et qu'il essaie d'accéder aux pages Admin
      // Les pages Admin sont : Racine "/" (Dashboard), "/import", "/admin/..."
      const isAdminPage = pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/import");

      if (user.role === "PILOT" && isAdminPage) {
          console.log("👮‍♂️ Pilote bloqué en zone Admin -> Renvoi vers Pilot Board");
          router.push("/pilot/board");
      } else {
          // Tout est bon, on autorise l'affichage
          setAuthorized(true);
      }
    }
  }, [pathname, router]);

  // Pendant la vérification, on affiche un écran de chargement (ou rien)
  // pour éviter le "flash" du contenu protégé
  if (!authorized) {
    return (
        <div style={{
            height: "100vh", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            background: "#f4f6f8",
            color: "#666",
            fontFamily: "sans-serif"
        }}>
            Chargement de Kyntus Workflow...
        </div>
    );
  }

  return <>{children}</>;
}