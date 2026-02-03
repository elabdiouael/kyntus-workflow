"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, MeshReflectorMaterial, OrbitControls, Float, Stars } from "@react-three/drei";
import { BarPillar } from "./BarPillar";
import { Axes } from "./Axes";
import * as THREE from "three";

export function Experience({ projects }: { projects: any[] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Camera douce movement
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle rotation of the whole group
    if(groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    }
  });

  const spacing = 2.5;
  const totalWidth = Math.max(projects.length * spacing, 10);
  const startX = -(projects.length * spacing) / 2 + (spacing / 2);

  return (
    <>
        {/* CONTROLS (T9der dor b souris walakin Limited) */}
        <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2 - 0.1} // Maynzlch that lard
            minPolarAngle={Math.PI / 3}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
        />

        {/* LIGHTING (Ambiance Cyberpunk) */}
        <ambientLight intensity={0.5} color="#ffffff" />
        
        {/* Main Blue Spotlight */}
        <spotLight 
            position={[10, 15, 10]} 
            angle={0.5} 
            penumbra={1} 
            intensity={20} 
            color="#00f0ff" 
            castShadow 
            shadow-bias={-0.0001}
        />
        
        {/* Secondary Purple Fill */}
        <pointLight position={[-10, 5, -5]} intensity={10} color="#a855f7" />

        {/* BACKGROUND STARS */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* REFLECTIVE FLOOR (L'ard katbri) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={1024}
                mixBlur={1}
                mixStrength={40}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#050505"
                metalness={0.5}
                mirror={0} // Fix Type Error (just in case)
            />
        </mesh>

        {/* SCENE CONTENT */}
        <group ref={groupRef}>
            <Axes width={totalWidth} height={5} />
            
            <group position={[0, 0, 0]}>
                {projects.map((proj, index) => (
                    <BarPillar 
                        key={proj.templateId || index}
                        data={proj}
                        position={[startX + (index * spacing), 0, 0]}
                        index={index}
                    />
                ))}
            </group>
        </group>
    </>
  );
}