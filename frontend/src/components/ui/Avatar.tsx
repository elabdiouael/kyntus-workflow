import React from "react";
import styles from "./Avatar.module.css";

export default function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name ? name.substring(0, 2).toUpperCase() : "??";
  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      {initials}
    </div>
  );
}