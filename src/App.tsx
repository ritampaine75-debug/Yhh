import { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Clock, Maximize2, Minimize2, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';

const TIMEZONE = 'Asia/Kolkata';

// 6 TV-optimized high-quality backgrounds
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
  const [isUltraDark, setIsUltraDark] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard / Remote Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setBgIndex(prev => (prev + 1) % BACKGROUNDS.length);
      if (e.key === 'ArrowLeft') setBgIndex(prev => (prev - 1 + BACKGROUNDS.length) % BACKGROUNDS.length);
      if (e.key === 'd' || e.key === 'n') setIsUltraDark(prev => !prev);
      if (e.key === 'f') toggleFullscreen();
      
      // Reset control hide timer on any key press
      setShowControls(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timeout);
  }, [showControls, bgIndex, isUltraDark]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true, timeZone: TIMEZONE,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: TIMEZONE,
    }).format(date);
  };

  const formattedTime = formatTime(time);
  const [timeStr, ampm] = formattedTime.split(' ');

  return (
    <div 
      onMouseMove={() => setShowControls(true)}
      className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${BACKGROUNDS[bgIndex]})` }}
      >
        {/* Dynamic Darkening Layer */}
        <div 
          className={`absolute inset-0 transition-all duration-700 ${isUltraDark ? 'bg-black/90' : 'bg-black/50'} backdrop-blur-[1px]`} 
        />
      </div>

      <main 
        className={`relative z-10 flex flex-col items-center text-center px-4 transition-all duration-700 ${isUltraDark ? 'opacity-30 scale-95 blur-[1px]' : 'opacity-100 scale-100'}`}
      >
        {/* Location Info */}
        <div className="mb-12 flex items-center gap-3 px-6 py-2 rounded-full bg-black/40 border border-white/20 backdrop-blur-md">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span className="text-white/80 text-lg font-semibold tracking-[0.3em] uppercase">Kolkata, India</span>
        </div>

        {/* The Clock */}
        <div className="flex items-baseline justify-center gap-6">
          <h1 className="text-[20vw] font-bold leading-none tracking-tighter tabular-nums drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            {timeStr}
          </h1>
          <div className="flex flex-col items-start pb-[4vw]">
            <span className="text-[6vw] font-black text-emerald-500 uppercase tracking-widest drop-shadow-lg">
              {ampm}
            </span>
          </div>
        </div>

        {/* The Date */}
        <div className="mt-12 flex items-center gap-4 text-white/70">
          <Calendar className="w-8 h-8 opacity-60" />
          <span className="text-[4vw] sm:text-[3vw] font-light tracking-widest uppercase drop-shadow-md">
            {formatDate(time)}
          </span>
        </div>
      </main>

      {/* Persistent Bottom Status */}
      <div className="absolute bottom-12 w-full px-12 flex justify-between items-center text-white/20 font-mono text-sm tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Sync v2.2</span>
        </div>
        <div className="hidden sm:block">
          TV Optimized • Background {bgIndex + 1}/6
        </div>
      </div>

      {/* Hidden/Floating TV Controls */}
      <div className={`absolute inset-x-0 top-0 p-8 flex justify-between items-start transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsUltraDark(!isUltraDark)}
            className={`p-4 rounded-full border backdrop-blur-xl transition-all active:scale-95 ${isUltraDark ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/60 border-white/10 text-white/60'}`}
            title="Toggle Night Mode"
          >
            {isUltraDark ? <Moon size={28} /> : <Sun size={28} />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-black/60 border border-white/10 p-2 rounded-full backdrop-blur-xl">
            <button 
              onClick={() => setBgIndex(prev => (prev - 1 + BACKGROUNDS.length) % BACKGROUNDS.length)}
              className="p-3 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setBgIndex(prev => (prev + 1) % BACKGROUNDS.length)}
              className="p-3 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-4 rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-white backdrop-blur-xl transition-all"
          >
            {isFullscreen ? <Minimize2 size={28} /> : <Maximize2 size={28} />}
          </button>
        </div>
      </div>

      {/* Screen Edge Hint (only visible when controls show) */}
      <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-emerald-500/10 to-transparent transition-opacity duration-1000 ${showControls ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-emerald-500/10 to-transparent transition-opacity duration-1000 ${showControls ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
