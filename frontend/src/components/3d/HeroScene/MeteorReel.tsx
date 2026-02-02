"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";

export function MeteorReel() {
    const meteorRef = useRef<THREE.Group>(null!);
    const particlesRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        
        // --- 1. TRAJECTOIRE COMPLEXE (Infinity Loop 3D) ---
        // Equation paramétrique pour un mouvement fluide et organique
        const x = Math.sin(t * 1.2) * 6; // Largeur
        const z = Math.cos(t * 1.2) * 3; // Profondeur
        const y = Math.sin(t * 2.5) * 2; // Hauteur (Vague)
        
        // Mise à jour de la position du Météore
        if (meteorRef.current) {
            meteorRef.current.position.set(x, y, z);
            
            // Rotation du noyau pour le réalisme (Spinning)
            meteorRef.current.rotation.z += 0.2;
            meteorRef.current.rotation.x += 0.1;
        }

        // --- 2. RETARD DES PARTICULES (LAG EFFECT) ---
        // Les particules suivent le météore avec un léger retard (Lerp) pour donner l'impression de traînée
        if (particlesRef.current) {
            particlesRef.current.position.lerp(new THREE.Vector3(x, y, z), 0.1);
        }
    });

    return (
        <>
            <group ref={meteorRef}>
                {/* A. TRAIL DE LUMIÈRE (La queue bleue) */}
                {/* Attenuation t*t fait que la queue devient très fine à la fin */}
                <Trail 
                    width={3} 
                    length={6} 
                    color={new THREE.Color("#0066ff")} 
                    attenuation={(t) => t * t}
                >
                    {/* B. LE NOYAU (Core) - Plasma blanc chaud */}
                    <mesh>
                        <icosahedronGeometry args={[0.2, 1]} />
                        <meshBasicMaterial color="#ffffff" toneMapped={false} />
                    </mesh>
                </Trail>

                {/* C. L'AURA GLOW (Lumière Volumétrique) */}
                <pointLight 
                    color="#00f2ea" 
                    intensity={15} 
                    distance={10} 
                    decay={2} 
                />
                
                {/* Sphère Glow transparente autour du noyau */}
                <mesh scale={[1.5, 1.5, 1.5]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial 
                        color="#00f2ea" 
                        transparent 
                        opacity={0.3} 
                        blending={THREE.AdditiveBlending} 
                        depthWrite={false} // Important pour la transparence
                    />
                </mesh>
            </group>

            {/* D. POUSSIÈRE D'ÉTOILE (Particules détachées) */}
            {/* Elles suivent le noyau mais flottent un peu autour */}
            <group ref={particlesRef}>
                 <Sparkles 
                    count={50} 
                    scale={2} 
                    size={6} 
                    speed={0} // Vitesse relative 0 car le groupe bouge déjà
                    opacity={0.8}
                    color="#00f2ea"
                 />
            </group>
        </>
    );
}