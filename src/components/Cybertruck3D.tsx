import { useGLTF } from "@react-three/drei";

export const Cybertruck3D = ({ isMoving }: any) => {
  const { scene } = useGLTF("/models/cybertruck.glb");

  return (
    <primitive
      object={scene}
      scale={0.75}
      position={[0, -0.2, 0]}
      rotation={[0, isMoving ? 0.01 : 0, 0]}
    />
  );
};
