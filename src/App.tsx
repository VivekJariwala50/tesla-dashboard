import React, { useState, useEffect, useCallback, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import { Battery, Fan, Music, Lock, MapPin, Zap, Menu, Lightbulb, Shield, Settings } from "lucide-react";
import * as THREE from "three";
import { Cybertruck3D } from "./components/Cybertruck3D";

// --- Types ---
type Gear = "P" | "R" | "N" | "D";

interface CarState {
  speed: number;
  batteryLevel: number;
  range: number;
  isLocked: boolean;
  climateOn: boolean;
  frunkOpen: boolean;
  lightsOn: boolean;
  gear: Gear;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

// --- 3D Components ---

// Responsive Camera
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
    lightsOn: false,
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
  const toggleLights = useCallback(
    () => setCarState((p) => ({ ...p, lightsOn: !p.lightsOn })),
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
              lightsOn={carState.lightsOn}
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
            label="Lights"
            active={carState.lightsOn}
            icon={<Lightbulb size={20} />}
            onClick={toggleLights}
          />
          <ControlButton
            label="Frunk"
            active={carState.frunkOpen}
            icon={<span className="text-xs font-bold uppercase tracking-tighter">Frunk</span>}
            onClick={toggleFrunk}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col bg-[#121212] overflow-y-auto">
        <div className="flex-1 m-3 md:m-5 rounded-3xl bg-[#1a1a1a] relative overflow-hidden group">
          {/* Animated Map Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/10 opacity-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent"></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <MapPin size={40} className="text-blue-500 animate-bounce" />
            </div>
            <h2 className="text-2xl md:text-4xl font-light text-white tracking-tight">
              Navigate to HQ
            </h2>
            <p className="text-gray-400 mt-3 text-lg font-light max-w-xs">
              3500 Deer Creek Rd, Palo Alto, CA
            </p>
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                Start Route
              </button>
              <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-sm font-medium transition-all active:scale-95">
                Overview
              </button>
            </div>
          </div>

          {/* Speed Overlay */}
          <div className="hidden md:block absolute top-10 left-10 z-20">
            <div className="flex items-baseline gap-2">
              <div className="text-[120px] leading-none font-thin text-white tracking-tighter">
                {speedDisplay}
              </div>
              <div className="text-3xl text-gray-500 font-light tracking-widest">MPH</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <div className={`w-2 h-2 rounded-full ${carState.gear === 'P' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
               <div className="text-gray-400 uppercase tracking-[0.3em] text-xs font-bold">
                 {carState.gear === "P" ? "Parked" : carState.gear === "D" ? "Autopilot Active" : "Driving"}
               </div>
            </div>
          </div>

          {/* Bottom Right Widgets */}
          <div className="absolute bottom-8 right-8 z-20 flex gap-3">
             <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors">
                <Shield size={20} />
             </div>
             <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors">
                <Settings size={20} />
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
