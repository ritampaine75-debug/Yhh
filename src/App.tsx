/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Maximize2, 
  Minimize2, 
  MapPin, 
  Calendar, 
  Clock, 
  Sun, 
  Moon, 
  Image as ImageIcon, 
  Settings, 
  X, 
  Plus, 
  Minus, 
  Pause as PauseIcon, 
  Play as PlayIcon, 
  Timer, 
  Gamepad2, 
  BookOpen, 
  Dumbbell 
} from 'lucide-react';

// Kolkata Time Zone
const TIMEZONE = 'Asia/Kolkata';

const PRESET_BGS = [
  { 
    id: 'howrah', 
    name: 'Howrah Bridge', 
    url: 'https://images.unsplash.com/photo-1623150502742-6a849aa94be4?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 'victoria', 
    name: 'Victoria Memorial', 
    url: 'https://images.unsplash.com/photo-1558431382-7729227038e8?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 'vintage', 
    name: 'Kolkata Street', 
    url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 'night', 
    name: 'Cyber City', 
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e0577?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 'minimal', 
    name: 'Dark Forest', 
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 'calm', 
    name: 'Calm Water', 
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000' 
  }
];

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State (Persisted)
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('clk_brightness');
    return saved ? parseFloat(saved) : 1;
  });
  const [isUltraDark, setIsUltraDark] = useState(() => {
    return localStorage.getItem('clk_ultradark') === 'true';
  });
  const [bgType, setBgType] = useState(() => {
    return localStorage.getItem('clk_bgtype') || 'gradient';
  });
  const [customBg, setCustomBg] = useState(() => {
    return localStorage.getItem('clk_custombg') || '';
  });

  // Timer State
  const [timerMode, setTimerMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (activeActivity) {
        console.log("Timer Finished!");
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, activeActivity]);

  const startTimer = (seconds: number, label: string) => {
    setTimeLeft(seconds);
    setActiveActivity(label);
    setIsTimerRunning(true);
    setTimerMode(true);
    setShowSettings(false); // Close settings when timer starts
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Persist settings
  useEffect(() => {
    localStorage.setItem('clk_brightness', brightness.toString());
    localStorage.setItem('clk_ultradark', isUltraDark.toString());
    localStorage.setItem('clk_bgtype', bgType);
    localStorage.setItem('clk_custombg', customBg);
  }, [brightness, isUltraDark, bgType, customBg]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for Kolkata
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: TIMEZONE,
    }).format(date);
  };

  // Format date for Kolkata
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TIMEZONE,
    }).format(date);
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleMouseMove = () => {
      if (!showSettings) {
        setShowControls(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setShowControls(false), 3000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove(); // Initialize

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [showSettings]);

  const adjustBrightness = (amount: number) => {
    setBrightness(prev => Math.min(Math.max(prev + amount, 0.1), 1));
    setIsUltraDark(false);
  };

  // Remote / Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettings(false);
      }
      if (e.key === 'Settings' || e.key === 'm' || e.key === 'Home') {
        setShowSettings(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      id="screensaver-container"
      className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center font-sans transition-all duration-300"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgType === 'gradient' ? (
          <div className="absolute inset-0 transition-opacity duration-1000">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1a1530_0%,transparent_60%)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,#0f172a_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_70%,#1e1b4b_0%,transparent_40%)]" />
            
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full"
            />
            <motion.div 
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -40, 0],
                y: [0, 60, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full"
            />
          </div>
        ) : (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{ backgroundImage: `url(${customBg || ''})` }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          </div>
        )}
      </div>

      {/* Overlays */}
      <div 
        className="absolute inset-0 z-[5] pointer-events-none transition-all duration-500"
        style={{ 
          backgroundColor: 'black', 
          opacity: isUltraDark ? 0.9 : 1 - brightness 
        }} 
      />

      {/* Main Content */}
      <main 
        className="relative z-10 flex flex-col items-center text-center px-6 transition-all duration-700"
        style={{ opacity: isUltraDark ? 0.3 : 1 }}
      >
        <AnimatePresence mode="wait">
          {!timerMode ? (
            <motion.div
              key="clock-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-white/60 text-sm font-medium tracking-[0.2em] uppercase">Kolkata, India</span>
                </div>
              </div>

              {/* Time Display */}
              <div className="relative flex items-center justify-center gap-4">
                <h1 className="text-[12vw] sm:text-[15vw] md:text-[18vw] font-bold text-white leading-none tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                  {formatTime(time).split(' ')[0]}
                </h1>
                <div className="flex flex-col items-start translate-y-[-2vw]">
                   <span className="text-4xl sm:text-6xl md:text-7xl font-bold text-white/80 uppercase tracking-wider leading-none drop-shadow-lg">
                    {formatTime(time).split(' ')[1]}
                  </span>
                </div>
              </div>

              {/* Date Display */}
              <div className="mt-6 flex flex-col items-center gap-1">
                <div className="flex items-center gap-3 text-white/50">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide">
                    {formatDate(time)}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="timer-view"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-8">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 text-sm font-bold tracking-[0.3em] uppercase">{activeActivity || 'Focus Mode'}</span>
              </div>
              
              <h1 className="text-[15vw] font-mono font-bold text-white leading-none tabular-nums drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                {formatTimerDisplay(timeLeft)}
              </h1>

              <div className="flex gap-6 mt-12">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-10 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xl font-bold backdrop-blur-xl transition-all active:scale-95 flex items-center gap-3"
                >
                  {isTimerRunning ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </button>
                <button 
                  onClick={() => {
                    setTimerMode(false);
                    setIsTimerRunning(false);
                  }}
                  className="px-10 py-4 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/60 hover:text-red-400 text-xl font-bold backdrop-blur-xl transition-all active:scale-95"
                >
                  Stop
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Status */}
      <div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-8 transition-opacity duration-700"
        style={{ opacity: isUltraDark ? 0.1 : 1 }}
      >
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex justify-between items-center mt-6 px-4">
          <div className="flex items-center gap-2 text-white/30 text-xs font-mono tracking-widest uppercase">
            <Clock className="w-3 h-3" />
            <span>Real-time Active</span>
          </div>
          <div className="text-white/30 text-xs font-mono tracking-widest uppercase">
            {new Date().getFullYear()} Clock Systems
          </div>
        </div>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-8 right-8 z-[60] flex items-center gap-3"
          >
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-full border backdrop-blur-md transition-all transform active:scale-95 focus:outline-4 focus:outline-blue-500 focus:outline-offset-2 ${
                showSettings ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white shadow-xl'
              }`}
            >
              <Settings size={24} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white transition-all transform active:scale-95 shadow-xl focus:outline-4 focus:outline-blue-500 focus:outline-offset-2"
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Side Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 m-auto w-[90vw] h-[80vh] bg-slate-900/95 border border-white/10 z-[80] p-10 rounded-3xl flex flex-col gap-10 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">TV Control Panel</h2>
                  <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Adjust Clock & Activity</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 focus:outline-4 focus:outline-blue-500"
                  autoFocus
                >
                  <X size={32} />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-12 overflow-hidden">
                {/* Column 1: Brightness & Display */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">
                    <Sun size={18} />
                    <span>Lighting Control</span>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-white/80 font-medium">
                      <span>Screen Brightness</span>
                      <span>{Math.round(brightness * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => adjustBrightness(-0.1)} 
                        className="p-4 hover:bg-white/10 rounded-xl text-white focus:outline-4 focus:outline-blue-500"
                      >
                        <Minus size={24} />
                      </button>
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                          style={{ width: `${brightness * 100}%` }}
                        />
                      </div>
                      <button 
                        onClick={() => adjustBrightness(0.1)} 
                        className="p-4 hover:bg-white/10 rounded-xl text-white focus:outline-4 focus:outline-blue-500"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsUltraDark(!isUltraDark)}
                    className={`flex items-center justify-between px-6 py-6 rounded-2xl border transition-all focus:outline-4 focus:outline-indigo-500 ${
                      isUltraDark ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon size={24} />
                      <div className="text-left">
                        <div className="font-bold">Ultra Dark</div>
                        <div className="text-[10px] opacity-60">Best for Night</div>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isUltraDark ? 'bg-indigo-500' : 'bg-white/20'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${isUltraDark ? 'left-7' : 'left-1'}`} />
                    </div>
                  </button>
                </div>

                {/* Column 2: Backgrounds */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
                    <ImageIcon size={18} />
                    <span>Atmosphere</span>
                  </div>

                  <button 
                    onClick={() => setBgType('gradient')}
                    className={`w-full p-5 rounded-2xl border text-base font-bold transition-all focus:outline-4 focus:outline-emerald-500 ${
                      bgType === 'gradient' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    Dynamic Atmospheric
                  </button>

                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold px-2">Presets Images</span>
                    <div className="grid grid-cols-2 gap-3">
                      {PRESET_BGS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setCustomBg(preset.url);
                            setBgType('image');
                          }}
                          className={`aspect-video rounded-xl overflow-hidden border-4 transition-all focus:outline-4 focus:outline-white/50 ${
                            bgType === 'image' && customBg === preset.url ? 'border-emerald-500 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Timer */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
                    <Timer size={18} />
                    <span>Activity Engine</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => startTimer(45 * 60, 'Study Session')}
                      className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/40 text-white group transition-all focus:outline-4 focus:outline-amber-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <BookOpen size={24} className="text-amber-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-lg leading-tight">Study Time</div>
                          <div className="text-xs text-white/40">45 Minutes Focus</div>
                        </div>
                      </div>
                      <PlayIcon size={20} className="text-amber-400 opacity-40 group-hover:opacity-100" />
                    </button>

                    <button 
                      onClick={() => startTimer(30 * 60, 'Play Session')}
                      className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/40 text-white group transition-all focus:outline-4 focus:outline-indigo-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                          <Gamepad2 size={24} className="text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-lg leading-tight">Play Time</div>
                          <div className="text-xs text-white/40">30 Minutes Fun</div>
                        </div>
                      </div>
                      <PlayIcon size={20} className="text-indigo-400 opacity-40 group-hover:opacity-100" />
                    </button>

                    <button 
                      onClick={() => startTimer(20 * 60, 'Exercise')}
                      className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/40 text-white group transition-all focus:outline-4 focus:outline-emerald-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Dumbbell size={24} className="text-emerald-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-lg leading-tight">Exercise</div>
                          <div className="text-xs text-white/40">20 Minutes Health</div>
                        </div>
                      </div>
                      <PlayIcon size={20} className="text-emerald-400 opacity-40 group-hover:opacity-100" />
                    </button>
                  </div>

                  <div className="mt-auto bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl">
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em] mb-1">Pro Tip</p>
                    <p className="text-xs text-white/40 leading-relaxed">Use Arrow keys and Enter on your remote to navigate quickly without lag.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


