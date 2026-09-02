import React from 'react';
import { MascotData } from '../types';

interface MascotRenderProps {
  mascot?: MascotData;
  scale?: number;
  className?: string;
}

export default function MascotRender({ mascot, scale = 1, className = "" }: MascotRenderProps) {
  // Extract or fall back safely (graceful degradation rules)
  const skin = mascot?.customSkin || 'standard';
  const head = mascot?.customHead || 'none';
  const face = mascot?.customFace || 'neutral';
  
  // Base classes mapping
  // Skin bases:
  // - Standard (--panel-2 or inline background color)
  // - Alien Purple (#7b2cbf)
  // - Matrix Green (#06d6a0)
  // - Cyber Gold (#ffb703)
  const getSkinBg = () => {
    switch (skin) {
      case 'purple': return '#7b2cbf';
      case 'green': return '#06d6a0';
      case 'gold': return '#ffb703';
      case 'standard':
      default: return '#16213a'; // --panel-2 Color
    }
  };

  // Facial features based on active expression state (neutral, happy, focused, glitch)
  const renderFaceFeatures = () => {
    const eyeColor = skin === 'green' ? '#111827' : '#f7fbff';
    switch (face) {
      case 'happy':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-around p-1.5" style={{ pointerEvents: 'none' }}>
            {/* Eyes Happy arches */}
            <div className="flex justify-between w-full px-2 mt-1">
              <span className="text-[10px] font-bold leading-none select-none text-slate-100 font-mono">^</span>
              <span className="text-[10px] font-bold leading-none select-none text-slate-100 font-mono">^</span>
            </div>
            {/* Mouth Curve */}
            <div className="w-4 h-1.5 bg-rose-500 rounded-b-full border border-black/40 -mt-1" />
          </div>
        );
      case 'focused':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-around p-1.5" style={{ pointerEvents: 'none' }}>
            {/* Eyes Focused horizontal dashes */}
            <div className="flex justify-between w-full px-2 mt-1.5">
              <span className="text-xs font-bold leading-none select-none text-slate-200 font-mono">-</span>
              <span className="text-xs font-bold leading-none select-none text-slate-200 font-mono">-</span>
            </div>
            {/* Focused straight line mouth */}
            <div className="w-3.5 h-0.5 bg-slate-800 -mt-1" />
          </div>
        );
      case 'glitch':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-around p-1 bg-violet-950/20 overflow-hidden" style={{ pointerEvents: 'none' }}>
            {/* Glitch/Matrix: matrix code look or pixel static */}
            <div className="flex justify-between w-full px-1.5 mt-1 animate-pulse">
              <span className="text-[9px] font-bold select-none text-green-400 font-mono">X</span>
              <span className="text-[9px] font-bold select-none text-green-400 font-mono">0</span>
            </div>
            <div className="w-5 h-2 bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center -mt-1 animate-ping">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
            </div>
          </div>
        );
      case 'neutral':
      default:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-around p-1.5" style={{ pointerEvents: 'none' }}>
            {/* Standard Dots */}
            <div className="flex justify-between w-full px-2 mt-2">
              <div className="w-1.5 h-2 rounded bg-slate-900" style={{ backgroundColor: eyeColor }} />
              <div className="w-1.5 h-2 rounded bg-slate-900" style={{ backgroundColor: eyeColor }} />
            </div>
            {/* Simple Smile */}
            <div className="w-3 h-1 bg-slate-950 rounded-b-sm border-t-0" />
          </div>
        );
    }
  };

  // Render headwear accessories (None, Retro Headset, Cyber Visor, Neon Crown)
  const renderHeadwear = () => {
    switch (head) {
      case 'headset':
        return (
          <div className="absolute -top-1 left-0 right-0 h-4 z-40 pointer-events-none" style={{ pointerEvents: 'none' }}>
            {/* Band over the head */}
            <div className="h-1.5 mx-2 bg-slate-800 border-x-4 border-yellow-400 rounded-t-full shadow-sm" />
            {/* Ear cups */}
            <div className="absolute top-1.5 left-0.5 w-2 h-4 bg-yellow-400 border border-slate-950 rounded-l" />
            <div className="absolute top-1.5 right-0.5 w-2 h-4 bg-yellow-400 border border-slate-950 rounded-r" />
          </div>
        );
      case 'visor':
        return (
          <div className="absolute top-2 left-1.5 right-1.5 h-3.5 bg-cyan-400/85 border border-cyan-300 rounded shadow-md z-40 animate-pulse pointer-events-none flex items-center justify-center overflow-hidden" style={{ pointerEvents: 'none' }}>
            <span className="text-[6px] text-white font-mono tracking-widest leading-none select-none font-bold">CYBER</span>
            <div className="absolute inset-x-0 h-0.5 bg-white/40 top-0.5" />
          </div>
        );
      case 'crown':
        return (
          <div className="absolute -top-3.5 left-2 right-2 h-4 z-40 pointer-events-none flex justify-between items-end drop-shadow-[0_2px_4px_rgba(234,179,8,0.4)]" style={{ pointerEvents: 'none' }}>
            {/* Left point */}
            <div className="w-2.5 h-3.5 bg-gradient-to-t from-yellow-500 to-yellow-300 border-t border-x border-slate-950 flex flex-col justify-between" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}>
              <div className="w-1 h-1 bg-red-500 rounded-full mx-auto -mt-0.5" />
            </div>
            {/* Center higher point */}
            <div className="w-3 h-5 bg-gradient-to-t from-yellow-500 to-yellow-300 border-t border-x border-slate-950 flex flex-col justify-between" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}>
              <div className="w-1 h-1 bg-cyan-400 rounded-full mx-auto -mt-0.5" />
            </div>
            {/* Right point */}
            <div className="w-2.5 h-3.5 bg-gradient-to-t from-yellow-500 to-yellow-300 border-t border-x border-slate-950 flex flex-col justify-between" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}>
              <div className="w-1 h-1 bg-red-500 rounded-full mx-auto -mt-0.5" />
            </div>
          </div>
        );
      case 'none':
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative rounded-xl border-4 border-slate-800 flex flex-col items-center justify-center shadow-lg transition-transform overflow-visible select-none ${className}`}
      style={{ 
        width: '68px', 
        height: '68px', 
        backgroundColor: getSkinBg(),
        transform: `scale(${scale})`,
        imageRendering: 'pixelated',
      }}
      data-skin={skin}
      data-head={head}
      data-face={face}
    >
      {/* Hair element */}
      <div 
        className="absolute top-1 left-2 right-2 h-4 bg-slate-900 border-b border-black/40" 
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% 60%, 80% 100%, 50% 60%, 20% 100%, 0 60%)',
          backgroundColor: '#2a1a0f',
          zIndex: 10
        }} 
      />

      {/* Headwear layer */}
      {renderHeadwear()}

      {/* Inner Face Face expressions block */}
      <div className="relative w-11 h-10 border-2 border-slate-950/60 rounded bg-amber-100/10 z-20 flex flex-col items-center justify-center">
        {renderFaceFeatures()}
      </div>

      {/* Body Outfits Layer */}
      <div 
        className="absolute bottom-0 inset-x-2 h-5 bg-crimson border-t-2 border-x-2 border-slate-950/75 rounded-t-md flex items-center justify-between"
        style={{ backgroundColor: mascot?.clothes === 'blue' ? '#3b82f6' : mascot?.clothes === 'green' ? '#10b981' : '#ef4444' }}
      >
        <div className="w-2 h-1 bg-yellow-400 mx-auto rounded-sm mt-0.5" />
      </div>
    </div>
  );
}
