"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function CinematicCamera() {
    useFrame((state) => {
        // Interaction Souris douce
        const targetX = state.pointer.x * 2;
        const targetY = state.pointer.y * 1;
        
        // Lerp (Lissage)
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.03);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.03);
        
        state.camera.lookAt(0, 0, 0);
    });
    return null;
}