"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar"; // ✅ ICI ON CHANGE L'IMPORT
import NotificationCenter from "@/components/features/NotificationCenter";
import InteractiveBackground from "@/components/ui/InteractiveBackground";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPage = pathname === "/login";
  const isPilotSection = pathname?.startsWith("/pilot");

  // On affiche la Sidebar SEULEMENT si c'est NI Login NI Pilot
  const showSidebar = !isPublicPage && !isPilotSection;

  return (
    <>
      <InteractiveBackground />

      {/* C'est ici qu'on appelle le bon composant */}
      {showSidebar && <Sidebar />}

      <main 
        style={{ 
          marginLeft: showSidebar ? "80px" : "0px", 
          minHeight: "100vh",
          position: "relative",
          zIndex: 10,
          transition: "margin-left 0.3s ease"
        }}
      >
        {!isPublicPage && <NotificationCenter />}
        {children}
      </main>
    </>
  );
}