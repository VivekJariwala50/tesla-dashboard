import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Cybertruck3D = ({ isMoving }: { isMoving: boolean }) => {
  const { scene } = useGLTF("/models/cybertruck.glb");
  const truckRef = useRef<THREE.Primitive>(null);


  useFrame((state, delta) => {
    if (isMoving && truckRef.current) {
      truckRef.current.rotation.y += delta * 0.5; 
    }
  });

  return (
    <primitive
      ref={truckRef}
      object={scene}
      scale={0.75}
      position={[0, -0.2, 0]}
    />
  );
};
