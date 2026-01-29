"use client";

import React, { useEffect, useState } from "react"; // 1. Zid useEffect & useState
import styles from "./LaserCard.module.css";

interface LaserCardProps {
    title: string;
    value: string;
    icon: any;
    desc: string;
    color: string;
    onClick: () => void;
}

export default function LaserCard({ title, value, icon, desc, color, onClick }: LaserCardProps) {
    // 2. Fixer l'random ID
    const [sysId, setSysId] = useState("0000");

    useEffect(() => {
        // Hna kygénéra ghir f browser, donc pas d'erreur
        setSysId(Math.floor(Math.random() * 9999).toString());
    }, []);

    return (
        <div 
            className={styles.cardWrapper}
            onClick={onClick}
            style={{ "--laser-color": color } as React.CSSProperties}
        >
            <div className={styles.gridOverlay}></div>
            <div className={styles.scanner}></div>

            {/* 3. Affiche l'ID stable */}
            <div className={styles.techDecor}>
                SYS_ID: {sysId}
            </div>

            <div className={styles.content}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px"}}>
                    <div className={styles.iconBox}>
                        {icon}
                    </div>
                    
                    <div style={{textAlign: "right"}}>
                        <div style={{
                            fontSize: "2.5rem", 
                            fontWeight: "900", 
                            color: "white", 
                            lineHeight: "1",
                            textShadow: `0 0 20px ${color}`
                        }}>
                            {value.split(" ")[0]}
                        </div>
                        <div style={{
                            fontSize: "0.7rem", 
                            color: color, 
                            textTransform: "uppercase", 
                            fontWeight: "bold", 
                            letterSpacing: "2px",
                            marginTop: "5px"
                        }}>
                            {value.split(" ")[1]}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{
                        fontSize: "1.4rem", 
                        color: "white", 
                        marginBottom: "10px", 
                        fontFamily: "sans-serif",
                        letterSpacing: "-0.5px"
                    }}>
                        {title}
                    </h3>
                    <p style={{
                        fontSize: "0.85rem", 
                        color: "#8899a6", 
                        lineHeight: "1.5",
                        opacity: 0.8
                    }}>
                        {desc}
                    </p>
                </div>

                <div style={{
                    marginTop: "25px", paddingTop: "15px", 
                    borderTop: "1px dashed rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    color: color, fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px"
                }}>
                    <span>INITIALIZE</span>
                    <span style={{fontSize: "1.2rem"}}>⇲</span>
                </div>
            </div>
        </div>
    );
}