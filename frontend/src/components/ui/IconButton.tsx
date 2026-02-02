import React from "react";
import styles from "./IconButton.module.css";

export default function IconButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={styles.btn} {...props}>{children}</button>;
}