import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Cybertruck3D = ({ isMoving, lightsOn }: { isMoving: boolean; lightsOn: boolean }) => {
  const { scene } = useGLTF("/models/cybertruck.glb");
  const truckRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    const wheels: THREE.Object3D[] = [];
    
    scene.traverse((child) => {
      const name = child.name.toLowerCase();
      
      // Target specific meshes for wheels to avoid rotating parent groups that might cause flying
      if (name.includes("wheel") || name.includes("tire") || name.includes("rim") || 
          ["object_8", "object_9", "object_10", "object_11"].includes(name)) {
        if (child instanceof THREE.Mesh) {
          wheels.push(child);
        }
      }

      // Handle lights
      if (name.includes("light") || name.includes("lamp") || name.includes("headlight") || name.includes("tail") || name === "object_5") {
        if (child instanceof THREE.Mesh && child.material) {
           const material = (child.material as THREE.MeshStandardMaterial).clone();
           child.material = material;
           material.emissiveIntensity = lightsOn ? 10 : 0;
           material.emissive = new THREE.Color(name.includes("tail") ? 0xff0000 : 0xffffff);
           if (name.includes("head") || name === "object_5") {
             material.color = new THREE.Color(lightsOn ? 0xffffff : 0x333333);
           }
        }
      }
    });

    wheelsRef.current = wheels;
  }, [scene, lightsOn]);

  useFrame((state, delta) => {
    if (isMoving && wheelsRef.current.length > 0) {
      wheelsRef.current.forEach((wheel) => {
        // Rotate the mesh around its local X axis. 
        // We use .rotation directly to be more predictable than .rotateX()
        wheel.rotation.x += delta * 12;
      });
    }
    
    // Static position with slight hover to avoid detachment issues
    if (truckRef.current) {
        // truckRef.current.rotation.y += delta * 0.05; // Stopped orbit for stability
        truckRef.current.position.y = -0.2;
    }
  });

  return (
    <primitive
      ref={truckRef}
      object={scene}
      scale={0.7}
      position={[0, -0.2, 0]}
    />
  );
};
