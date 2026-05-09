import React, { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, MapPin, Calendar } from 'lucide-react';

const TIMEZONE = 'Asia/Kolkata';

// Curated high-performance nature backgrounds
const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2048', // Forest
  'https://images.unsplash.com/photo-1534067783941-51c9c238bd73?auto=format&fit=crop&q=80&w=2048', // Peaks
  'https://images.unsplash.com/photo-1506318137071-a8e063b4bcc0?auto=format&fit=crop&q=80&w=2048', // Dark Space
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2048', // Horizon
];

export default function App() {
  const [time, setTime] = useState(new Date());
  const [bgIndex, setBgIndex] = useState(0);
  const [brightness, setBrightness] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });

  // Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Burn-in Protection (Subtle float every 15s for TV safety)
  useEffect(() => {
    const driftInterval = setInterval(() => {
      setDrift({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10
      });
    }, 15000);
    return () => clearInterval(driftInterval);
  }, []);

  // TV Remote & Keyboard Support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setBgIndex(p => (p + 1) % BACKGROUNDS.length);
      if (e.key === 'ArrowLeft') setBgIndex(p => (p - 1 + BACKGROUNDS.length) % BACKGROUNDS.length);
      if (e.key === 'ArrowUp') setBrightness(p => Math.min(p + 0.05, 1));
      if (e.key === 'ArrowDown') setBrightness(p => Math.max(p - 0.05, 0.1));
      if (e.key === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Time & Date formatting
  const formatted = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: TIMEZONE
  }).format(time);
  const [timePieces, ampm] = formatted.split(' ');
  
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: TIMEZONE
  }).format(time);

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Background layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out scale-105"
        style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
      >
        <div className="absolute inset-0 bg-black transition-opacity duration-700" style={{ opacity: 1 - brightness }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Main content (Drifting for Burn-in protection) */}
      <main 
        className="relative z-10 flex flex-col items-center text-center px-6 transition-transform duration-[10s] ease-in-out"
        style={{ transform: `translate(${drift.x}px, ${drift.y}px)` }}
      >
        <div className="mb-[2vh] flex items-center gap-2 opacity-50 bg-black/20 px-4 py-1 rounded-full border border-white/5 backdrop-blur-sm">
          <MapPin size={16} className="text-emerald-500" />
          <span className="text-[3vw] sm:text-[1vw] font-black tracking-[0.5em] uppercase">KOLKATA</span>
        </div>

        <div className="flex items-baseline justify-center gap-2 sm:gap-6">
          <h1 className="text-[25vw] sm:text-[22vw] font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_15px_45px_rgba(0,0,0,0.9)]">
            {timePieces}
          </h1>
          <div className="pb-[4vw]">
            <span className="text-[6vw] sm:text-[5vw] font-black text-emerald-500 uppercase tracking-tighter drop-shadow-lg">
              {ampm}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-white/50">
          <Calendar size={24} className="opacity-40 sm:w-8 sm:h-8" />
          <span className="text-[5vw] sm:text-[3vw] lg:text-[2.2vw] font-medium tracking-[0.2em] uppercase drop-shadow-sm">
            {dateStr}
          </span>
        </div>
      </main>

      {/* Fullscreen control */}
      <div className="absolute bottom-10 right-10 flex items-center gap-4 opacity-20 hover:opacity-100 transition-opacity">
        <button 
          onClick={toggleFullscreen}
          className="p-5 rounded-3xl bg-black/40 border border-white/10 hover:bg-white/10 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-emerald-500"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={32} /> : <Maximize2 size={32} />}
        </button>
      </div>

      {/* Subtle Hint for TV users */}
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none hidden sm:block">
        <div className="text-[10px] font-black tracking-[1em] uppercase">Remote Navigation Active</div>
      </div>
    </div>
  );
}
