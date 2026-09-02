import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, MessageCircle, Volume2, ShieldCheck, Award, Flame, Phone } from 'lucide-react';
import { soundManager } from './SoundManager';

interface ChatMessage {
  id: string;
  sender: 'user' | 'brand';
  text: string;
  timestamp: string;
  brandsData?: any[];
}

interface BrandOption {
  id: string;
  name: string;
  avatar: string;
  fit: string;
  badgeColor: string;
  borderColor: string;
  budget: string;
  vibe: string;
  concept?: string;
  welcomeMessage: string;
}

const BRANDS_LIST: BrandOption[] = [
  {
    id: 'nova-snack',
    name: 'Nova Snack Launch',
    avatar: '🍿',
    fit: '94% Fit',
    badgeColor: 'bg-green-500/10 text-green-400 border-green-500/30',
    borderColor: 'border-green-500/40',
    budget: '₹3,800 INR',
    vibe: 'Gen-Z / Wild / Playful',
    concept: 'Wants chaotic, energetic, hook-focused reels subverting popular memes.',
    welcomeMessage: "👋 Yo! Nova Snack Team here! We saw your sick customized mascot look and thought your community is absolutely perfect for our spicy chips launch. We want some high-octane chaotic short films. What kind of meme hook can you pull off or do you want to collaborate on?"
  },
  {
    id: 'cinematic-alpha',
    name: 'Cinematic Alpha Lens',
    avatar: '📷',
    fit: '89% Fit',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
    budget: '₹24,000 INR',
    vibe: 'Sleek / Premium / Cinematic',
    concept: 'Wants lifestyle-forward high frame rate footage paired with calming ASMR voiceovers.',
    welcomeMessage: "Greetings. I'm the Marketing Director for Cinematic Alpha Lens. We are seeking to collaborate on high-definition lifestyle showcases of our new premium lenses. We love the meticulous details in your creator profile and would love to negotiate a milestone contract of ₹24,005 for your deliverables. Please let us know your aesthetic ideas."
  },
  {
    id: 'nike-athletics',
    name: 'Nike Athletics series',
    avatar: '⚡',
    fit: '78% Match',
    badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    borderColor: 'border-yellow-500/40',
    budget: '₹12,500 INR',
    vibe: 'Bold / Motivational / Sports',
    concept: 'Wants high-performance workouts, athletic daily streaks, and pure energy.',
    welcomeMessage: "Boom! Nike Athletics here. No excuses, let's make things happen. We are scouting creators with strong daily discipline to create daily motivational content showing off the new training gears. Tell us, what is your training discipline like and what creative twist can you put on the training apparel?"
  },
  {
    id: 'redcat-support',
    name: 'RedCat Platform Hub',
    avatar: '😸',
    fit: 'Official Support',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    borderColor: 'border-red-500/40',
    budget: 'Platform Help',
    vibe: 'Friendly / Guide / Minecraft-themed',
    welcomeMessage: "Meow! Welcome to the RedCat Brand Match Command Center. I'm your digital guide. I can help explain escrow contracts, milestones, and how to negotiate terms. Go ahead and select any of the active brands listed left to pitch them custom ideas directly!"
  }
];

const BRANDS_POOL = [
  { id: 'b1', name: 'HyperX Gear', fitRating: 98, avatar: '🎧', vibe: 'Gaming / Audio / Sharp', budget: '₹6,200 INR', specialty: 'Seeks continuous custom headphone unboxings and visual testing' },
  { id: 'b2', name: 'Asus ROG Hub', fitRating: 96, avatar: '💻', vibe: 'Hardware / Extreme / RGB', budget: '₹18,500 INR', specialty: 'Wants nocturnal multi-screen desk review setups in liquid style' },
  { id: 'b3', name: 'NordVPN Security', fitRating: 95, avatar: '🛡️', vibe: 'Cybersecurity / Memes / Saturated', budget: '₹5,000 INR', specialty: 'Wants clean lifestyle safety comparisons using funny clips' },
  { id: 'b4', name: 'Liquid Death', fitRating: 97, avatar: '💧', vibe: 'Metal / Chaotic / Water', budget: '₹14,000 INR', specialty: 'Wants heavy custom beverage challenges under pure main character vibes' },
  { id: 'b5', name: 'GoPro Explorer', fitRating: 93, avatar: '📹', vibe: 'Action / 4K / Wilderness', budget: '₹9,800 INR', specialty: 'Seeks extreme bike helmet and skateboard live footage segments' },
  { id: 'b6', name: 'Duolingo Studios', fitRating: 99, avatar: '🦉', vibe: 'Threatening Meme / Playful', budget: '₹7,500 INR', specialty: 'Wants high engagement short skits and street language-barrier challenges' },
  { id: 'b7', name: 'Squarespace Design', fitRating: 96, avatar: '🌐', vibe: 'Elegance / Minimalist / Website', budget: '₹11,200 INR', specialty: 'Seeks premium desk design layouts showing the portfolio builders API' },
  { id: 'b8', name: 'Gymshark Active', fitRating: 95, avatar: '🦈', vibe: 'Workout / Discipline / Street', budget: '₹8,500 INR', specialty: 'Wants daily fitness motivational loops with visual exercise guidelines' },
  { id: 'b9', name: 'Lofi Records', fitRating: 94, avatar: '🎵', vibe: 'Cozy / Retro / Lo-fi Chill', budget: '₹4,200 INR', specialty: 'Needs cozy bedroom gaming captures featuring chill instrumental lists' },
  { id: 'b10', name: 'Razer Chroma', fitRating: 97, avatar: '🐍', vibe: 'Hardware / Vibrant / Chroma RGB', budget: '₹15,000 INR', specialty: 'Wants dynamic visual gaming layouts syncing sounds with lights' },
  { id: 'b11', name: 'Voxel Toys', fitRating: 92, avatar: '🧸', vibe: 'Cute / Blocky / Kids Tech', budget: '₹3,005 INR', specialty: 'Wants retro stopmotion block creations featuring 3D voxel figurines' },
  { id: 'b12', name: 'Soylent Fuel', fitRating: 94, avatar: '🥛', vibe: 'Eco Food / Fast Energy / Biotech', budget: '₹5,800 INR', specialty: 'Wants lifestyle morning routines fuels showcasing swift meal preps' },
  { id: 'b13', name: 'Oculus Meta Rift', fitRating: 98, avatar: '🥽', vibe: 'Virtual Reality / Cyber / Sci-fi', budget: '₹20,000 INR', specialty: 'Wants futuristic gameplay recordings and VR headset unboxing clips' },
  { id: 'b14', name: 'Steam Games Epic', fitRating: 96, avatar: '🕹️', vibe: 'Gaming Deals / High Fidelity', budget: '₹12,000 INR', specialty: 'Wants rapid game reviews and steam community workshop highlights' },
  { id: 'b15', name: 'Figma Creators', fitRating: 95, avatar: '🎨', vibe: 'UI-ux / Creative Design / Vectors', budget: '₹9,000 INR', specialty: 'Wants visual workflows showcasing prototype linking animations' }
];

interface BrandChatbotProps {
  initialBrandId?: string;
  onInitiateCall?: (partnerId: string, partnerName: string, partnerAvatar: string) => void;
}

export default function BrandChatbot({ initialBrandId, onInitiateCall }: BrandChatbotProps) {
  const [stateBrandsList, setStateBrandsList] = useState<BrandOption[]>(() => {
    const saved = localStorage.getItem('rc_custom_brands');
    return saved ? JSON.parse(saved) : BRANDS_LIST;
  });

  const [selectedBrand, setSelectedBrand] = useState<BrandOption>(() => {
    const list = localStorage.getItem('rc_custom_brands') ? JSON.parse(localStorage.getItem('rc_custom_brands')!) : BRANDS_LIST;
    return list[0];
  });

  useEffect(() => {
    if (initialBrandId) {
      const match = stateBrandsList.find(b => b.id === initialBrandId);
      if (match) {
        setSelectedBrand(match);
      }
    }
  }, [initialBrandId, stateBrandsList]);

  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({
    'nova-snack': [
      {
        id: 'ns-welcome',
        sender: 'brand',
        text: BRANDS_LIST[0].welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    'cinematic-alpha': [
      {
        id: 'ca-welcome',
        sender: 'brand',
        text: BRANDS_LIST[1].welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    'nike-athletics': [
      {
        id: 'na-welcome',
        sender: 'brand',
        text: BRANDS_LIST[2].welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    'redcat-support': [
      {
        id: 'rc-welcome',
        sender: 'brand',
        text: BRANDS_LIST[3].welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end of messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedBrand, isTyping]);

  const currentMessages = conversations[selectedBrand.id] || [];

  const getRollingBrands = (count: number) => {
    const list: any[] = [];
    const startIdx = (count * 3) % BRANDS_POOL.length;
    for (let i = 0; i < 10; i++) {
      const idx = (startIdx + i) % BRANDS_POOL.length;
      list.push(BRANDS_POOL[idx]);
    }
    return list;
  };

  const handleConnectBrand = (brand: any) => {
    soundManager.play('success');
    
    // Check if brand already exists in stateBrandsList
    if (!stateBrandsList.some(b => b.id === brand.id)) {
      const newOption: BrandOption = {
        id: brand.id,
        name: brand.name,
        avatar: brand.avatar,
        fit: `${brand.fitRating}% Fit`,
        badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
        borderColor: 'border-yellow-500/40',
        budget: brand.budget,
        vibe: brand.vibe,
        concept: brand.specialty,
        welcomeMessage: `👋 Hello! We are the official representatives for "${brand.name}". We just launched an instant direct-contact workspace thread after matching your pixel customizer details! Let's build some secure campaign milestones for ${brand.budget} and get cracking.`
      };

      const updated = [...stateBrandsList, newOption];
      setStateBrandsList(updated);
      localStorage.setItem('rc_custom_brands', JSON.stringify(updated));

      // Initialize conversation thread with greeting
      setConversations(prev => ({
        ...prev,
        [brand.id]: [
          {
            id: 'dyn-welcome-' + Date.now(),
            sender: 'brand',
            text: newOption.welcomeMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));

      setSelectedBrand(newOption);
    } else {
      const existing = stateBrandsList.find(b => b.id === brand.id);
      if (existing) {
        setSelectedBrand(existing);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    soundManager.play('click');
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...currentMessages, userMsg];
    setConversations(prev => ({
      ...prev,
      [selectedBrand.id]: updatedMessages
    }));
    const typedText = input;
    setInput('');
    setIsTyping(true);

    // INTERCEPT CREATOR FRICTION
    const textLower = typedText.toLowerCase();
    const isBrandFriction = textLower.includes("don't find any brands") || 
                            textLower.includes("dont find any brands") || 
                            textLower.includes("no brands") || 
                            textLower.includes("don't find any good brands") || 
                            textLower.includes("cant find brands") || 
                            textLower.includes("can't find brands") || 
                            textLower.includes("dont see any brands") || 
                            textLower.includes("empty brands") ||
                            textLower.includes("no matched brands") || 
                            textLower.includes("no good brands");

    if (isBrandFriction) {
      setTimeout(() => {
        setIsTyping(false);
        soundManager.play('success');

        const brandsResponsePool = getRollingBrands(triggerCount);
        setConversations(prev => ({
          ...prev,
          [selectedBrand.id]: [
            ...(prev[selectedBrand.id] || []),
            {
              id: Math.random().toString(),
              sender: 'brand',
              text: `⚠️ **[Interactive Brand Sourcing Override Intercepted]**\n\nI noticed you have not found satisfactory brand partners yet. I have bypassed standard search indexing and initialized our direct **Brand Match Radar**.\n\nHere are 10 premium alternative brand sponsors currently funding active milestone campaigns aligned with your voxel design. Click **Chat Now** to instantaneously initialize direct messaging or trigger visual voice calls!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              brandsData: brandsResponsePool
            }
          ]
        }));
        setTriggerCount(prev => prev + 1);
      }, 1200);
      return;
    }

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName: selectedBrand.name,
          brandContext: `${selectedBrand.vibe}. Concept target: ${selectedBrand.concept || 'N/A'}. Budget offer is: ${selectedBrand.budget}`,
          messages: updatedMessages.map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API server failed');
      }

      const data = await response.json();
      setIsTyping(false);
      soundManager.play('success');

      setConversations(prev => ({
        ...prev,
        [selectedBrand.id]: [
          ...(prev[selectedBrand.id] || []),
          {
            id: Math.random().toString(),
            sender: 'brand',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      soundManager.play('error');

      // Add a helpful local error message that preserves full interactive capability
      setConversations(prev => ({
        ...prev,
        [selectedBrand.id]: [
          ...(prev[selectedBrand.id] || []),
          {
            id: Math.random().toString(),
            sender: 'brand',
            text: `[System Update] Offline simulation backup: Thanks for reaching out! We received your pitch: "${userMsg.text}". Let's arrange a specific creative slot with our management, and secure our ${selectedBrand.budget} escrow on the milestones tab. We are super stoked!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    }
  };

  const handleBrandSelect = (brand: BrandOption) => {
    soundManager.play('switch');
    setSelectedBrand(brand);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[580px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
      
      {/* LEFT COLUMN: BRAND LEADERBOARD SELECTION */}
      <div className="md:col-span-4 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <h4 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-3 block">
            Select Active Brands
          </h4>
          <div className="space-y-2">
            {stateBrandsList.map((b) => {
              const isSelected = selectedBrand.id === b.id;
              const lastMsg = conversations[b.id]?.[conversations[b.id].length - 1]?.text || '';

              return (
                <button
                  key={b.id}
                  onClick={() => handleBrandSelect(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-yellow-400 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/30'
                  }`}
                >
                  <span className="text-2xl shrink-0 select-none">{b.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-1 pb-1">
                      <h5 className="text-xs font-bold text-slate-100 font-sans truncate pr-2">
                        {b.name}
                      </h5>
                      <span className={`text-[8px] font-mono whitespace-nowrap px-1.5 py-0.5 rounded border ${b.badgeColor}`}>
                        {b.fit}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Val: {b.budget}</span>
                      <span className="truncate max-w-[100px] italic pr-1">
                        {lastMsg || 'No messages'}
                      </span>
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute right-0 top-0 h-full w-1 bg-yellow-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative info footer */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg font-mono text-[9px] text-slate-400 space-y-1">
          <p className="text-yellow-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Escrow Safeguard Active
          </p>
          <p className="leading-normal">
            Bids & agreements made in this chatbot must be secured as Milestone contracts in the Escrow division to release payouts.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE CHAT STREAM */}
      <div className="md:col-span-8 flex flex-col justify-between bg-slate-950 min-h-0">
        
        {/* Chat Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">{selectedBrand.avatar}</span>
            <div>
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                {selectedBrand.name} <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </h4>
              <p className="text-[9px] text-slate-400 font-mono italic">
                Niche: {selectedBrand.vibe} • Budget Pool: {selectedBrand.budget}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedBrand.id !== 'redcat-support' && (
              <button
                onClick={() => {
                  soundManager.play('click');
                  if (onInitiateCall) {
                    onInitiateCall(selectedBrand.id, selectedBrand.name, selectedBrand.avatar);
                  }
                }}
                className="flex items-center gap-1 bg-green-950 hover:bg-green-900 text-white font-mono text-[10px] font-bold py-1 px-2.5 rounded border border-green-800/80 hover:border-green-500 transition-all hover:scale-[1.03] shadow-md mr-1 cursor-pointer animate-pulse"
              >
                <Phone className="w-3.5 h-3.5 shrink-0 fill-current" />
                <span>Call Brand</span>
              </button>
            )}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-slate-500 font-mono text-[9px]">
              <span className="relative flex h-1.5 w-1.5 min-w-[6px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span>LIVE MATCH</span>
            </div>
          </div>
        </div>

        {/* Message Streams */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 border-yellow-400/50 text-slate-100 rounded-tr-none shadow-md'
                    : 'bg-slate-900/40 text-slate-200 border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 bg-black/20 px-1.5 py-0.5 rounded w-fit text-[9px] uppercase font-mono tracking-widest text-slate-400">
                  <span>{msg.sender === 'user' ? 'Mascot Creator' : selectedBrand.name}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap select-text text-xs leading-relaxed">{msg.text}</p>

                {/* Dynamic alternative brands display */}
                {msg.brandsData && (
                  <div className="mt-4 space-y-3 w-full border-t border-slate-800/80 pt-3">
                    <span className="block text-[10px] text-yellow-400 font-mono tracking-wider uppercase font-bold">Recommended Alternate Sponsors (10)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {msg.brandsData.map((b: any) => (
                        <div key={b.id} className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex flex-col justify-between hover:border-yellow-400/50 transition-colors relative overflow-hidden group">
                          <div>
                            <div className="flex items-start justify-between gap-1 pb-1">
                              <h5 className="text-[12px] font-bold text-slate-100 flex items-center gap-1.5 min-w-0">
                                <span className="text-lg shrink-0 select-none">{b.avatar}</span> 
                                <span className="truncate">{b.name}</span>
                              </h5>
                              <span className="text-[9px] text-yellow-400 font-mono bg-yellow-450/10 border border-yellow-500/20 px-1.5 py-0.5 rounded shrink-0">{b.fitRating}% Match</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1 py-0.2 rounded">{b.vibe}</span>
                            <p className="text-[10px] text-slate-300 mt-2 font-mono italic leading-tight">{b.specialty}</p>
                          </div>

                          <div className="flex items-center justify-between mt-3 text-[10px] font-sans">
                            <span className="text-green-400 font-mono font-bold leading-normal">{b.budget}</span>
                            <button
                              onClick={() => {
                                handleConnectBrand(b);
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
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic font-mono bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 w-[160px] animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
              </span>
              <span className="text-[10px]">Brand typing...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input panel block */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={`Say hello, pitch your creative format, or ask details...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-yellow-400 text-xs placeholder-slate-500 font-mono"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-800 text-slate-950 font-bold rounded-lg px-4 py-2 text-xs transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-50 font-mono flex items-center gap-1.5"
          >
            <span>Talk</span>
            <Send className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

      </div>

    </div>
  );
}
