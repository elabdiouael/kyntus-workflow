"use client";

import { Text, Line } from "@react-three/drei";

export function Axes({ width = 10, height = 5 }) {
  const ticks = [0, 25, 50, 75, 100];
  const gridColor = "#1e293b";
  const labelColor = "#475569";

  return (
    <group position={[-width / 2 - 1.5, 0, 0]}>
      
      {/* Main Vertical Spine */}
      <Line 
        points={[[0, 0, 0], [0, height + 1, 0]]} 
        color="#00f0ff" 
        lineWidth={2} 
        toneMapped={false}
      />

      {ticks.map((tick) => {
        const yPos = (tick / 100) * height;
        return (
          <group key={tick} position={[0, yPos, 0]}>
            {/* Horizontal Grid Line across the whole chart */}
            <Line 
                points={[[0, 0, 0], [width + 3, 0, 0]]} 
                color={gridColor} 
                lineWidth={1} 
                transparent 
                opacity={0.5}
            />
            
            {/* Tick Marker */}
            <mesh position={[-0.2, 0, 0]}>
                <boxGeometry args={[0.4, 0.04, 0.04]} />
                <meshBasicMaterial color="#00f0ff" />
            </mesh>

            {/* Label */}
            <Text
              position={[-0.8, 0, 0]}
              fontSize={0.25}
              color={labelColor}
              anchorX="right"
              anchorY="middle"
            >
              {tick}
            </Text>
          </group>
        );
      })}

      {/* X Axis Label */}
      <Text
          position={[width + 3, 0, 0]}
          fontSize={0.2}
          color="#00f0ff"
          anchorX="left"
          anchorY="middle"
          rotation={[0, 0, -Math.PI / 2]}
      >
          // TEMPLATES_DATABASE
      </Text>
    </group>
  );
}