import React, { useState, useEffect, useCallback } from 'react';
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
  Dumbbell,
  Settings,
  Volume2,
  Bell,
  Zap,
  VolumeX
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

  const [is24Hour, setIs24Hour] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [accentColor, setAccentColor] = useState('emerald');
  const [tickSound, setTickSound] = useState(false);
  const [minuteSound, setMinuteSound] = useState(false);
  const [showDate, setShowDate] = useState(true);
  const [clockScale, setClockScale] = useState(1);
  const [showMasterSettings, setShowMasterSettings] = useState(false);
  const [isBurnInProtection, setIsBurnInProtection] = useState(true);

  // Audio Engine for TV
  const playSound = useCallback((frequency: number, duration: number, volume: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(volume * 0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
      setTimeout(() => audioCtx.close(), duration * 1000 + 100);
    } catch (e) {
      console.error("Audio not supported or blocked");
    }
  }, []);

  // Clock & Sound Update
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setTime(now);

      // Sound logic
      if (tickSound) {
        playSound(800, 0.05, 0.2);
      }
      if (minuteSound && now.getSeconds() === 0) {
        playSound(1200, 0.2, 0.5);
      }
    }, 1000);
    return () => clearInterval(clockTimer);
  }, [tickSound, minuteSound, playSound]);

  // Keyboard Support for TV Remote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setShowControls(true);
      
      if (!showTimerSettings && !showMasterSettings) {
        if (e.key === 'ArrowRight') setBgIndex(prev => (prev + 1) % BACKGROUNDS.length);
        if (e.key === 'ArrowLeft') setBgIndex(prev => (prev - 1 + BACKGROUNDS.length) % BACKGROUNDS.length);
      }
      
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'm') setShowMasterSettings(prev => !prev);
      if (e.key === 't') setShowTimerSettings(prev => !prev);
      if (e.key === 's') setTickSound(prev => !prev);
      if (e.key === 'Escape') {
        setShowTimerSettings(false);
        setShowMasterSettings(false);
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTimerSettings, showMasterSettings]);

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
    if (minuteSound) playSound(1000, 0.3, 0.5);
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Time & Date formatters
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit', 
    minute: '2-digit', 
    second: showSeconds ? '2-digit' : undefined,
    hour12: !is24Hour, 
    timeZone: TIMEZONE
  };
  const formattedTime = new Intl.DateTimeFormat('en-US', options).format(time);
  const timePieces = is24Hour ? formattedTime : formattedTime.split(' ')[0];
  const ampm = is24Hour ? '' : formattedTime.split(' ')[1];
  
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: TIMEZONE
  }).format(time);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    ruby: 'text-red-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
  };

  const glowMap: Record<string, string> = {
    emerald: 'drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    ruby: 'drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]',
    blue: 'drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    amber: 'drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]',
  };

  // Burn-in Protection Logic (Subtle movement every 10s)
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!isBurnInProtection) {
      setDrift({ x: 0, y: 0 });
      return;
    }
    const interval = setInterval(() => {
      setDrift({ 
        x: (Math.random() - 0.5) * 8, 
        y: (Math.random() - 0.5) * 8 
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [isBurnInProtection]);

  return (
    <div 
      onMouseMove={() => setShowControls(true)}
      className={`relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans select-none transition-all duration-700 ${isGrayscale ? 'grayscale' : ''}`}
    >
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
          opacity: isUltraDark ? 0.15 : (isGrayscale ? 0.3 : 1),
          filter: isGrayscale ? 'contrast(1.2) brightness(0.8)' : 'none'
        }}
      >
        <div 
          className="absolute inset-0 bg-black transition-all duration-500" 
          style={{ opacity: 1 - brightness }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
      </div>

      {/* Main Clock UI */}
      <main 
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ${isUltraDark ? 'scale-75 opacity-30 blur-[2px]' : ''}`}
        style={{ 
          transform: `scale(${clockScale * (isUltraDark ? 0.75 : 1)}) translate(${drift.x}px, ${drift.y}px)`,
          transition: 'transform 10s ease-in-out'
        }}
      >
        <div className="mb-8 flex items-center gap-3 px-6 py-2 rounded-full bg-black/50 border border-white/20 backdrop-blur-md">
          <MapPin className={`w-5 h-5 ${colorMap[accentColor]}`} />
          <span className="text-white/80 text-xl font-bold tracking-[0.4em] uppercase">{getGreeting()}</span>
        </div>

        <div className="flex items-baseline justify-center gap-6">
          <h1 className={`text-[22vw] font-black leading-none tracking-tighter tabular-nums ${glowMap[accentColor]}`}>
            {timePieces}
          </h1>
          {!is24Hour && (
            <div className="flex flex-col items-start pb-[4vw]">
              <span className={`text-[6vw] font-black ${colorMap[accentColor]} uppercase tracking-widest drop-shadow-lg`}>
                {ampm}
              </span>
            </div>
          )}
        </div>

        {showDate && (
          <div className="mt-8 flex items-center gap-6 text-white/60">
            <Calendar className="w-10 h-10 opacity-70" />
            <span className="text-[4vw] font-medium tracking-[0.2em] uppercase">
              {dateStr}
            </span>
          </div>
        )}

        {/* Active Timer Display */}
        {timerLeft !== null && (
          <div className="mt-12 scale-110">
            <div className={`px-12 py-8 rounded-[3rem] backdrop-blur-2xl border-4 transition-all ${timerLeft === 0 ? 'bg-red-500/30 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-black/40 border-white/20'}`}>
              <div className="flex items-center gap-3 mb-2 justify-center">
                <Timer size={24} className={colorMap[accentColor]} />
                <span className="text-sm font-black text-white/50 uppercase tracking-[0.5em]">{timerLabel}</span>
              </div>
              <span className="text-8xl font-black tabular-nums tracking-tight">{formatTimer(timerLeft)}</span>
              {timerLeft === 0 && <span className="mt-4 block text-red-400 text-xl font-black animate-bounce tracking-widest uppercase">Finished!</span>}
            </div>
          </div>
        )}
      </main>

      {/* TV Controls Bar (Focusable) */}
      <div className={`absolute inset-x-0 bottom-0 p-16 transition-all duration-700 flex flex-col items-center gap-10 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-40 opacity-0'}`}>
        
        {/* TV-Safe Brightness Control */}
        <div className="w-full max-w-4xl flex items-center gap-8 bg-black/60 border border-white/20 p-6 rounded-[2rem] backdrop-blur-xl group focus-within:ring-8 focus-within:ring-white/20 transition-all">
          <Sun size={28} className={colorMap[accentColor]} />
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full opacity-80`} 
              style={{ width: `${brightness * 100}%`, backgroundColor: colorMap[accentColor].replace('text-', '') }}
            />
          </div>
          <div className="flex gap-4">
             <button title="Lower Brightness" onClick={() => setBrightness(prev => Math.max(prev - 0.1, 0.1))} className="p-4 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 focus:ring-8 focus:ring-white focus:outline-none transition-all uppercase font-black text-xs">DIM</button>
             <button title="Raise Brightness" onClick={() => setBrightness(prev => Math.min(prev + 0.1, 1))} className="p-4 rounded-xl bg-white/5 hover:bg-white/20 border border-white/10 focus:ring-8 focus:ring-white focus:outline-none transition-all uppercase font-black text-xs">BRIGHT</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowTimerSettings(true)}
            className="px-8 py-5 rounded-[2rem] bg-black/60 border border-white/10 text-white/50 focus:ring-8 focus:ring-blue-500 focus:text-white focus:bg-blue-600 focus:scale-110 focus:outline-none transition-all flex items-center gap-4"
          >
            <Timer size={24} />
            <span className="text-lg font-black uppercase tracking-widest">Timers</span>
          </button>

          <button 
            onClick={() => setShowMasterSettings(true)}
            className="px-8 py-5 rounded-[2rem] bg-black/60 border border-white/10 text-white/50 focus:ring-8 focus:ring-emerald-500 focus:text-white focus:bg-emerald-600 focus:scale-110 focus:outline-none transition-all flex items-center gap-4"
          >
            <Settings size={24} />
            <span className="text-lg font-black uppercase tracking-widest">Control Panel</span>
          </button>

          <button 
            onClick={() => setIsUltraDark(!isUltraDark)}
            className={`px-8 py-5 rounded-[2rem] border transition-all focus:ring-8 focus:ring-purple-500 focus:scale-110 focus:outline-none flex items-center gap-4 ${isUltraDark ? 'bg-purple-600 border-purple-500 text-white' : 'bg-black/60 border-white/10 text-white/50'}`}
          >
            <Moon size={24} />
            <span className="text-lg font-black uppercase tracking-widest">Night</span>
          </button>
        </div>
      </div>

      {/* Master Control Overlay (TV Friendly) */}
      {showMasterSettings && (
        <div className="absolute inset-0 z-[150] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-20">
          <div className="max-w-6xl w-full flex flex-col gap-12 bg-slate-900 border border-white/10 rounded-[3rem] p-16 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-10">
              <h2 className="text-5xl font-black tracking-tighter uppercase italic text-emerald-400">Master Control Panel</h2>
              <button onClick={() => setShowMasterSettings(false)} className="px-10 py-5 rounded-2xl bg-white/5 focus:ring-8 focus:ring-emerald-500 focus:bg-emerald-500 focus:outline-none font-bold text-2xl uppercase">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-8 overflow-y-auto pr-4">
              <ControlItem label="Clock Format" value={is24Hour ? '24-HOUR' : '12-HOUR'} onToggle={() => setIs24Hour(!is24Hour)} icon={<Clock size={24}/>} />
              <ControlItem label="B&W Mode" value={isGrayscale ? 'ACTIVE' : 'OFF'} onToggle={() => setIsGrayscale(!isGrayscale)} icon={<Moon size={24}/>} />
              <ControlItem label="Tick Sounds" value={tickSound ? 'ENABLED' : 'MUTED'} onToggle={() => setTickSound(!tickSound)} icon={<Volume2 size={24}/>} />
              <ControlItem label="Minute Chime" value={minuteSound ? 'ENABLED' : 'MUTED'} onToggle={() => setMinuteSound(!minuteSound)} icon={<Bell size={24}/>} />
              <ControlItem label="Show Seconds" value={showSeconds ? 'VISIBLE' : 'HIDDEN'} onToggle={() => setShowSeconds(!showSeconds)} icon={<Zap size={24}/>} />
              <ControlItem label="Display Date" value={showDate ? 'VISIBLE' : 'HIDDEN'} onToggle={() => setShowDate(!showDate)} icon={<Calendar size={24}/>} />
              <ControlItem label="Burn-In Prot." value={isBurnInProtection ? 'ACTIVE' : 'OFF'} onToggle={() => setIsBurnInProtection(!isBurnInProtection)} icon={<RotateCcw size={24}/>} />
              <ControlItem label="Audio Master" value={tickSound || minuteSound ? 'ON' : 'OFF'} onToggle={() => { setTickSound(!tickSound); setMinuteSound(!tickSound); }} icon={tickSound ? <Volume2 size={24}/> : <VolumeX size={24}/>} />
              
              <div className="col-span-2 grid grid-cols-4 gap-4 p-6 bg-white/5 rounded-3xl items-center">
                <span className="text-sm font-black uppercase tracking-widest opacity-40">Accent Color</span>
                {['emerald', 'ruby', 'blue', 'amber'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setAccentColor(c)}
                    className={`h-16 rounded-2xl border-4 transition-all focus:ring-8 focus:ring-white ${accentColor === c ? 'border-white scale-105' : 'border-transparent opacity-40'}`}
                    style={{ backgroundColor: c === 'emerald' ? '#10b981' : c === 'ruby' ? '#ef4444' : c === 'blue' ? '#3b82f6' : '#f59e0b' }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl">
              <span className="text-sm font-black uppercase tracking-widest opacity-40">Clock Scale</span>
              <button onClick={() => setClockScale(prev => Math.max(prev - 0.1, 0.5))} className="flex-1 p-5 bg-white/10 rounded-2xl focus:ring-8 focus:ring-white">SHRINK</button>
              <span className="text-2xl font-black w-24 text-center">{Math.round(clockScale * 100)}%</span>
              <button onClick={() => setClockScale(prev => Math.min(prev + 0.1, 1.5))} className="flex-1 p-5 bg-white/10 rounded-2xl focus:ring-8 focus:ring-white">ENLARGE</button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Activity Select (TV Friendly) - Reused previous styling */}
      {showTimerSettings && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-20">
           <div className="max-w-7xl w-full flex flex-col gap-16">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-7xl font-black tracking-tighter uppercase italic">Select Activity</h2>
                <button autoFocus onClick={() => setShowTimerSettings(false)} className="px-10 py-6 rounded-3xl bg-white/5 text-white/40 focus:ring-8 focus:ring-blue-500 focus:bg-blue-600 focus:text-white focus:outline-none transition-all font-black text-2xl uppercase tracking-widest">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 'study', label: 'Study Session', icon: BookOpen, time: 45 },
                  { id: 'play', label: 'Play Session', icon: Gamepad2, time: 30 },
                  { id: 'exercise', label: 'Quick Workout', icon: Dumbbell, time: 20 },
                ].map((act) => (
                  <button key={act.id} onClick={() => startTimer(act.time * 60, act.label)} className="group relative h-[25rem] rounded-[4rem] bg-white/5 border border-white/10 p-12 flex flex-col items-center justify-center gap-10 transition-all hover:bg-white/10 focus:ring-12 focus:ring-emerald-500 focus:scale-105 focus:outline-none">
                    <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center group-focus:bg-emerald-500/20 transition-colors">
                      <act.icon size={64} className="text-white/20 group-focus:text-emerald-400 transition-colors" />
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
    </div>
  );
}

function ControlItem({ label, value, onToggle, icon }: { label: string, value: string, onToggle: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onToggle}
      className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 focus:ring-8 focus:ring-white focus:outline-none group transition-all"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-focus:text-emerald-400 transition-colors">
          {icon}
        </div>
        <span className="text-2xl font-black uppercase tracking-widest text-left">{label}</span>
      </div>
      <span className="text-xl font-bold text-emerald-400/60 group-focus:text-emerald-400">{value}</span>
    </button>
  );
}
