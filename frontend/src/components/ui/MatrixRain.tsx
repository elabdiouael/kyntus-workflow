"use client";
import { useEffect, useRef } from "react";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Full Fill
    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = canvas.parentElement?.clientHeight || 200;
    };
    resize();
    window.addEventListener("resize", resize);

    const letters = "KYNTUS_2026_AI_SYSTEM_0101";
    const matrix = letters.split("");
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) drops[x] = 1;

    const draw = () => {
      // Trail effect (Noir transparent)
      ctx.fillStyle = "rgba(2, 4, 10, 0.1)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      ctx.fontWeight = "bold";

      for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
        // Random Colors: Cyan, Blue, Purple (Tech Luxe)
        const random = Math.random();
        ctx.fillStyle = random > 0.9 ? "#fff" : random > 0.6 ? "#00f2ea" : "#0070f3"; 
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
        clearInterval(interval);
        window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", opacity: 0.6 }} />;
}