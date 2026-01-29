"use client";

import React, { useRef, useState } from "react";
import { Hexagon } from "lucide-react";
import styles from "./KyntusLogo.module.css";

export default function KyntusLogo() {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calcul 3D Tilt
    const rotateX = ((y - rect.height / 2) / rect.height) * -20; // Max 20deg
    const rotateY = ((x - rect.width / 2) / rect.width) * 20;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 }); // Retour au centre
  };

  return (
    <div 
        className={styles.logoWrapper}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
    >
        <div 
            className={styles.logoContainer}
            ref={ref}
            style={{
                transform: `perspective(500px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
            }}
        >
            <div className={styles.iconBox}>
                <Hexagon size={32} strokeWidth={2} />
            </div>
            <div className={styles.text}>
                KYNTUS<span>OS</span>
            </div>
        </div>
    </div>
  );
}