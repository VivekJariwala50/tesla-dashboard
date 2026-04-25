import React, { useState, useEffect, useCallback, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { Battery, Fan, Music, Lock, MapPin, Zap, Menu, Lightbulb, Shield, Settings, Volume2 } from "lucide-react";
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
  sentryMode: boolean;
  gear: Gear;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

// --- UI Components ---

const ResponsiveCamera = React.memo(() => {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.far = size.width < 768 ? 55 : 45;
    camera.updateProjectionMatrix();
  }, [size, camera]);
  return null;
});

const ControlButton = React.memo(
  ({ icon, label, active = false, onClick }: ControlButtonProps) => (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-1 active:scale-95 cursor-pointer group"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
        ${
          active ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-widest">{label}</span>
    </div>
  )
);

const DockItem = React.memo(
  ({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) => (
    <div
      className={`p-3 rounded-xl transition-all cursor-pointer ${
        active ? "bg-gray-900 text-blue-500" : "text-gray-400 hover:text-white"
      }`}
    >
      <span className="block md:hidden">
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
    sentryMode: false,
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
  const toggleSentry = useCallback(
    () => setCarState((p) => ({ ...p, sentryMode: !p.sentryMode })),
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
          speed = Math.min(speed + 1.2, 65);
          if (Math.random() > 0.98) range = Math.max(0, range - 1);
        } else if (prev.gear === "R") {
          speed = Math.min(speed + 0.5, 15);
        } else {
          speed = Math.max(speed - 2, 0);
        }
        return { ...prev, speed, range };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const speedDisplay = Math.floor(carState.speed);
  const gears: Gear[] = ["P", "R", "N", "D"];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-black text-white overflow-hidden font-sans">
      {/* Left Column - 3D & Main Controls */}
      <div className="w-full min-h-[45vh] md:w-1/3 md:h-screen border-b md:border-r border-gray-800/50 flex flex-col bg-gradient-to-b from-black to-[#050505]">
        {/* Status Bar */}
        <div className="p-6 flex justify-between text-sm text-gray-400 font-medium">
          <div className="flex gap-3 items-center">
            <Lock
              size={16}
              className={carState.isLocked ? "text-white" : "text-gray-600"}
            />
            <span className="tracking-tighter">12:42 PM</span>
          </div>
          <div className="flex gap-3 items-center">
            <span className="font-bold text-white">{carState.range} mi</span>
            <Battery size={20} className={carState.batteryLevel < 20 ? "text-red-500" : "text-green-500"} />
          </div>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing">
          <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
            <ResponsiveCamera />
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            <Cybertruck3D
              isMoving={carState.speed > 0}
              lightsOn={carState.lightsOn}
            />

            <ContactShadows opacity={0.6} blur={2.5} scale={20} far={10} />
            <Environment preset="night" />
            <OrbitControls 
                enableZoom={false} 
                maxPolarAngle={Math.PI / 1.8} 
                minPolarAngle={Math.PI / 3}
                enablePan={false}
            />
          </Canvas>

          {/* Speed Mobile Overlay */}
          <div className="absolute bottom-6 left-6 md:hidden">
            <div className="text-6xl font-thin tracking-tighter">{speedDisplay}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">MPH</div>
          </div>
        </div>

        {/* Quick Actions Control Grid */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-black/40 backdrop-blur-xl border-t border-gray-800/30">
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
            label="Sentry"
            active={carState.sentryMode}
            icon={<Shield size={20} className={carState.sentryMode ? "text-red-500" : ""} />}
            onClick={toggleSentry}
          />
          <ControlButton
            label="Lights"
            active={carState.lightsOn}
            icon={<Lightbulb size={20} />}
            onClick={toggleLights}
          />
        </div>
      </div>

      {/* Right Column - Navigation & Media */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-y-auto">
        <div className="flex-1 m-4 md:m-6 rounded-[2.5rem] bg-[#111] relative overflow-hidden group border border-white/5 shadow-2xl">
          {/* Animated Map Background Simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent"></div>
          
          {/* Map Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}></div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-500">
              <MapPin size={48} className="text-blue-500 animate-bounce" />
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-tight">
              Navigate to HQ
            </h2>
            <p className="text-gray-400 mt-4 text-xl font-light max-w-sm">
              3500 Deer Creek Rd, Palo Alto, CA
            </p>
            <div className="mt-10 flex gap-6">
              <button className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-base font-semibold transition-all shadow-lg shadow-blue-900/40 active:scale-95">
                Start Route
              </button>
              <button className="px-10 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full text-base font-semibold transition-all border border-white/10 active:scale-95">
                Overview
              </button>
            </div>
          </div>

          {/* Desktop Speed Overlay */}
          <div className="hidden md:block absolute top-12 left-12 z-20">
            <div className="flex items-baseline gap-3">
              <div className="text-[140px] leading-none font-thin text-white tracking-tighter">
                {speedDisplay}
              </div>
              <div className="text-4xl text-gray-500 font-light tracking-widest uppercase">MPH</div>
            </div>
            <div className="flex items-center gap-3 mt-4">
               <div className={`w-3 h-3 rounded-full ${carState.gear === 'P' ? 'bg-red-500/50' : 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
               <div className="text-gray-400 uppercase tracking-[0.4em] text-sm font-bold">
                 {carState.gear === "P" ? "Parked" : carState.gear === "D" ? "Autopilot Active" : "Driving"}
               </div>
            </div>
          </div>

          {/* Bottom Right Floating Widgets */}
          <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-4">
             <div className="w-14 h-14 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 cursor-pointer transition-all shadow-xl active:scale-90">
                <Shield size={24} />
             </div>
             <div className="w-14 h-14 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 cursor-pointer transition-all shadow-xl active:scale-90">
                <Settings size={24} />
             </div>
          </div>
        </div>

        {/* Bottom Dock / Navigation Bar */}
        <div className="h-24 md:h-28 bg-black border-t border-gray-800/40 px-6 md:px-12 flex justify-between items-center pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex gap-6 items-center">
            <DockItem icon={<Menu />} />
            <DockItem icon={<Music />} active />
            <div className="h-8 w-[1px] bg-gray-800 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-4 bg-gray-900/80 rounded-2xl px-5 py-3 border border-white/5">
              <span className="font-bold text-lg">
                {carState.climateOn ? "68°" : "--"}
              </span>
              <Fan
                size={18}
                className={
                  carState.climateOn
                    ? "animate-spin text-blue-500"
                    : "text-gray-500"
                }
              />
            </div>
            <DockItem icon={<Volume2 />} />
          </div>
          
          {/* Gear Selector */}
          <div className="flex bg-gray-900/50 p-1.5 rounded-full border border-white/5 shadow-inner">
            {gears.map((g) => (
              <button
                key={g}
                onClick={() => setGear(g)}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full font-bold transition-all duration-300
                  ${
                    carState.gear === g
                      ? "bg-white text-black shadow-xl scale-110"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
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
