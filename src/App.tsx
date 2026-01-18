import React, { useState, useEffect, useCallback, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import { Battery, Fan, Music, Lock, MapPin, Zap, Menu } from "lucide-react";
import * as THREE from "three";

// --- Types ---
type Gear = "P" | "R" | "N" | "D";

interface CarState {
  speed: number;
  batteryLevel: number;
  range: number;
  isLocked: boolean;
  climateOn: boolean;
  frunkOpen: boolean;
  gear: Gear;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

// --- 3D Components ---

// 1. Optimized Cybertruck Component
const Cybertruck3D = ({
  isMoving,
  openFrunk,
}: {
  isMoving: boolean;
  openFrunk: boolean;
}) => {
  const { scene } = useGLTF("/models/cybertruck.glb");
  const truckRef = useRef<THREE.Group>(null);

  // Animation Loop (Runs outside React render cycle)
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

// 2. Responsive Camera
const ResponsiveCamera = React.memo(() => {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.far = size.width < 768 ? 55 : 45;
    camera.updateProjectionMatrix();
  }, [size, camera]);
  return null;
});

// --- UI Components ---

const ControlButton = React.memo(
  ({ icon, label, active = false, onClick }: ControlButtonProps) => (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
        ${
          active ? "bg-white text-black shadow-lg" : "bg-gray-800 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  )
);

const DockItem = React.memo(
  ({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) => (
    <div
      className={`p-3 rounded-xl transition-colors ${
        active ? "bg-gray-900 text-blue-500" : "text-gray-400"
      }`}
    >
      <span className="block md:hidden">
        {/* Type assertion to fix TypeScript error on cloneElement */}
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 })
          : icon}
      </span>
      <span className="hidden md:block">
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 })
          : icon}
      </span>
    </div>
  )
);

// --- Main Application ---

export default function CybertruckDashboard() {
  const [carState, setCarState] = useState<CarState>({
    speed: 0,
    batteryLevel: 82,
    range: 290,
    isLocked: true,
    climateOn: false,
    frunkOpen: false,
    gear: "P",
  });

  // Handlers
  const toggleLocked = useCallback(
    () => setCarState((p) => ({ ...p, isLocked: !p.isLocked })),
    []
  );
  const toggleClimate = useCallback(
    () => setCarState((p) => ({ ...p, climateOn: !p.climateOn })),
    []
  );
  const toggleFrunk = useCallback(
    () => setCarState((p) => ({ ...p, frunkOpen: !p.frunkOpen })),
    []
  );
  const setGear = useCallback(
    (gear: Gear) => setCarState((p) => ({ ...p, gear })),
    []
  );

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCarState((prev) => {
        let { speed, range } = prev;
        if (prev.gear === "D") {
          speed = Math.min(speed + 1, 65);
          if (Math.random() > 0.98) range = Math.max(0, range - 1);
        } else if (prev.gear === "P") {
          speed = Math.max(speed - 2, 0);
        }
        return { ...prev, speed, range };
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const speedDisplay = Math.floor(carState.speed);
  const gears: Gear[] = ["P", "R", "N", "D"];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Left Column */}
      <div className="w-full min-h-[40vh] md:w-1/3 md:h-screen border-b md:border-r border-gray-800 flex flex-col">
        {/* Status Bar */}
        <div className="p-4 flex justify-between text-xs text-gray-400">
          <div className="flex gap-2 items-center">
            <Lock
              size={14}
              className={carState.isLocked ? "text-white" : "hidden"}
            />
            <span>12:42 PM</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold">{carState.range} mi</span>
            <Battery size={16} />
          </div>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Canvas dpr={[1, 1.5]} gl={{ antialias: false }}>
            <ResponsiveCamera />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={1} />

            <Cybertruck3D
              isMoving={carState.speed > 0}
              openFrunk={carState.frunkOpen}
            />

            <ContactShadows opacity={0.5} blur={2} scale={15} />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
          </Canvas>

          <div className="absolute bottom-4 left-4 md:hidden">
            <div className="text-5xl font-light">{speedDisplay}</div>
            <div className="text-xs text-gray-500 uppercase">MPH</div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-black/60 backdrop-blur">
          <ControlButton
            label="Lock"
            active={carState.isLocked}
            icon={<Lock size={20} />}
            onClick={toggleLocked}
          />
          <ControlButton
            label="Climate"
            active={carState.climateOn}
            icon={
              <Fan
                size={20}
                className={carState.climateOn ? "animate-spin" : ""}
              />
            }
            onClick={toggleClimate}
          />
          <ControlButton
            label="Charge"
            icon={<Zap size={20} />}
            onClick={() => {}}
          />
          <ControlButton
            label="Frunk"
            active={carState.frunkOpen}
            icon={<span className="text-xs font-bold">Frunk</span>}
            onClick={toggleFrunk}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col bg-[#121212] overflow-y-auto">
        <div className="flex-1 m-3 md:m-5 rounded-2xl bg-[#1a1a1a] relative flex items-center justify-center">
          <div className="text-center px-6">
            <MapPin size={36} className="mx-auto text-blue-500 mb-3" />
            <h2 className="text-xl md:text-3xl font-light text-gray-200">
              Navigate to HQ
            </h2>
            <p className="text-gray-500 mt-2">3500 Deer Creek Rd, Palo Alto</p>
          </div>
          <div className="hidden md:block absolute top-8 left-8">
            <div className="text-8xl font-light">
              {speedDisplay}
              <span className="text-2xl ml-2 text-gray-500">MPH</span>
            </div>
            <div className="text-gray-500 uppercase tracking-widest text-sm">
              {carState.gear === "P" ? "Parked" : "Driving"}
            </div>
          </div>
        </div>

        {/* Dock */}
        <div className="h-20 md:h-24 bg-black border-t border-gray-800 px-4 md:px-10 flex justify-between items-center pb-safe">
          <div className="flex gap-4">
            <DockItem icon={<Menu />} />
            <DockItem icon={<Music />} active />
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <span className="font-bold">
                {carState.climateOn ? "68°" : "--"}
              </span>
              <Fan
                size={14}
                className={
                  carState.climateOn
                    ? "animate-spin text-blue-500"
                    : "text-gray-500"
                }
              />
            </div>
          </div>
          <div className="flex bg-gray-900 p-1 rounded-full">
            {gears.map((g) => (
              <button
                key={g}
                onClick={() => setGear(g)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-bold transition-colors
                  ${
                    carState.gear === g
                      ? "bg-white text-black"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
