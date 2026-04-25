import { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Cybertruck3D = ({ isMoving, lightsOn }: { isMoving: boolean; lightsOn: boolean }) => {
  const { scene } = useGLTF("/models/cybertruck.glb");
  const truckRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    const wheels: THREE.Object3D[] = [];
    const wheelKeywords = ["wheel", "tire", "rim", "object_8", "object_9", "object_10", "object_11"]; // Guessed based on typical structure
    
    scene.traverse((child) => {
      const name = child.name.toLowerCase();
      
      // Heuristic for finding wheels in generic models
      // 1. Name match
      if (name.includes("wheel") || name.includes("tire") || name.includes("rim")) {
        wheels.push(child);
      }
      // 2. Specific objects if it's a known Sketchfab Cybertruck model
      // Object_8, 9, 10, 11 are common for wheels in these models
      else if (["object_8", "object_9", "object_10", "object_11"].includes(name)) {
        wheels.push(child);
      }

      // Setup lights
      if (name.includes("light") || name.includes("lamp") || name.includes("headlight") || name.includes("tail") || name === "object_5") {
        if (child instanceof THREE.Mesh && child.material) {
           const material = (child.material as THREE.MeshStandardMaterial).clone();
           child.material = material;
           material.emissiveIntensity = lightsOn ? 5 : 0;
           material.emissive = new THREE.Color(name.includes("tail") ? 0xff0000 : 0xffffff);
        }
      }
    });
    
    wheelsRef.current = wheels;
    console.log("Mapped wheels:", wheels.map(w => w.name));
  }, [scene, lightsOn]);

  useFrame((state, delta) => {
    if (isMoving && wheelsRef.current.length > 0) {
      wheelsRef.current.forEach((wheel) => {
        // Most GLB models have wheels rotated around X or Z
        wheel.rotateX(delta * 12);
      });
    }
    
    // Floating animation
    if (truckRef.current) {
        truckRef.current.position.y = -0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
        // Slow rotation even when parked
        truckRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <primitive
      ref={truckRef}
      object={scene}
      scale={0.8}
      position={[0, -0.15, 0]}
    />
  );
};
