"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Cloud, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// --- 1. NEBULA (SADIM) ---
// Hada houwa li kay3ti l'effet dyal "Real Sky" b l'ghyam mlewwnin
function GalaxyNebula() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    // Rotation très lente pour donner vie au fond
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <group ref={ref}>
      {/* COUCHE 1: DEEP PURPLE (L'Fond) */}
      <Cloud 
        opacity={0.3} 
        speed={0.1} // Vitesse de mouvement du gaz
        width={20} 
        depth={5} 
        segments={20} 
        position={[0, 0, -20]} // Loin derrière
        color="#2a004d" // Violet Sombre
      />
      
      {/* COUCHE 2: MYSTIC BLUE (L'Eclat) */}
      <Cloud 
        opacity={0.3} 
        speed={0.1} 
        width={15} 
        depth={2} 
        segments={10} 
        position={[10, 5, -15]} 
        color="#001a4d" // Bleu Nuit
      />

       {/* COUCHE 3: CYAN HIGHLIGHTS (Dwi khfif) */}
       <Cloud 
        opacity={0.1} 
        speed={0.2} 
        width={30} 
        depth={5} 
        segments={15} 
        position={[-10, -5, -15]} 
        color="#006666" 
      />
    </group>
  );
}

// --- 2. DYNAMIC STARS (Noujoum Motaharrika) ---
function MovingStars() {
    const starsRef = useRef<THREE.Group>(null!);
    
    useFrame((state) => {
        // Rotation de la galaxie entière
        starsRef.current.rotation.y += 0.0005; 
        starsRef.current.rotation.x += 0.0002;
    });

    return (
        <group ref={starsRef}>
            {/* ETOILES LOINTAINES (Petites et nombreuses) */}
            <Stars 
                radius={80} 
                depth={60} 
                count={8000} 
                factor={4} 
                saturation={0.5} 
                fade 
                speed={1} 
            />
            {/* ETOILES PROCHES (Grosses et brillantes) */}
            <Stars 
                radius={50} 
                depth={20} 
                count={500} 
                factor={8} // Plus grosses
                saturation={0} 
                fade 
                speed={2} 
            />
        </group>
    );
}

// --- 3. BACKGROUND GRADIENT (L'Ofo9) ---
// Sphere géante avec un dégradé pour ne pas avoir un noir plat
function DeepSpaceBackground() {
    return (
        <mesh scale={[100, 100, 100]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial 
                side={THREE.BackSide} 
                color="#02040a" // Base très sombre
            />
        </mesh>
    );
}

export function CosmicEnvironment() {
  return (
    <>
        {/* Lumière d'ambiance bleutée pour unifier le tout */}
        <ambientLight intensity={0.2} color="#001133" />
        
        {/* Brume lointaine pour la profondeur */}
        <fog attach="fog" args={["#000510", 10, 60]} />

        <DeepSpaceBackground />
        <GalaxyNebula />
        <MovingStars />
        
        {/* Poussière cosmique flottante (Premier plan) */}
        <Sparkles 
            count={200} 
            scale={20} 
            size={3} 
            speed={0.2} 
            opacity={0.5} 
            color="#ffffff" 
        />
    </>
  );
}