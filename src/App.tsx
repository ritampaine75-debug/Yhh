import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  Timer,
  RotateCcw,
  BookOpen,
  Gamepad2,
  Dumbbell
} from 'lucide-react';

const TIMEZONE = 'Asia/Kolkata';

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000', // Forest
  'https://images.unsplash.com/photo-1514565131-fce0801e0577?auto=format&fit=crop&q=80&w=2000', // Night City
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000', // Calm Sea
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=2000', // Stars/Space
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000', // Mountains
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=2000', // Minimal Dark Dust
];

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [brightness, setBrightness] = useState(0.7);
  const [isUltraDark, setIsUltraDark] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Timer State
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [timerLabel, setTimerLabel] = useState<string>('');
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Auto-Rotation (Every 5 minutes)
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % BACKGROUNDS.length);
    }, 5 * 60 * 1000);
    return () => clearInterval(bgTimer);
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    if (timerLeft === null || timerLeft <= 0) return;
    const interval = setInterval(() => {
      setTimerLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerLeft]);

  // Keyboard Support for TV Remote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setShowControls(true);
      
      // Auto-move background on arrows if no settings open
      if (!showTimerSettings) {
        if (e.key === 'ArrowRight') setBgIndex(prev => (prev + 1) % BACKGROUNDS.length);
        if (e.key === 'ArrowLeft') setBgIndex(prev => (prev - 1 + BACKGROUNDS.length) % BACKGROUNDS.length);
      }
      
      // Global shortcuts
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 't') setShowTimerSettings(prev => !prev);
      if (e.key === 'Escape') {
        setShowTimerSettings(false);
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTimerSettings]);

  // Fullscreen helper
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const startTimer = (seconds: number, label: string) => {
    setTimerLeft(seconds);
    setTimerLabel(label);
    setShowTimerSettings(false);
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Time & Date formatters
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: TIMEZONE
  }).format(time);
  const [timePieces, ampm] = formattedTime.split(' ');
  
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: TIMEZONE
  }).format(time);

  return (
    <div 
      onMouseMove={() => setShowControls(true)}
      className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
          opacity: isUltraDark ? 0.2 : 1 
        }}
      >
        <div 
          className="absolute inset-0 bg-black transition-all duration-500" 
          style={{ opacity: 1 - brightness }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
      </div>

      {/* Main Clock UI */}
      <main className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${isUltraDark ? 'scale-75 opacity-30 grayscale' : 'scale-100 opacity-100'}`}>
        <div className="mb-8 flex items-center gap-3 px-6 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-md">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span className="text-white/80 text-xl font-bold tracking-[0.4em] uppercase">Kolkata Time</span>
        </div>

        <div className="flex items-baseline justify-center gap-6">
          <h1 className="text-[22vw] font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            {timePieces}
          </h1>
          <div className="flex flex-col items-start pb-[4vw]">
            <span className="text-[6vw] font-black text-emerald-500 uppercase tracking-widest drop-shadow-lg">
              {ampm}
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6 text-white/60">
          <Calendar className="w-10 h-10 opacity-70" />
          <span className="text-[4vw] font-medium tracking-[0.2em] uppercase">
            {dateStr}
          </span>
        </div>

        {/* Active Timer Display */}
        {timerLeft !== null && (
          <div className="mt-12 scale-110">
            <div className={`px-12 py-8 rounded-[3rem] backdrop-blur-2xl border-4 transition-all ${timerLeft === 0 ? 'bg-red-500/30 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-black/40 border-white/20'}`}>
              <div className="flex items-center gap-3 mb-2 justify-center">
                <Timer size={24} className="text-emerald-400" />
                <span className="text-sm font-black text-white/50 uppercase tracking-[0.5em]">{timerLabel}</span>
              </div>
              <span className="text-8xl font-black tabular-nums tracking-tight">{formatTimer(timerLeft)}</span>
              {timerLeft === 0 && <span className="mt-4 block text-red-400 text-xl font-black animate-bounce tracking-widest uppercase">Finished!</span>}
            </div>
            <button 
              onClick={() => setTimerLeft(null)}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 transition-all font-bold uppercase text-xs tracking-widest"
            >
              <RotateCcw size={16} />
              Reset Timer
            </button>
          </div>
        )}
      </main>

      {/* TV Controls Bar (Focusable) */}
      <div className={`absolute inset-x-0 bottom-0 p-16 transition-all duration-700 flex flex-col items-center gap-10 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-40 opacity-0'}`}>
        
        {/* TV-Safe Brightness Control */}
        <div className="w-full max-w-4xl flex items-center gap-8 bg-black/60 border border-white/20 p-6 rounded-[2rem] backdrop-blur-xl group focus-within:ring-8 focus-within:ring-emerald-500/50 transition-all">
          <Sun size={28} className="text-emerald-400" />
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" 
              style={{ width: `${brightness * 100}%` }}
            />
          </div>
          <div className="flex gap-4">
             <button title="Lower Brightness" onClick={() => setBrightness(prev => Math.max(prev - 0.1, 0.1))} className="p-4 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 focus:ring-8 focus:ring-emerald-400 focus:outline-none transition-all uppercase font-black text-xs">DIM</button>
             <button title="Raise Brightness" onClick={() => setBrightness(prev => Math.min(prev + 0.1, 1))} className="p-4 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 focus:ring-8 focus:ring-emerald-400 focus:outline-none transition-all uppercase font-black text-xs">BRIGHT</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowTimerSettings(true)}
            className="px-10 py-6 rounded-[2rem] bg-black/60 border border-white/10 text-white/50 focus:ring-8 focus:ring-blue-500 focus:text-white focus:bg-blue-600 focus:scale-110 focus:outline-none transition-all flex items-center gap-4"
          >
            <Timer size={32} />
            <span className="text-xl font-black uppercase tracking-widest">Timers</span>
          </button>

          <button 
            onClick={() => setIsUltraDark(!isUltraDark)}
            className={`px-10 py-6 rounded-[2rem] border transition-all focus:ring-8 focus:ring-purple-500 focus:scale-110 focus:outline-none flex items-center gap-4 ${isUltraDark ? 'bg-purple-600 border-purple-500 text-white' : 'bg-black/60 border-white/10 text-white/50'}`}
          >
            <Moon size={32} />
            <span className="text-xl font-black uppercase tracking-widest">Dark Mode</span>
          </button>

          <button 
             onClick={toggleFullscreen}
             className="p-6 rounded-[2rem] bg-black/60 border border-white/10 text-white/50 focus:ring-8 focus:ring-white focus:text-white focus:scale-110 focus:outline-none transition-all"
          >
            {isFullscreen ? <Minimize2 size={32} /> : <Maximize2 size={32} />}
          </button>
        </div>
      </div>

      {/* Full-Screen Activity Select (TV Friendly) */}
      {showTimerSettings && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-20 animate-in fade-in duration-300">
           <div className="max-w-7xl w-full flex flex-col gap-16">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-7xl font-black tracking-tighter uppercase italic">Select Activity</h2>
                <button 
                  autoFocus
                  onClick={() => setShowTimerSettings(false)}
                  className="px-10 py-6 rounded-3xl bg-white/5 text-white/40 focus:ring-8 focus:ring-red-500 focus:bg-red-600 focus:text-white focus:outline-none transition-all font-black text-2xl uppercase tracking-widest"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 'study', label: 'Study Session', icon: BookOpen, time: 45 },
                  { id: 'play', label: 'Play Session', icon: Gamepad2, time: 30 },
                  { id: 'exercise', label: 'Quick Workout', icon: Dumbbell, time: 20 },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => startTimer(act.time * 60, act.label)}
                    className="group relative h-[30rem] rounded-[4rem] bg-white/5 border border-white/10 p-12 flex flex-col items-center justify-center gap-10 transition-all hover:bg-white/10 focus:ring-12 focus:ring-emerald-500 focus:scale-105 focus:outline-none"
                  >
                    <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center group-focus:bg-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                      <act.icon size={64} className="text-white/20 group-focus:text-emerald-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-black mb-4 uppercase tracking-tight">{act.label}</div>
                      <div className="text-3xl font-bold text-white/30 tracking-widest uppercase">{act.time} Mins</div>
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Screen Edge Hint */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 font-black uppercase tracking-[1em] text-xs animate-pulse">
           Remote Navigation Mode Active
        </div>
      )}
    </div>
  );
}
