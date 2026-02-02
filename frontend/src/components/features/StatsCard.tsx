import React from "react";
import Card from "../layout/Card";
import styles from "./StatsCard.module.css";

interface StatsCardProps {
  label: string;
  value: number;
  variant?: "primary" | "success" | "warning" | "danger";
  icon?: string; // Emoji ola SVG
}

export default function StatsCard({ label, value, variant = "primary", icon }: StatsCardProps) {
  return (
    <Card className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
      {icon && <div className={styles.icon}>{icon}</div>}
    </Card>
  );
}