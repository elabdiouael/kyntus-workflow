"use client";

import React, { useRef, useState } from "react";
import styles from "./CyberCard.module.css";
import MatrixRain from "./MatrixRain";

export default function CyberCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calcul de l'inclinaison (Tilt)
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 }); // Retour au centre
  };

  return (
    <div className={styles.container}>
      <div 
        ref={cardRef}
        className={styles.card}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        <div className={styles.matrixLayer}>
            <MatrixRain />
        </div>

        <div className={styles.content}>
            <div className={styles.icon}>💠</div>
            <h1 className={styles.title}>System Ready</h1>
            <div className={styles.subtitle}>
                AWAITING PROJECT INJECTION...
            </div>
        </div>
      </div>
    </div>
  );
}