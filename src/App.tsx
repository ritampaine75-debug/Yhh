import { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Clock, Maximize2, Minimize2 } from 'lucide-react';

const TIMEZONE = 'Asia/Kolkata';
const FOREST_IMAGE = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000';

export default function App() {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Update fullscreen state when changed externally (e.g. Esc key)
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: TIMEZONE,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TIMEZONE,
    }).format(date);
  };

  const formattedTime = formatTime(time);
  const timeStr = formattedTime.split(' ')[0];
  const ampm = formattedTime.split(' ')[1];

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* High-Quality Forest Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${FOREST_IMAGE})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Location Tag */}
        <div className="mb-12 flex items-center gap-3 px-6 py-2 rounded-full bg-black/40 border border-white/20 backdrop-blur-md">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span className="text-white/80 text-lg font-semibold tracking-[0.3em] uppercase">Kolkata, India</span>
        </div>

        {/* Large TV-Optimized Clock */}
        <div className="flex items-baseline justify-center gap-6">
          <h1 className="text-[20vw] font-bold leading-none tracking-tighter tabular-nums drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
            {timeStr}
          </h1>
          <div className="flex flex-col items-start pb-[4vw]">
            <span className="text-[6vw] font-black text-emerald-500 uppercase tracking-widest drop-shadow-lg">
              {ampm}
            </span>
          </div>
        </div>

        {/* Clear Date Display */}
        <div className="mt-12 flex items-center gap-4 text-white/70">
          <Calendar className="w-8 h-8 opacity-60" />
          <span className="text-[4vw] sm:text-[3vw] font-light tracking-widest uppercase drop-shadow-md">
            {formatDate(time)}
          </span>
        </div>
      </main>

      {/* Fullscreen Button - Top Right */}
      <button 
        onClick={toggleFullscreen}
        className="absolute top-8 right-8 z-20 p-4 rounded-full bg-black/40 border border-white/10 text-white/40 hover:text-white hover:bg-black/60 transition-all focus:outline-4 focus:outline-emerald-500"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 size={32} /> : <Maximize2 size={32} />}
      </button>

      {/* Footer / Status bar */}
      <div className="absolute bottom-12 w-full px-12 flex justify-between items-center text-white/30 font-mono text-sm tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>Real-time Active</span>
        </div>
        <div className="hidden sm:block">
          TV Mode Optimized
        </div>
      </div>
    </div>
  );
}
