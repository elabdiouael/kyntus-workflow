"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { BarChart3, Activity, Cpu } from "lucide-react";
import { Experience } from "./Experience";
import styles from "./Chart3D.module.css";
import * as THREE from "three";
import { Html, useProgress } from "@react-three/drei";

// Loader Cyberpunk
function ChartLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full animate-spin" />
        <div className="font-mono text-cyan-400 text-sm tracking-[0.2em] font-bold animate-pulse">
          SYSTEM_BOOT :: {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  );
}

export default function ProcessChart3D({ projects = [] }: { projects: any[] }) {
  // Hack sghir bach n-forcer re-render ila kant data mza3z3a
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div className={styles.chartContainer} />;

  return (
    <div className={styles.chartContainer}>
      
      {/* 2D HUD OVERLAY */}
      <div className={styles.overlayHeader}>
        <div className={styles.titleBox}>
           <div className="p-2 bg-cyan-500/20 rounded border border-cyan-400/50">
             <BarChart3 color="#00f0ff" size={20} />
           </div>
           <h2 className={styles.title}>PROJECT_METRICS // V.2.0</h2>
        </div>
        <div className={styles.metaBox}>
            <span className={styles.metaItem}><Cpu size={14}/> GPU_ACCEL</span>
            <span className={styles.metaItem}><Activity size={14}/> LIVE_FEED</span>
        </div>
      </div>

      {/* 3D CANVAS */}
      <div className={styles.canvasWrapper}>
        <Canvas
            shadows
            dpr={[1, 2]} // Quality adaptation
            camera={{ position: [0, 6, 14], fov: 45 }}
            gl={{ 
              antialias: true, 
              toneMapping: THREE.ACESFilmicToneMapping, 
              toneMappingExposure: 1.2 
            }}
        >
            <color attach="background" args={["#020617"]} />
            {/* Fog noir bach ykhbi l 7doud */}
            <fog attach="fog" args={["#020617", 5, 25]} />
            
            <Suspense fallback={<ChartLoader />}>
                <Experience projects={projects} />
            </Suspense>
        </Canvas>
      </div>
    </div>
  );
}