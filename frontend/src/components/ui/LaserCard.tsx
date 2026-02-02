"use client";

import React, { useEffect, useState } from "react";
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
    const [sysId, setSysId] = useState("000");

    useEffect(() => {
        setSysId(Math.floor(Math.random() * 1000).toString().padStart(3, '0'));
    }, []);

    // Extraction valeur / unité (ex: "12 Missions" -> "12" et "MISSIONS")
    const valParts = value.split(" ");
    const mainVal = valParts[0] || "0";
    const unitVal = valParts.slice(1).join(" ") || "UNIT";

    return (
        <div 
            className={styles.cardWrapper}
            onClick={onClick}
            style={{ "--laser-color": color } as React.CSSProperties}
        >
            <div className={styles.gridOverlay}></div>
            <div className={styles.scanner}></div>
            <div className={styles.sysId}>SYS::{sysId}</div>

            <div className={styles.content}>
                <div className={styles.headerRow}>
                    <div className={styles.iconBox}>{icon}</div>
                    <div className={styles.metaColumn}>
                        <div className={styles.mainValue}>{mainVal}</div>
                        <div className={styles.subValue}>{unitVal}</div>
                    </div>
                </div>

                <div>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.desc}>{desc}</p>
                </div>

                <div className={styles.footer}>
                    <span>ACCESS MODULE</span>
                    <span className={styles.actionArrow}>→</span>
                </div>
            </div>
        </div>
    );
}