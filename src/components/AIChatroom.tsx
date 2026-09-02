import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Copy, Check, MessageSquareCode } from 'lucide-react';
import { soundManager } from './SoundManager';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
  briefData?: any;
  creatorsData?: any[];
}

interface AIChatroomProps {
  onUseBrief: (brief: any) => void;
  onSelectCreator?: (creator: any) => void;
}

const CREATORS_POOL = [
  { id: 'c1', name: 'PixelVlogz', trustRating: 98, skin: 'rose', clothes: 'green', hair: 'spikes', niche: 'Lifestyle & Gaming', specialty: 'Fast chaotic daily vlog editing routines', budgetQuote: '$1,800 USD', avatar: '👾' },
  { id: 'c2', name: 'CyberReels', trustRating: 96, skin: 'gold', clothes: 'crimson', hair: 'tuft', niche: 'Hardware & ASMR', specialty: 'Hyper-detailed cinematic smartphone reviews', budgetQuote: '$2,400 USD', avatar: '🕶️' },
  { id: 'c3', name: 'MimiASMR', trustRating: 95, skin: 'moon', clothes: 'blue', hair: 'bob', niche: 'ASMR Therapy', specialty: 'Quiet whispers, triggers, and calming textures', budgetQuote: '$1,200 USD', avatar: '🎙️' },
  { id: 'c4', name: 'ZonkedEdit', trustRating: 97, skin: 'rose', clothes: 'blue', hair: 'spikes', niche: 'Gen-Z Satire', specialty: 'Fast-cut Reels subverting popular corporate tik-toks', budgetQuote: '$3,100 USD', avatar: '🎬' },
  { id: 'c5', name: 'DinoGaming', trustRating: 94, skin: 'gold', clothes: 'green', hair: 'tuft', niche: 'Retro Tutorials', specialty: '16-bit arcade reviews and platformer records', budgetQuote: '$900 USD', avatar: '🦖' },
  { id: 'c6', name: 'ClaraCosplay', trustRating: 99, skin: 'moon', clothes: 'crimson', hair: 'spikes', niche: 'DIY Fashion', specialty: 'Selfmade custom voxel garment designs and fabrics', budgetQuote: '$4,500 USD', avatar: '👗' },
  { id: 'c7', name: 'LofiCasts', trustRating: 93, skin: 'rose', clothes: 'crimson', hair: 'bob', niche: 'Music Production', specialty: 'Cozy study stream backgrounds and sound loops', budgetQuote: '$1,500 USD', avatar: '📻' },
  { id: 'c8', name: 'ZenMascot', trustRating: 97, skin: 'gold', clothes: 'blue', hair: 'bob', niche: 'Mindfulness Tech', specialty: 'Breathing dashboards and visual stress reduction', budgetQuote: '$2,100 USD', avatar: '🧘' },
  { id: 'c9', name: 'HyperJuice', trustRating: 95, skin: 'moon', clothes: 'green', hair: 'spikes', niche: 'Athletic Routines', specialty: 'Continuous cardio and intense muscle feedback', budgetQuote: '$3,300 USD', avatar: '⚡' },
  { id: 'c10', name: 'NeonScribe', trustRating: 96, skin: 'rose', clothes: 'blue', hair: 'tuft', niche: 'Design Workflows', specialty: 'Step-by-step UI aesthetics and darkmode mockups', budgetQuote: '$2,800 USD', avatar: '🖋️' },
  { id: 'c11', name: 'TurboVoxel', trustRating: 97, skin: 'gold', clothes: 'green', hair: 'spikes', niche: 'Voxel Art', specialty: 'Minecraft-styled animations and custom rigs', budgetQuote: '$2,200 USD', avatar: '🧱' },
  { id: 'c12', name: 'GamerMom', trustRating: 94, skin: 'moon', clothes: 'crimson', hair: 'bob', niche: 'Family Gaming', specialty: 'Cozy Nintendo playthroughs with cozy voiceovers', budgetQuote: '$1,350 USD', avatar: '🎮' },
  { id: 'c13', name: 'PrismDesign', trustRating: 95, skin: 'rose', clothes: 'blue', hair: 'bob', niche: 'Aesthetics', specialty: 'Minimalist product packaging and design trends', budgetQuote: '$2,500 USD', avatar: '🌈' },
  { id: 'c14', name: 'EchoBeats', trustRating: 98, skin: 'gold', clothes: 'crimson', hair: 'spikes', niche: 'Audio Tech', specialty: 'Unbiased headphones testing and frequency reviews', budgetQuote: '$3,000 USD', avatar: '🎧' },
  { id: 'c15', name: 'AlphaAthlete', trustRating: 96, skin: 'moon', clothes: 'blue', hair: 'tuft', niche: 'Extreme Sports', specialty: '1st person skate park captures and stunt tutorials', budgetQuote: '$4,000 USD', avatar: '🛹' }
];

export default function AIChatroom({ onUseBrief, onSelectCreator }: AIChatroomProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hey! I'm RedCat, your AI brand strategist. Let's design a highly engaging influencer campaign brief in seconds.\n\nFirst, please paste your product link or website URL below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);

  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getRollingCreators = (count: number) => {
    const list: any[] = [];
    const startIdx = (count * 3) % CREATORS_POOL.length;
    for (let i = 0; i < 10; i++) {
      const idx = (startIdx + i) % CREATORS_POOL.length;
      list.push(CREATORS_POOL[idx]);
    }
    return list;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    soundManager.play('click');
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const typedText = inputText;
    setInputText('');

    // INTERCEPT FRICTION / EMPTY SOURCING STATEMENT
    const textLower = typedText.toLowerCase();
    const isFrictionTrigger = textLower.includes("don't find any best creators") || 
                              textLower.includes("dont find any best creators") || 
                              textLower.includes("no creators") || 
                              textLower.includes("don't find any creators") || 
                              textLower.includes("dont find any creators") || 
                              textLower.includes("don't see any best creators") || 
                              textLower.includes("no good creators") || 
                              textLower.includes("can't find any creators") || 
                              textLower.includes("cant find any creators") || 
                              textLower.includes("empty creators") ||
                              textLower.includes("no best creators");

    if (isFrictionTrigger) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        soundManager.play('success');
        
        const creators = getRollingCreators(triggerCount);
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'ai',
            text: `⚠️ **[Match Friction Override Intercepted]**\n\nI noticed you have not found the best creators for your specifications yet. I have overridden standard brief logic and called our direct **Pixel Sourcing Engine**.\n\nHere are 10 highly-reputed creator profiles pulling in real-time. Each matches your niche with certified Trust Scores, customized voxel mascots, and direct contact setups! Click **Chat Now** to mount an instant chat session or trigger voice calling!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            creatorsData: creators
          }
        ]);
        setTriggerCount(prev => prev + 1);
      }, 1200);
      return;
    }

    if (step === 1) {
      setProductUrl(typedText);
      setStep(2);
      triggerAIStep2();
    } else if (step === 2) {
      // User typed something instead of choosing option
      setStep(3);
      triggerAIStep3(typedText);
    }
  };

  const triggerAIStep2 = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      soundManager.play('switch');
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: "Perfect! We scanned the link to analyze your industry space. Now, tell me about your target community: What is your preferred marketing vibe? Choose one of our optimized options or type your own!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: ['Gen-Z / Wild', 'Sleek / Premium', 'Corporate / Professional']
        }
      ]);
    }, 1500);
  };

  const handleOptionClick = (vibeOption: string) => {
    soundManager.play('click');
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: vibeOption,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setStep(3);
    triggerAIStep3(vibeOption);
  };

  const triggerAIStep3 = (vibe: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      soundManager.play('success');

      // Generate a highly customized brief template depending on vibe
      let concept = "";
      let hooks: string[] = [];
      let specs = "";

      if (vibe.toLowerCase().includes('gen-z')) {
        concept = "Short, chaotic, energetic hook-focused editing styles. Utilizing trending audio clips and subverting memes to naturally feature the product's value within 5 seconds.";
        hooks = [
          "🎬 'I replaced my entire 4 PM panic routine with this 7-second hack.'",
          "🥤 'The actual definition of main character energy for your shelf.'",
          "✨ 'Wait, why didn't we make this illegal yet?'"
        ];
        specs = "1x TikTok, 1x Instagram Reel, Fast-cuts, text on screen, and zero aesthetic filters.";
      } else if (vibe.toLowerCase().includes('sleek') || vibe.toLowerCase().includes('premium')) {
        concept = "Aesthetic, lifestyle-forward showcase highlighting minimal textures, calming voiceovers, and ASMR-driven high frame rate captures.";
        hooks = [
          "🕯️ 'Investing in my everyday space usually looks like this...'",
          "🍃 'An object with pristine visual and physical balance.'",
          "🌌 'The details that quietly upgrade your entire perspective.'"
        ];
        specs = "1x High-Resolution YouTube Short, 1x Cinematic Reel, soft warm lighting, macro camera shots.";
      } else {
        concept = "Authoritative, educational walk-through emphasizing quantifiable productivity results, clean infographic overlays, and a direct value proposition.";
        hooks = [
          "📈 'The exact system our team was missing to streamline focus.'",
          "💡 'How we eliminated three layers of platform friction under 60 seconds.'",
          "📊 'The data-backed tool that standardizes modern creator payouts.'"
        ];
        specs = "1x LinkedIn video, 1x YouTube Short with crisp educational graphics.";
      }

      const generatedBrief = {
        title: `${vibe.split('/')[0].trim()} Campaign for ${productUrl.replace(/(^\w+:|^)\/\//, '').split('/')[0]}`,
        vibe: vibe,
        concept: concept,
        deliverables: specs,
        recommendedEscrow: vibe.toLowerCase().includes('sleek') ? "$2,200" : vibe.toLowerCase().includes('gen-z') ? "$1,500" : "$1,800",
        proposedHooks: hooks,
        aiMatchRating: "94%"
      };

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: `🎉 Strategic campaign blueprint generated! Check out the Brief details below:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          briefData: generatedBrief
        }
      ]);
    }, 2000);
  };

  const handleCopy = (briefText: string) => {
    navigator.clipboard.writeText(briefText);
    soundManager.play('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const constructBriefText = (b: any) => {
    return `CAMPAIGN BRIEF BLUEPRINT\n` +
      `Title: ${b.title}\n` +
      `Marketing Vibe: ${b.vibe}\n` +
      `Core Concept: ${b.concept}\n` +
      `Platform Deliverables: ${b.deliverables}\n` +
      `Milestone Escrow: ${b.recommendedEscrow}\n` +
      `AI Match Score: ${b.aiMatchRating}\n` +
      `Hooks:\n` +
      b.proposedHooks.join('\n');
  };

  const handleRestart = () => {
    soundManager.play('click');
    setStep(1);
    setProductUrl('');
    setMessages([
      {
        id: 'starting',
        sender: 'ai',
        text: "Let's launch another brief campaign! Paste a product link or website to begin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
      {/* Head */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-500/15 p-1.5 rounded-lg border border-red-500/40 animate-pulse">
            <MessageSquareCode className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-1">
              RedCat x AI Briefing Station <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">Chatroom ID: #RC-9192</p>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="text-[10px] font-bold text-yellow-400 hover:text-white uppercase tracking-wider font-mono px-2 py-1 rounded bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors"
        >
          Reset Setup
        </button>
      </div>

      {/* Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-red-950/20 text-slate-200 border-red-500/40 rounded-tr-none shadow-lg'
                  : 'bg-slate-900/60 text-slate-200 border-slate-800 rounded-tl-none'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 bg-black/20 px-1.5 py-0.5 rounded w-fit text-[10px] uppercase font-mono tracking-widest text-slate-400">
                <span>{msg.sender === 'ai' ? 'RedCat AI' : 'Brand Team'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Dynamic brief display */}
              {msg.briefData && (
                <div className="mt-3 bg-slate-950 border border-yellow-400/50 rounded-lg p-3 space-y-2 text-slate-200 font-mono text-[11px] hover:border-yellow-400 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1 w-full text-yellow-400 font-bold uppercase tracking-wider">
                    <span>Campaign Blueprint</span>
                    <span className="text-[10px] bg-yellow-400/20 px-1.5 py-0.5 rounded text-yellow-300">Match Rank {msg.briefData.aiMatchRating}</span>
                  </div>
                  <p><strong>Title:</strong> {msg.briefData.title}</p>
                  <p><strong>Escrow Escrow:</strong> {msg.briefData.recommendedEscrow}</p>
                  <p><strong>Deliverables:</strong> {msg.briefData.deliverables}</p>
                  <p className="text-slate-300 whitespace-normal select-none"><strong>Concept:</strong> {msg.briefData.concept}</p>
                  
                  <div className="pt-2 border-t border-slate-800">
                    <span className="block font-bold text-slate-300 mb-1">Recommended Hooks:</span>
                    {msg.briefData.proposedHooks.map((h: string, idx: number) => (
                      <span key={idx} className="block text-[10px] bg-slate-900 px-2 py-1 rounded text-yellow-400 border border-slate-800 mb-1 leading-normal">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 mt-2 w-full">
                    <button
                      onClick={() => handleCopy(constructBriefText(msg.briefData))}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 py-1.5 px-3 rounded border border-slate-700 text-slate-200 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400 animate-scale" />
                          <span className="text-[10px] font-bold text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold">Copy Brief</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        soundManager.play('success');
                        onUseBrief(msg.briefData);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 py-1.5 px-3 rounded font-bold transition-colors"
                    >
                      <span>Use Brief</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic creators display */}
              {msg.creatorsData && (
                <div className="mt-4 space-y-3 w-full">
                  <span className="block text-[10px] text-yellow-500 font-mono tracking-wider uppercase font-bold">Matched Pixel Creators (10)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {msg.creatorsData.map((c: any) => (
                      <div key={c.id} className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex flex-col justify-between hover:border-yellow-400/50 transition-colors relative overflow-hidden group">
                        <div className="flex items-start gap-2.5">
                          {/* Pixel Avatar representation */}
                          <div className="flex flex-col items-center justify-center w-9 h-9 rounded border select-none border-slate-700 bg-slate-900 overflow-hidden shrink-0">
                            {/* Head block */}
                            <div className={`w-4 h-3 rounded-full mt-1 ${c.skin === 'rose' ? 'bg-pink-400' : c.skin === 'gold' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                            {/* Clothes body block */}
                            <div className={`w-5 h-3 rounded-sm ${c.clothes === 'crimson' ? 'bg-red-500' : c.clothes === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[12px] font-bold text-slate-100 flex items-center gap-1 truncate mb-0.5">
                              <span>{c.avatar}</span> {c.name}
                            </h5>
                            <span className="text-[9px] text-yellow-400 font-mono bg-yellow-450/10 border border-yellow-500/20 px-1 py-0.2 rounded">★ {c.trustRating}% Trust</span>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono truncate">{c.niche}</p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-300 mt-2 font-mono italic leading-tight border-t border-slate-900 pt-1.5">{c.specialty}</p>

                        <div className="flex items-center justify-between mt-3 text-[10px] font-sans">
                          <span className="text-green-400 font-mono font-bold leading-normal">{c.budgetQuote}</span>
                          <button
                            onClick={() => {
                              soundManager.play('success');
                              if (onSelectCreator) {
                                onSelectCreator(c);
                              }
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold px-2.5 py-1 text-[10px] uppercase rounded transition-transform font-mono"
                          >
                            Chat Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick action buttons if specified */}
            {msg.options && (
              <div className="flex flex-wrap gap-2 mt-2 max-w-[85%] self-start">
                {msg.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    className="bg-slate-900 border border-slate-700 hover:border-yellow-400 text-xs text-slate-200 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-[1.03]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic font-mono bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 w-[150px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
            </span>
            <span>AI typing...</span>
          </div>
        )}
        <div ref={endOfChatRef} />
      </div>

      {/* Input controls */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={step === 2}
          placeholder={
            step === 2
              ? "Please select a vibe option from the quick tiles..."
              : "Type product details or ask custom campaign options..."
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-yellow-400 text-sm placeholder-slate-400 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={step === 2 || !inputText.trim()}
          className="bg-red-500 hover:bg-rose-500 disabled:bg-rose-950 text-white rounded-lg p-2 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-55"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
