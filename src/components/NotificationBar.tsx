import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coins, ShieldCheck, Flame, Users } from 'lucide-react';

interface TickerMessage {
  text: string;
  type: 'flame' | 'escrow' | 'verify' | 'user';
}

const mockTickerPool: TickerMessage[] = [
  { text: '🔥 Creator @rahul_vids just applied to Nike Campaign', type: 'flame' },
  { text: '💰 Brand XYZ just deposited $2,500 into Escrow', type: 'escrow' },
  { text: '🎉 Campaign Verified for Coca-Cola x Priya', type: 'verify' },
  { text: '⚡ Creator @gaming_elite achieved Galaxy Rank Gold', type: 'flame' },
  { text: '👥 Brand Apex onboards 5 new influencers on Match Radar', type: 'user' },
  { text: '🔒 Verified Escrow released $1,800 to Creator @beauty_by_lina', type: 'escrow' },
  { text: '✨ Samsung selected 3 creators for upcoming Galaxy Fold launch', type: 'verify' },
  { text: '💰 Brand FitFast secured $5,000 in Milestone Escrow', type: 'escrow' },
  { text: '🔥 Creator @pixel_chef gained 22k views on Nova Snack reels', type: 'flame' }
];

export default function NotificationBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % mockTickerPool.length);
    }, 8000); // Shift every 8 seconds

    return () => clearInterval(timer);
  }, []);

  const currentItem = mockTickerPool[index];

  const getIcon = (type: string) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />;
      case 'escrow':
        return <Coins className="w-4 h-4 text-green-400" />;
      case 'verify':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      default:
        return <Users className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getThemeColor = (type: string) => {
    switch (type) {
      case 'flame':
        return 'text-orange-300 bg-orange-950/40 border-orange-850/50';
      case 'escrow':
        return 'text-green-300 bg-green-950/40 border-green-850/50';
      case 'verify':
        return 'text-cyan-300 bg-cyan-950/40 border-cyan-850/50';
      default:
        return 'text-yellow-300 bg-yellow-950/40 border-yellow-850/50';
    }
  };

  return (
    <div className="w-full bg-slate-950 border-b border-rose-950/50 py-2.5 px-4 overflow-hidden relative flex items-center justify-center min-h-[44px]">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono hidden sm:inline">LIVE</span>
      </div>

      <div className="w-full max-w-4xl flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs sm:text-sm font-mono tracking-tight text-center ${getThemeColor(currentItem.type)}`}
          >
            {getIcon(currentItem.type)}
            <span>{currentItem.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
