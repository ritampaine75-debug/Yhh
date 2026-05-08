import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

const TIMEZONE = 'Asia/Kolkata';

export default function App() {
  const [time, setTime] = useState(new Date());

  // Update time every second with high precision
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Subtle, Static TV-Safe Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1e1b4b_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#0f172a_0%,transparent_50%)]" />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Location Tag */}
        <div className="mb-12 flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <MapPin className="w-5 h-5 text-blue-400" />
          <span className="text-white/60 text-lg font-semibold tracking-[0.3em] uppercase">Kolkata, India</span>
        </div>

        {/* Large TV-Optimized Clock */}
        <div className="flex items-baseline justify-center gap-6">
          <h1 className="text-[20vw] font-bold leading-none tracking-tighter tabular-nums drop-shadow-2xl">
            {timeStr}
          </h1>
          <div className="flex flex-col items-start pb-[4vw]">
            <span className="text-[6vw] font-black text-blue-500 uppercase tracking-widest drop-shadow-lg">
              {ampm}
            </span>
          </div>
        </div>

        {/* Clear Date Display */}
        <div className="mt-12 flex items-center gap-4 text-white/50">
          <Calendar className="w-8 h-8 opacity-40" />
          <span className="text-[4vw] sm:text-[3vw] font-light tracking-wide">
            {formatDate(time)}
          </span>
        </div>
      </main>

      {/* Footer / Status bar */}
      <div className="absolute bottom-12 w-full px-12 flex justify-between items-center text-white/20 font-mono text-sm tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Real-time Sync Active</span>
        </div>
        <div className="hidden sm:block">
          TV Mode Optimized
        </div>
      </div>
    </div>
  );
}
