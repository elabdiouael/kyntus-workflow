"use client";

import { useState, useMemo, useRef } from "react";
import { Text, Edges, Float } from "@react-three/drei";
import { useSpring, animated, config } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NEON_PALETTE = [
    "#00f0ff", // Cyan
    "#7c3aed", // Violet
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#f43f5e", // Rose
];

export function BarPillar({ data, position, index }: any) {
  const [hovered, setHovered] = useState(false);
  const color = useMemo(() => NEON_PALETTE[index % NEON_PALETTE.length], [index]);
  
  // Safe data handling
  const progress = data?.progress || 0;
  const height = (progress / 100) * 5; // Max height 5 units
  const safeHeight = Math.max(height, 0.2); // Minimum height visual

  // Animation Spring
  const { springHeight, springScale } = useSpring({
    springHeight: safeHeight,
    springScale: hovered ? 1.15 : 1,
    config: config.wobbly,
    delay: index * 100, // Stagger effect
  });

  return (
    <group position={position}>
        {/* Floating Label Logic */}
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            <Text
                position={[0, 5.5, 0]}
                fontSize={0.25}
                color={hovered ? "white" : "#94a3b8"}
                font="/fonts/Inter-Bold.woff" // Optional: remove prop if font missing
                anchorX="center"
                anchorY="bottom"
            >
                {data.templateName?.substring(0, 10).toUpperCase()}
            </Text>
            
            {/* Percentage Badge */}
            {hovered && (
                 <Text
                 position={[0, 6, 0]}
                 fontSize={0.35}
                 color={color}
                 anchorX="center"
                 anchorY="bottom"
                 outlineWidth={0.02}
                 outlineColor="#000000"
             >
                 {progress}%
             </Text>
            )}
        </Float>

        {/* === THE BAR STRUCTURE === */}
        <animated.group scale-x={springScale} scale-z={springScale}>
            
            {/* 1. GLASS SHELL (Fixed Size Container) */}
            <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[1.2, 5, 1.2]} />
                <meshPhysicalMaterial 
                    color="#ffffff"
                    transmission={0.9} // Glass
                    opacity={1}
                    metalness={0}
                    roughness={0}
                    ior={1.5}
                    thickness={0.5}
                    transparent
                />
                <Edges color="white" threshold={15} opacity={0.1} />
            </mesh>

            {/* 2. NEON LIQUID CORE (Actual Data) */}
            <animated.mesh position-y={springHeight.to(h => h / 2)}>
                {/* Cylinder looks cooler than box for liquid */}
                <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
                <animated.meshStandardMaterial 
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 3 : 1.5} // Glow effect
                    toneMapped={false}
                />
                {/* Connect height animation to scale-y */}
                <animated.group scale-y={springHeight} /> 
                {/* ^ Note: R3F animated props work best on props, but scaling geom is tricky. 
                    Let's use scale on mesh directly */}
            </animated.mesh>
             
             {/* Fixing Scale Logic for the Cylinder */}
             <animated.mesh 
                position-y={springHeight.to(h => h / 2)} 
                scale-y={springHeight}
            >
                 <boxGeometry args={[0.8, 1, 0.8]} />
                 <meshStandardMaterial 
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                    toneMapped={false}
                 />
             </animated.mesh>

            {/* 3. BASE EMITTER */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[0.6, 0.8, 32]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} />
            </mesh>

        </animated.group>

        {/* Floor Reflection Fake (Glow on ground) */}
        <pointLight position={[0, 1, 0]} intensity={hovered ? 2 : 0} color={color} distance={3} />
    </group>
  );
}