"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import WarpTransition from "@/components/ui/WarpTransition";

// 1. Création du Context (Télécommande)
const TransitionContext = createContext({
  navigate: (path: string) => {},
});

// 2. Le Provider (Le Moteur)
export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const [isWarping, setIsWarping] = useState(false);
  const router = useRouter();

  const navigate = (path: string) => {
    if (isWarping) return; // Déjà en cours

    setIsWarping(true); // 🚀 Start Engine

    // On attend 800ms (Temps de l'animation Warp)
    setTimeout(() => {
      router.push(path);
      // On coupe l'animation après avoir chargé la page
      setTimeout(() => setIsWarping(false), 500); 
    }, 800);
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {/* L'Animation est ICI, au dessus de tout */}
      <WarpTransition active={isWarping} />
      {children}
    </TransitionContext.Provider>
  );
};

// 3. Le Hook (Pour l'utiliser partout)
export const useTransition = () => useContext(TransitionContext);