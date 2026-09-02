import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  Phone, 
  Shield, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  MessageSquare, 
  Send, 
  Filter, 
  Trash2, 
  Compass, 
  Cpu, 
  Coins, 
  UserPlus, 
  Building2, 
  X, 
  Check, 
  Menu, 
  Lock,
  Volume2,
  FileCheck,
  AlertTriangle,
  Play
} from 'lucide-react';
import { soundManager } from './SoundManager';
import { JobListing, JobApplication, HiringChat, UserRole } from '../types';
import MascotRender from './MascotRender';

interface HiringArenaProps {
  userId: string;
  userRole: UserRole;
  userEmail: string;
  currentMascot: any;
  isVerified?: boolean;
}

export default function HiringArena({ userId, userRole, userEmail, currentMascot, isVerified = true }: HiringArenaProps) {
  // --- IN-MEMORY/PERSISTENT DATABASE SEEDING ---
  const [jobListings, setJobListings] = useState<JobListing[]>(() => {
    const cached = localStorage.getItem('rc_hiring_jobs');
    if (cached) return JSON.parse(cached);
    
    // Default system seed
    return [
      {
        id: 'job-1',
        title: 'Minecraft Cinematic Video Editor',
        brandId: 'brand-nova',
        brandName: 'Nova Snack Co.',
        brandAvatar: '🍿',
        contractType: 'Freelance',
        niche: 'Gaming',
        budgetRange: '₹1,200 - ₹2,500',
        trustScoreRequired: 80,
        description: 'We require a cinematic high-fidelity Minecraft editor to slice 60-second vertical reels from raw creator gameplay and introduce engaging custom motion graphics.',
        skillsRequired: ['Premiere Pro', 'After Effects', 'Minecraft Cinematic Mod', 'Quick Cut Syncing'],
        createdAt: Date.now() - 3 * 24 * 3600 * 1000,
        status: 'open',
        roleRequired: 'Video Editor'
      },
      {
        id: 'job-2',
        title: 'Cyberpunk Vector Mascot Artist',
        brandId: 'brand-cosmo',
        brandName: 'CosmoWear Wearables',
        brandAvatar: '🪐',
        contractType: 'Part-time',
        niche: 'Tech & Lifestyle',
        budgetRange: '₹2,000/mo',
        trustScoreRequired: 75,
        description: 'Construct high contrast, customized digital mascot overlays and custom apparel vectors. Will coordinate with active NFT-based drop collections.',
        skillsRequired: ['Illustrator', 'Pixel Art Design', 'Vector Assets', 'Mascot Brand Alignment'],
        createdAt: Date.now() - 1 * 24 * 3600 * 1000,
        status: 'open',
        roleRequired: 'Graphic Designer'
      },
      {
        id: 'job-3',
        title: 'AI Script Copywriter for Crypto-Sponsor Reels',
        brandId: 'brand-ledger',
        brandName: 'Solana Ledger Corp',
        brandAvatar: '🪙',
        contractType: 'Full-time',
        niche: 'Crypto & Finance',
        budgetRange: '₹4,500 - ₹6,000/mo',
        trustScoreRequired: 90,
        description: 'Optimize high-conversion financial/tech script hooks utilizing professional financial templates. Coordinate with fine-tuned LLM feedback.',
        skillsRequired: ['Financial Copywriting', 'Script Hooks', 'Conversion Rate Optimization', 'Crypto Regulatory Safety'],
        createdAt: Date.now() - 5 * 24 * 3600 * 1000,
        status: 'open',
        roleRequired: 'Copywriter'
      }
    ];
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const cached = localStorage.getItem('rc_hiring_applies');
    if (cached) return JSON.parse(cached);

    // Default applications seed
    return [
      {
        id: 'apply-1',
        jobId: 'job-1',
        jobTitle: 'Minecraft Cinematic Video Editor',
        brandId: 'brand-nova',
        creatorId: 'creator-nova-prime',
        creatorName: 'NovaPrime Cuts',
        creatorAvatar: '🎨',
        creatorNiche: 'Gaming',
        creatorTrustScore: 94,
        portfolioLink: 'https://youtube.com/c/novaprime-cuts-demo',
        coverLetter: 'Cut over 50 viral gameplay reels for leading creators. Experts on motion trackers, pixel rendering shaders, and fast hook pacing!',
        status: 'applied',
        createdAt: Date.now() - 2 * 24 * 3600 * 1000,
        stage: 'applied'
      },
      {
        id: 'apply-2',
        jobId: 'job-2',
        jobTitle: 'Cyberpunk Vector Mascot Artist',
        brandId: 'brand-cosmo',
        creatorId: 'creator-star-draw',
        creatorName: 'StarDraw Design Studio',
        creatorAvatar: '🚀',
        creatorNiche: 'Tech & Lifestyle',
        creatorTrustScore: 88,
        portfolioLink: 'https://behance.net/stardraw-portfolio-demo',
        coverLetter: 'Working directly on custom assets for indie developers and avatar creators. Passionate about retro-futurisms and low-poly graphics.',
        status: 'reviewing',
        createdAt: Date.now() - 1 * 24 * 3600 * 1000,
        stage: 'interview'
      }
    ];
  });

  const [hiringChats, setHiringChats] = useState<HiringChat[]>(() => {
    const cached = localStorage.getItem('rc_hiring_chats');
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Save database states locally upon changes
  useEffect(() => {
    localStorage.setItem('rc_hiring_jobs', JSON.stringify(jobListings));
  }, [jobListings]);

  useEffect(() => {
    localStorage.setItem('rc_hiring_applies', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('rc_hiring_chats', JSON.stringify(hiringChats));
  }, [hiringChats]);


  // --- COMPONENT STATE AND FILTERS ---
  const [activeHiringChat, setActiveHiringChat] = useState<HiringChat | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [isOpenToWork, setIsOpenToWork] = useState(() => {
    return localStorage.getItem('rc_open_to_work') === 'true';
  });
  const [mediaPortfolioLink, setMediaPortfolioLink] = useState(() => {
    return localStorage.getItem('rc_media_portfolio') || 'https://redcat.example/portfolio-c3rat';
  });

  // Search/Filter properties
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNicheFilter, setSelectedNicheFilter] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [minTrustScore, setMinTrustScore] = useState(0);

  // Job Listing Creation Modal
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobContract, setNewJobContract] = useState<'Full-time' | 'Part-time' | 'Freelance' | 'Internship'>('Freelance');
  const [newJobNiche, setNewJobNiche] = useState('Gaming');
  const [newJobRequiredRole, setNewJobRequiredRole] = useState<'Content Creator' | 'Video Editor' | 'Graphic Designer' | 'Copywriter'>('Video Editor');
  const [newJobBudget, setNewJobBudget] = useState('₹1,500 - ₹3,000');
  const [newJobTrustRequirement, setNewJobTrustRequirement] = useState(80);
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobSkills, setNewJobSkills] = useState('');

  // Application Modal
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);
  const [applyCoverLetter, setApplyCoverLetter] = useState('');
  const [applyPortfolio, setApplyPortfolio] = useState(mediaPortfolioLink);

  // Parser Simulated State
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [parserReport, setParserReport] = useState('');

  // Voice Call Active Overlay Handshake states
  const [activeVoiceCall, setActiveVoiceCall] = useState<{
    state: 'outgoing' | 'incoming' | 'connecting' | 'connected' | 'completed';
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    transcript: Array<{ speaker: string; text: string; highlight?: boolean }>;
    timer: number;
    escrowAmount: number;
    escrowLocked: boolean;
  } | null>(null);

  // Admin Verified Clients Matrix
  const [adminClients, setAdminClients] = useState<Array<{
    id: string;
    name: string;
    role: string;
    trustScore: number;
    verified: boolean;
    tier: string;
    completedContracts: number;
  }>>([
    { id: 'client-1', name: 'NovaPrime Cuts', role: 'Video Editor', trustScore: 94, verified: true, tier: 'Ultra Max', completedContracts: 8 },
    { id: 'client-2', name: 'StarDraw Design Studio', role: 'Graphic Designer', trustScore: 88, verified: false, tier: 'Pro', completedContracts: 3 },
    { id: 'client-3', name: 'InkFlow Copy', role: 'Copywriter', trustScore: 71, verified: false, tier: 'Basic', completedContracts: 1 },
    { id: 'client-4', name: 'RedCat Marketing Agency', role: 'Agency', trustScore: 96, verified: true, tier: 'Ultra Max', completedContracts: 14 }
  ]);

  const [disputeLogs, setDisputeLogs] = useState<Array<{
    id: string;
    context: string;
    brandName: string;
    creatorName: string;
    amount: string;
    status: 'Reviewing' | 'Resolved' | 'Arbitration';
  }>>([
    { id: 'disp-1', context: 'Delayed delivery of asset reels on campaign Minecraft Promo', brandName: 'Nova Snack Co.', creatorName: 'NovaPrime Cuts', amount: '₹450.00', status: 'Reviewing' },
    { id: 'disp-2', context: 'Graphic revision excess dispute', brandName: 'CosmoWear Wearables', creatorName: 'StarDraw Design Studio', amount: '₹200.00', status: 'Resolved' }
  ]);

  // Voice Call logic timers
  useEffect(() => {
    let callInterval: any = null;
    if (activeVoiceCall && activeVoiceCall.state === 'connected') {
      callInterval = setInterval(() => {
        setActiveVoiceCall(prev => {
          if (!prev) return null;
          
          // Generate dialog simulator every 6 seconds
          const currentSec = prev.timer + 1;
          const newTranscript = [...prev.transcript];
          
          if (currentSec === 3) {
            newTranscript.push({ speaker: prev.partnerName, text: "Hey! Glad we reached cryptographic handshake. I was reviewing your RedCat portfolio profile." });
          } else if (currentSec === 8) {
            newTranscript.push({ speaker: "System AI Compiler", text: "[Auto Transcribing] Match rate detected at 94% with standard sandbox guidelines. Optimal rates active.", highlight: true });
          } else if (currentSec === 14) {
            newTranscript.push({ speaker: prev.partnerName, text: `I think we should secure an immediate milestone lock of ₹${prev.escrowAmount}. It provides payment guarantees.` });
          } else if (currentSec === 20) {
            newTranscript.push({ speaker: "System AI Compiler", text: "[Meeting Hook Brief] Generated milestone requirement link inside current active phone channel. Pending lock.", highlight: true });
          }

          return {
            ...prev,
            timer: currentSec,
            transcript: newTranscript
          };
        });
      }, 1000);
    }
    return () => clearInterval(callInterval);
  }, [activeVoiceCall]);

  const handleToggleOpenToWork = () => {
    soundManager.play('click');
    const newState = !isOpenToWork;
    setIsOpenToWork(newState);
    localStorage.setItem('rc_open_to_work', String(newState));
  };

  const handleSaveMediaPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.play('success');
    localStorage.setItem('rc_media_portfolio', mediaPortfolioLink);
    alert('Portfolio Link preserved in local configuration scope and users metadata payload.');
  };

  // --- CV PARSER SIMULATION ---
  const handleParseCV = () => {
    if (!applyPortfolio) {
      alert('Specify a portfolio link before running automated compiler parser.');
      return;
    }
    soundManager.play('click');
    setIsParsingUrl(true);
    setParserReport('Connecting parser scanner to remote address link...');
    
    setTimeout(() => {
      soundManager.play('success');
      const randomSkills = ['Video Reel Splicing', 'Motion Typography', 'Audio Gain Mastering', 'Social Engagement Optimized Loops', 'Gemini Hook Script Formatting'];
      setParsedSkills(randomSkills);
      setParserReport('✓ CV Parser Compile Completed successfully! Extracted 5 niche metadata tags. Values mapped.');
      setIsParsingUrl(false);
    }, 1800);
  };

  // --- JOB ACTIONS ---
  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      alert('❌ Operation Denied: You must complete identity verification (PAN/GSTIN) first.');
      return;
    }
    if (!newJobTitle || !newJobDescription) {
      alert('Please state job title and contract descriptions.');
      return;
    }
    soundManager.play('success');
    const skillsList = newJobSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newListing: JobListing = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      brandId: userId,
      brandName: userEmail.split('@')[0],
      brandAvatar: userRole === 'Brand' ? '🪐' : '🦖',
      contractType: newJobContract,
      niche: newJobNiche,
      budgetRange: newJobBudget,
      trustScoreRequired: newJobTrustRequirement,
      description: newJobDescription,
      skillsRequired: skillsList.length ? skillsList : ['Generalist Content Creation'],
      createdAt: Date.now(),
      status: 'open',
      roleRequired: newJobRequiredRole
    };

    setJobListings([newListing, ...jobListings]);
    setIsPostJobModalOpen(false);
    // Reset fields
    setNewJobTitle('');
    setNewJobDescription('');
    setNewJobSkills('');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      alert('❌ Operation Denied: Creator identity verification (PAN) required to submit applications.');
      return;
    }
    if (!applyingJob) return;
    soundManager.play('success');

    const newApply: JobApplication = {
      id: `apply-${Date.now()}`,
      jobId: applyingJob.id,
      jobTitle: applyingJob.title,
      brandId: applyingJob.brandId,
      creatorId: userId,
      creatorName: userEmail.split('@')[0],
      creatorAvatar: '🛡️',
      creatorNiche: applyingJob.niche,
      creatorTrustScore: 92,
      portfolioLink: applyPortfolio,
      coverLetter: applyCoverLetter,
      status: 'applied',
      createdAt: Date.now(),
      stage: 'applied'
    };

    setApplications([newApply, ...applications]);
    setApplyingJob(null);
    setApplyCoverLetter('');
  };

  // --- ADVANCED COMMUNICATIONS CHAT INSTANTIATE ---
  const handleInitiateConnect = (apply: JobApplication) => {
    soundManager.play('click');
    soundManager.play('success');
    
    // Check if channel already exists
    const existingChannel = hiringChats.find(c => c.jobId === apply.jobId && c.creatorId === apply.creatorId);
    if (existingChannel) {
      setActiveHiringChat(existingChannel);
      return;
    }

    const newChannel: HiringChat = {
      id: `hiring-chat-${Date.now()}`,
      jobId: apply.jobId,
      jobTitle: apply.jobTitle,
      brandId: apply.brandId,
      brandName: 'Brand Sponsor',
      creatorId: apply.creatorId,
      creatorName: apply.creatorName,
      creatorAvatar: apply.creatorAvatar || '🍿',
      messages: [
        {
          id: 'msg-init',
          senderId: 'system',
          senderName: 'RedCat Comm System',
          text: `Conversational handshake initiated! Connecting Sponsor on listing "${apply.jobTitle}" with Applicant "${apply.creatorName}". Direct WebRTC communication channels primed.`,
          timestamp: Date.now()
        }
      ],
      createdAt: Date.now(),
      lastMessage: 'Conversational handshake initiated!',
      lastMessageTime: Date.now()
    };

    setHiringChats([newChannel, ...hiringChats]);
    setActiveHiringChat(newChannel);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHiringChat || !chatInputText.trim()) return;
    soundManager.play('click');

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: userEmail.split('@')[0],
      text: chatInputText.trim(),
      timestamp: Date.now()
    };

    const updatedChats = hiringChats.map(c => {
      if (c.id === activeHiringChat.id) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: newMsg.text,
          lastMessageTime: newMsg.timestamp
        };
      }
      return c;
    });

    setHiringChats(updatedChats);
    const updatedActive = updatedChats.find(c => c.id === activeHiringChat.id) || activeHiringChat;
    setActiveHiringChat(updatedActive);
    setChatInputText('');

    // Trigger random sponsor simulated reply if creator is chat sender
    if (userRole === 'Creator') {
      setTimeout(() => {
        soundManager.play('success');
        const replies = [
          "Awesome portfolio reel. Let's start an immediate secure AI Voice Call handshake on the platform to outline the escrow milestones!",
          "I reviewed your parsed skills. That After Effects animation pacing looks solid. Let's sync on a direct audio channel.",
          "Perfect. Is a ₹1,500 contract package adequate for Milestone 1 or would you like to review specifications?"
        ];
        const randomReply = {
          id: `msg-reply-${Date.now()}`,
          senderId: activeHiringChat.brandId,
          senderName: 'Sponsor Agent',
          text: replies[Math.floor(Math.random() * replies.length)],
          timestamp: Date.now()
        };
        setHiringChats(chats => chats.map(c => {
          if (c.id === activeHiringChat.id) {
            return {
              ...c,
              messages: [...c.messages, randomReply],
              lastMessage: randomReply.text,
              lastMessageTime: randomReply.timestamp
            };
          }
          return c;
        }));
        setActiveHiringChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, randomReply],
          lastMessage: randomReply.text,
          lastMessageTime: randomReply.timestamp
        } : null);
      }, 1500);
    }
  };

  // --- AI VOICE COMMUNICATIONS HANDSHAKE NODE ---
  const handleInitiateVoiceCall = (partnerId: string, partnerName: string, partnerAvatar: string) => {
    if (!isVerified) {
      alert('❌ Access Denied: Secure Voice Handshake requires completed identity clearance.');
      return;
    }
    soundManager.play('click');
    soundManager.play('success');
    
    setActiveVoiceCall({
      state: 'outgoing',
      partnerId,
      partnerName,
      partnerAvatar,
      transcript: [
        { speaker: "System", text: "Initializing cryptographic handshake and WebRTC transport headers..." },
        { speaker: "System", text: "IP encapsulation isolation layer: SECURE." }
      ],
      timer: 0,
      escrowAmount: 1500,
      escrowLocked: false
    });

    // Ringing sound simulation
    setTimeout(() => {
      setActiveVoiceCall(prev => {
        if (!prev) return null;
        return {
          ...prev,
          state: 'connected',
          transcript: [...prev.transcript, { speaker: "System", text: "[HANDSHAKE SYNCHRONIZED] Connection active. Audio encryption keys released to secure workspace.", highlight: true }]
        };
      });
    }, 2500);
  };

  const handleDeclineVoiceCall = () => {
    soundManager.play('close');
    setActiveVoiceCall(prev => prev ? { ...prev, state: 'completed' } : null);
  };

  const handleLockCallEscrowMilestone = () => {
    soundManager.play('success');
    setActiveVoiceCall(prev => {
      if (!prev) return null;
      return {
        ...prev,
        escrowLocked: true,
        transcript: [...prev.transcript, { speaker: "System", text: `🔒 [ESCROW LOCKED] A campaign financial milestone of ₹${prev.escrowAmount} has been registered securely against the RedCat Escrow Vault!`, highlight: true }]
      };
    });
    alert('Milestone contract package locked into active campaign workflows successfully!');
  };

  // --- KANBAN BOARD TRANSITIONS FOR APARTMENT TRACKING ---
  const handleAdvanceApplicationStage = (appId: string, nextStage: 'applied' | 'interview' | 'offer' | 'hired') => {
    soundManager.play('success');
    setApplications(apps => apps.map(a => {
      if (a.id === appId) {
        return { ...a, stage: nextStage };
      }
      return apps;
    }));
  };

  const handleDeclineApplication = (appId: string) => {
    soundManager.play('close');
    setApplications(apps => apps.map(a => {
      if (a.id === appId) {
        return { ...a, status: 'declined' };
      }
      return apps;
    }));
  };

  // --- ADMIN PORTAL WRAPPERS & ACTIONS ---
  const handleVerifyClient = (clientId: string) => {
    soundManager.play('success');
    setAdminClients(clients => clients.map(c => {
      if (c.id === clientId) {
        return { ...c, verified: !c.verified };
      }
      return c;
    }));
  };

  const handleResolveDispute = (logId: string) => {
    soundManager.play('success');
    setDisputeLogs(disputes => disputes.map(d => {
      if (d.id === logId) {
        return { ...d, status: 'Resolved' };
      }
      return d;
    }));
  };

  // Filter listings
  const filteredListings = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = selectedNicheFilter === 'All' || job.niche === selectedNicheFilter;
    const matchesRole = selectedRoleFilter === 'All' || job.roleRequired === selectedRoleFilter;
    const matchesTrust = job.trustScoreRequired >= minTrustScore;
    return matchesSearch && matchesNiche && matchesRole && matchesTrust;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 md:p-6 space-y-6 relative" id="hiring-arena-subsystem">
      
      {/* Header and Core Brand / Workspace status banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Hiring Arena Portal V1.0 • Decentralized Jobs
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
            🏟️ The Hiring Arena
          </h2>
          <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-xl">
            Where sponsors recruit high-converting video editors, graphic designers, copywriters, and content directors built using verified reputation scores.
          </p>
        </div>

        {/* Global Creator / open to Work Badging */}
        {userRole === 'Creator' && (
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-850 self-stretch md:self-auto">
            <div>
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Status Dashboard</span>
              <p className="text-xs font-mono font-black text-slate-200 uppercase">
                {isOpenToWork ? '🟢 Open to Work (Pixel Active)' : '🔴 Unavailable for Contract'}
              </p>
            </div>
            <button
              onClick={handleToggleOpenToWork}
              className={`p-1.5 px-3 rounded text-[10px] font-mono uppercase font-black tracking-wider transition-colors cursor-pointer border ${
                isOpenToWork 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
              }`}
            >
              Toggle
            </button>
          </div>
        )}

        {/* Brand Action - Post employment listing */}
        {userRole === 'Brand' && (
          <button
            onClick={() => { soundManager.play('click'); setIsPostJobModalOpen(true); }}
            className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 hover:scale-[1.02] active:scale-95 text-slate-950 font-black font-mono text-xs uppercase p-2.5 px-4 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Post Arena Listing
          </button>
        )}
      </div>

      {/* THREE INTERACTIVE PORTAL SECTIONS MATCHING THE PERSONAS */}
      
      {/* 1. BRAND/AGENCY VIEW: HIRING BOARD */}
      {userRole === 'Brand' && (
        <div className="space-y-6">
          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-yellow-400 tracking-wider">
              Sponsor Applicant Tracking Board (Kanban Workflow)
            </h3>
            
            {applications.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No active applicants registered for your listings yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Column applied */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col space-y-3 min-h-[300px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2 border-b border-slate-850 pb-1 flex justify-between items-center bg-slate-900/30 p-1 rounded">
                    📌 APPLIED ({applications.filter(a => a.stage === 'applied').length})
                  </span>
                  
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[400px]">
                    {applications.filter(a => a.stage === 'applied').map(app => (
                      <div key={app.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2 text-xs relative group hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-200 block font-bold">{app.creatorName}</strong>
                            <span className="text-[9px] font-mono text-yellow-400">Trust Score: {app.creatorTrustScore}%</span>
                          </div>
                          <span className="text-lg">{app.creatorAvatar}</span>
                        </div>
                        <p className="text-[11px] text-slate-450 italic line-clamp-2">{app.coverLetter}</p>
                        
                        <div className="flex gap-1.5 pt-2 border-t border-slate-950">
                          <button 
                            onClick={() => handleAdvanceApplicationStage(app.id, 'interview')}
                            className="bg-slate-800 hover:bg-slate-755 text-slate-200 p-1 px-1.5 rounded text-[9px] font-mono uppercase font-semibold cursor-pointer w-full text-center hover:text-white"
                          >
                            Interview
                          </button>
                          <button 
                            onClick={() => handleInitiateConnect(app)}
                            className="bg-green-600 hover:bg-green-550 text-white p-1 px-1.5 rounded text-[9px] font-mono uppercase font-black cursor-pointer w-full text-center"
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column interview */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col space-y-3 min-h-[300px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400 px-2 border-b border-blue-900/40 pb-1 flex justify-between items-center bg-slate-900/30 p-1 rounded">
                    🎙️ INTERVIEW ({applications.filter(a => a.stage === 'interview').length})
                  </span>
                  
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[400px]">
                    {applications.filter(a => a.stage === 'interview').map(app => (
                      <div key={app.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2 text-xs relative group hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-200 block font-bold">{app.creatorName}</strong>
                            <span className="text-[9px] font-mono text-blue-400">Trust Score: {app.creatorTrustScore}%</span>
                          </div>
                          <span className="text-lg">{app.creatorAvatar}</span>
                        </div>
                        <p className="text-[11px] text-slate-450 italic line-clamp-2">{app.coverLetter}</p>
                        
                        <div className="flex gap-1.5 pt-2 border-t border-slate-950">
                          <button 
                            onClick={() => handleAdvanceApplicationStage(app.id, 'offer')}
                            className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 p-1 px-1.5 rounded text-[9px] font-mono uppercase font-bold cursor-pointer w-full text-center"
                          >
                            Send Offer
                          </button>
                          <button 
                            onClick={() => handleInitiateConnect(app)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 px-1.5 rounded text-[9px] font-mono uppercase font-semibold cursor-pointer w-full text-center"
                          >
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column offer */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col space-y-3 min-h-[300px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-yellow-450 px-2 border-b border-slate-850 pb-1 flex justify-between items-center bg-slate-900/30 p-1 rounded">
                    💰 OFFER PENDING ({applications.filter(a => a.stage === 'offer').length})
                  </span>
                  
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[400px]">
                    {applications.filter(a => a.stage === 'offer').map(app => (
                      <div key={app.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2 text-xs relative group hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-200 block font-bold">{app.creatorName}</strong>
                            <span className="text-[9px] font-mono text-amber-400">Trust Score: {app.creatorTrustScore}%</span>
                          </div>
                          <span className="text-lg">{app.creatorAvatar}</span>
                        </div>
                        <p className="text-[11px] text-slate-450 italic line-clamp-2">{app.coverLetter}</p>
                        
                        <div className="flex gap-1.5 pt-2 border-t border-slate-950">
                          <button 
                            onClick={() => handleAdvanceApplicationStage(app.id, 'hired')}
                            className="bg-green-600 hover:bg-green-550 text-white p-1 px-1.5 rounded text-[9px] font-mono uppercase font-bold cursor-pointer w-full text-center"
                          >
                            Confirm Hire
                          </button>
                          <button 
                            onClick={() => handleDeclineApplication(app.id)}
                            className="bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-rose-400 p-1 px-1.5 border border-slate-850 rounded text-[9px] font-mono uppercase cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column hired */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col space-y-3 min-h-[300px]">
                  <span className="text-[10px] uppercase font-mono font-bold text-green-400 px-2 border-b border-green-950 pb-1 flex justify-between items-center bg-slate-900/30 p-1 rounded">
                    🏆 HIRED CODES ({applications.filter(a => a.stage === 'hired').length})
                  </span>
                  
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[400px]">
                    {applications.filter(a => a.stage === 'hired').map(app => (
                      <div key={app.id} className="bg-slate-900/60 border border-green-950/80 p-3 rounded-lg space-y-2 text-xs relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-emerald-400 block font-bold">{app.creatorName}</strong>
                            <span className="text-[9px] font-mono text-green-500">Contract Activated</span>
                          </div>
                          <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 italic">Connected into active campaigns and milestones secure.</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CREATOR/JOB SEEKER WORKSPACE DESIGN */}
      {userRole === 'Creator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SEARCH FILTERS LEFT NAVIGATION BAR */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-5 h-fit text-xs">
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block border-b border-slate-850 pb-1">
              Arena Navigation Engine
            </span>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-slate-400">Search Listings</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. video reel artist..."
                  className="w-full bg-slate-900 border border-slate-800 p-2 pl-7 text-[11px] font-mono rounded text-slate-200 outline-none focus:border-yellow-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute top-2.5 left-2" />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] uppercase font-mono text-slate-400">Filter by Niche</label>
              <select
                value={selectedNicheFilter}
                onChange={(e) => setSelectedNicheFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 font-mono text-[11px] rounded text-slate-350 cursor-pointer outline-none"
              >
                <option value="All">All Niche Categories</option>
                <option value="Gaming">Gaming</option>
                <option value="Tech & Lifestyle">Tech & Lifestyle</option>
                <option value="Crypto & Finance">Crypto & Finance</option>
                <option value="Beauty">Beauty</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-slate-400">Filter by Specialized Role</label>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 p-2 font-mono text-[11px] rounded text-slate-350 cursor-pointer outline-none"
              >
                <option value="All">All Creative Roles</option>
                <option value="Video Editor">Video Editor</option>
                <option value="Graphic Designer">Graphic Designer</option>
                <option value="Copywriter">Copywriter</option>
                <option value="Content Creator">Content Creator</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
                <span>Min Trust Score</span>
                <span className="text-yellow-400 font-bold">{minTrustScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(Number(e.target.value))}
                className="w-full cursor-pointer accent-yellow-400"
              />
            </div>

            <div className="pt-2 border-t border-slate-850">
              <form onSubmit={handleSaveMediaPortfolio} className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-slate-400 block">Rich Media Portfolio Link</label>
                <input
                  type="url"
                  value={mediaPortfolioLink}
                  onChange={(e) => setMediaPortfolioLink(e.target.value)}
                  placeholder="https://vimeo.com/..."
                  className="w-full bg-slate-900 border border-slate-800 p-2 text-[10px] font-mono rounded text-slate-200 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] hover:text-white uppercase font-bold font-mono transition-colors rounded"
                >
                  Save Config
                </button>
              </form>
            </div>
          </div>

          {/* ACTIVE EMPLOYMENT CONTRACTS LISTINGS */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex justify-between items-center bg-slate-950/20 p-2.5 px-3 border border-slate-850/60 rounded-xl">
              <span className="text-xs font-mono font-bold text-slate-400">
                Available Employment Positions ({filteredListings.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">SORT BY: NEWEST</span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="bg-slate-950/40 p-8 text-center border border-slate-850 rounded-xl space-y-3">
                <Briefcase className="w-8 h-8 text-slate-650 mx-auto" />
                <p className="text-xs text-slate-400 font-mono">No matching positions found. Adjust filter sliders.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map(job => {
                  const alreadyApplied = applications.some(a => a.jobId === job.id && a.creatorId === userId);
                  return (
                    <div 
                      key={job.id} 
                      className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <span className="p-1 px-1.5 bg-yellow-405/10 text-yellow-400 rounded border border-yellow-400/20 text-[8px] uppercase font-mono font-bold">
                            {job.contractType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-black">{job.niche}</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-mono font-bold uppercase text-slate-200 line-clamp-1">{job.title}</h4>
                          <span className="text-[10px] font-semibold text-slate-400">Sponsor: {job.brandName}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-3">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.skillsRequired.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="p-0.5 px-1 bg-slate-900 border border-slate-850 text-[8px] font-mono text-slate-450 rounded uppercase">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-900 flex justify-between items-center gap-2">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-slate-500 block">Est Payout</span>
                          <span className="text-xs font-mono font-black text-emerald-400">{job.budgetRange}</span>
                        </div>

                        {alreadyApplied ? (
                          <span className="px-3 py-1 bg-slate-900 text-slate-500 border border-slate-850 rounded text-[9px] font-mono uppercase font-black tracking-wider shadow">
                            Applied Screened
                          </span>
                        ) : (
                          <button
                            onClick={() => { soundManager.play('click'); setApplyingJob(job); }}
                            className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 p-1.5 px-3 rounded-lg text-[9px] font-mono uppercase font-extrabold tracking-wider transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                          >
                            Apply Direct
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. ADMIN MATRIX: THE CLIENT MATRIX GRID */}
      {userRole === 'Admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Verified Clients matrix table wrapper */}
            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase text-teal-400 tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-450" /> General Client Matrix (Operations Monitor)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px] text-slate-350 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider">
                      <th className="py-2">Client Participant</th>
                      <th className="py-2">Operational Role</th>
                      <th className="py-2">Rep Score</th>
                      <th className="py-2">Monetization</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {adminClients.map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/40">
                        <td className="py-2 font-bold text-slate-200">{c.name}</td>
                        <td className="py-2 text-slate-400">{c.role}</td>
                        <td className="py-2 text-yellow-400">{c.trustScore}%</td>
                        <td className="py-2">
                          <span className="p-0.5 px-1.5 bg-slate-900 border border-slate-800 text-[8px] uppercase font-black text-rose-400 rounded">
                            {c.tier}
                          </span>
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => handleVerifyClient(c.id)}
                            className={`p-1 rounded text-[8px] font-mono uppercase font-bold tracking-wide cursor-pointer ${
                              c.verified
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            {c.verified ? 'Verified ✓' : 'Audit Lock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Platform Dispute logs review panel */}
            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Platform Escrow Dispute Intercept Logs
              </h3>

              <div className="space-y-3">
                {disputeLogs.map(log => (
                  <div key={log.id} className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between items-center">
                      <span className="p-0.5 px-1.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 text-[8px] uppercase font-bold">
                        Conflict Escrow ID: {log.id}
                      </span>
                      <span className={`text-[9px] uppercase font-extrabold ${
                        log.status === 'Resolved' ? 'text-green-400' : 'text-yellow-400 animate-pulse'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-snug">{log.context}</p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-950">
                      <span>Valued: <strong className="text-slate-300">{log.amount}</strong></span>
                      {log.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveDispute(log.id)}
                          className="bg-green-600 hover:bg-green-550 text-white rounded p-1 px-2 text-[8px] uppercase font-black cursor-pointer shadow"
                        >
                          Perform Arbitration Release
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- INTEGRATED COMMUNICATIONS NODE (RTC CHAT & VOICE ENGINE) --- */}
      {hiringChats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-800">
          
          {/* Active direct hiring chats selector list */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-2.5 h-fit text-xs">
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block border-b border-slate-850 pb-1">
              Active Handshake Chats
            </span>

            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {hiringChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => { soundManager.play('click'); setActiveHiringChat(chat); }}
                  className={`w-full p-2.5 rounded-lg border text-left font-mono text-[11px] leading-snug cursor-pointer transition-colors block ${
                    activeHiringChat?.id === chat.id 
                    ? 'bg-slate-900 border-slate-700 text-slate-200 font-bold' 
                    : 'bg-slate-950 border-slate-900 text-slate-450 hover:bg-slate-900/60 hover:text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="uppercase tracking-wide text-slate-200">{chat.creatorName}</span>
                    <span className="text-[8px] text-slate-500">2 min</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{chat.lastMessage}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CHAT MESSAGING BOX LAYOUT */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-xl p-4 min-h-[300px] flex flex-col justify-between">
            {activeHiringChat ? (
              <div className="flex-1 flex flex-col justify-between h-full">
                
                {/* Chat header area */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{activeHiringChat.creatorAvatar || '🎬'}</span>
                    <div>
                      <h4 className="font-mono font-bold uppercase text-slate-100">{activeHiringChat.creatorName}</h4>
                      <span className="text-[9px] font-mono text-slate-400">Position Context: {activeHiringChat.jobTitle}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInitiateVoiceCall(
                      userRole === 'Brand' ? activeHiringChat.creatorId : activeHiringChat.brandId,
                      userRole === 'Brand' ? activeHiringChat.creatorName : 'Agency Sponsor',
                      userRole === 'Brand' ? activeHiringChat.creatorAvatar : '🍿'
                    )}
                    className="p-1 px-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded flex items-center gap-1.5 text-[9px] uppercase font-mono font-black animate-pulse cursor-pointer shadow hover:scale-105 transition-transform"
                  >
                    <Phone className="w-3.5 h-3.5" /> Direct voice call
                  </button>
                </div>

                {/* Message Streams list */}
                <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto mb-3 pr-1 text-xs">
                  {activeHiringChat.messages.map(msg => {
                    const isSystem = msg.senderId === 'system';
                    const isMe = msg.senderId === userId;
                    return (
                      <div 
                        key={msg.id} 
                        className={`p-2.5 rounded-lg leading-normal ${
                          isSystem 
                          ? 'bg-slate-900/60 border border-slate-850 text-slate-400 text-[10px] text-center italic' 
                          : isMe 
                            ? 'bg-yellow-400/5 text-slate-200 border border-yellow-405/10 ml-8 text-right' 
                            : 'bg-slate-900 text-slate-300 mr-8 text-left border border-slate-850/60'
                        }`}
                      >
                        {!isSystem && (
                          <strong className="text-[9px] uppercase text-slate-450 block mb-0.5">
                            {msg.senderName}
                          </strong>
                        )}
                        <span>{msg.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Input Controls form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder="Enter cryptographic speech message..."
                    className="flex-1 bg-slate-900 border border-slate-800 p-2.5 font-mono text-xs rounded text-slate-100 outline-none focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-350 text-slate-950 font-black p-2 px-4 rounded font-mono text-xs uppercase cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-700" />
                <p className="text-xs font-mono">Select a direct applicant thread context to release communication node keys.</p>
              </div>
            )}
          </div>

        </div>
      )}


      {/* --- FLOATING OVERLAY: MICRO DIALOG VOICE CALL TRANSCEIVER HANDSHAKE --- */}
      <AnimatePresence>
        {activeVoiceCall && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[150] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-green-950 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col"
            >
              {/* Voice top title */}
              <div className="p-3 border-b border-slate-850 bg-slate-950 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="font-extrabold uppercase tracking-wider text-green-400">RedCat WebRTC voice Sync</span>
                </div>
                <span className="text-slate-500 text-[10px]">P2P SYMMETRIC CELL</span>
              </div>

              {/* Central Ring/Speaking content */}
              <div className="p-6 flex flex-col items-center justify-center text-center space-y-5">
                
                {/* Visual Speaking Radar ring indicator */}
                <div className="relative">
                  <div className="absolute -inset-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 blur-md animate-pulse" />
                  <div className="relative bg-slate-950 border-4 border-green-900 rounded-full w-20 h-20 flex items-center justify-center text-4xl shadow-xl">
                    {activeVoiceCall.partnerAvatar}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-100 font-display">{activeVoiceCall.partnerName}</h4>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                    {activeVoiceCall.state === 'outgoing' && 'Initializing Outbound Relay...'}
                    {activeVoiceCall.state === 'connected' && `Duration: ${Math.floor(activeVoiceCall.timer / 60)}:${(activeVoiceCall.timer % 60).toString().padStart(2, '0')} • Active Intercept`}
                    {activeVoiceCall.state === 'completed' && 'Call Suspended Preserved Session log'}
                  </p>
                </div>

                {/* Transcription logs stream */}
                {activeVoiceCall.state === 'connected' && (
                  <div className="w-full space-y-4">
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-[140px] overflow-y-auto text-left font-mono space-y-2 text-[10px] leading-relaxed flex flex-col justify-end">
                      <span className="text-[8px] text-green-400 font-black block border-b border-slate-900 pb-1 mb-1 tracking-widest uppercase">
                        Real-time auto Transcriber briefs:
                      </span>
                      <div className="space-y-2 overflow-y-auto w-full">
                        {activeVoiceCall.transcript.map((t, idx) => (
                          <div key={idx} className={`p-1.5 rounded leading-normal ${t.highlight ? 'bg-green-500/10 border border-green-500/20 text-emerald-300' : 'text-slate-300'}`}>
                            <strong>{t.speaker}:</strong> <span>{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highly Contrast Milestone Securing */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-yellow-500/20 flex flex-col items-center justify-between gap-2.5 text-xs">
                      <div className="text-center font-mono space-y-1">
                        <span className="text-yellow-405 font-black uppercase tracking-widest text-[9px] bg-yellow-400/10 py-1 px-2.5 rounded border border-yellow-400/20 block w-fit mx-auto">
                          ESCROW WRAPPER MILESTONE
                        </span>
                        <p className="text-slate-400 text-[10px] leading-snug">
                          Locked rate proposal: <strong>₹{activeVoiceCall.escrowAmount}</strong> campaign contract package.
                        </p>
                      </div>

                      {activeVoiceCall.escrowLocked ? (
                        <div className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-center font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                          ✓ Escrow Vault Registered Successfully
                        </div>
                      ) : (
                        <button
                          onClick={handleLockCallEscrowMilestone}
                          className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-950 font-mono text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-105 active:scale-95 cursor-pointer block"
                        >
                          🔒 Secure Escrow Milestone
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Close Handshake button */}
                <button
                  onClick={handleDeclineVoiceCall}
                  className="w-full py-2.5 bg-red-950/40 hover:bg-slate-950 text-rose-350 hover:text-white border border-red-950 rounded-xl font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  {activeVoiceCall.state === 'completed' ? 'Return to Board Workspace' : 'Suspend voice communications'}
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: POST ARENA JOB MODAL */}
      <AnimatePresence>
        {isPostJobModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[140] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl relative flex flex-col"
            >
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-200">POST NEW ARENA EMPLOYMENT CONTRACT</span>
                <button onClick={() => setIsPostJobModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>

              <form onSubmit={handlePostJob} className="p-5 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Position Title</label>
                    <input
                      type="text"
                      required
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="e.g. Video Reel Splicer"
                      className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-200 outline-none focus:border-yellow-405"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400">Contract Alignment</label>
                    <select
                      value={newJobContract}
                      onChange={(e) => setNewJobContract(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-350 cursor-pointer outline-none"
                    >
                      <option value="Freelance">Freelance Milestones</option>
                      <option value="Full-time">Full-time Account</option>
                      <option value="Part-time">Part-time Weekly</option>
                      <option value="Internship">Internship Training</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Target Vibe Category</label>
                    <select
                      value={newJobNiche}
                      onChange={(e) => setNewJobNiche(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-350 cursor-pointer outline-none"
                    >
                      <option value="Gaming">Gaming / Pixels</option>
                      <option value="Tech & Lifestyle">Tech & Lifestyle</option>
                      <option value="Crypto & Finance">Crypto & Finance</option>
                      <option value="Beauty">Beauty / Fashion</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400">Role Required</label>
                    <select
                      value={newJobRequiredRole}
                      onChange={(e) => setNewJobRequiredRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-350 cursor-pointer outline-none"
                    >
                      <option value="Video Editor">Video Editor</option>
                      <option value="Graphic Designer">Graphic Designer</option>
                      <option value="Copywriter">Copywriter</option>
                      <option value="Content Creator">Content Creator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Budget / Package Scale</label>
                    <input
                      type="text"
                      required
                      value={newJobBudget}
                      onChange={(e) => setNewJobBudget(e.target.value)}
                      placeholder="e.g. ₹1,200 - ₹3,000"
                      className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400">Min Trust Score Requirement ({newJobTrustRequirement}%)</label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={newJobTrustRequirement}
                      onChange={(e) => setNewJobTrustRequirement(Number(e.target.value))}
                      className="w-full cursor-pointer accent-yellow-440"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={newJobSkills}
                    onChange={(e) => setNewJobSkills(e.target.value)}
                    placeholder="e.g. Premiere Pro, Vector Asset, Copywriting"
                    className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Detailed Position description</label>
                  <textarea
                    required
                    rows={4}
                    value={newJobDescription}
                    onChange={(e) => setNewJobDescription(e.target.value)}
                    placeholder="Describe content delivery rules, expected pacing, milestones, and deliverables..."
                    className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black font-mono text-xs uppercase rounded cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  ✓ Submit Arena Listing
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: APPLY FOR JOB MODAL & COMPILER PARSER */}
      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[140] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl relative flex flex-col"
            >
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-200">APPLY DIRECT FOR ARENA POSITION</span>
                <button onClick={() => setApplyingJob(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>

              {/* Parsing tool section */}
              <div className="p-4 bg-slate-950/40 border-b border-slate-850/80 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-yellow-450 uppercase font-black">⚡ Embedded AI CV / Portfolio Compiler Parser</span>
                  <span className="text-slate-550">AUTOMATIC ENGINE</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={applyPortfolio}
                    onChange={(e) => setApplyPortfolio(e.target.value)}
                    placeholder="https://myportfolio.com/or-pdf-upload"
                    className="flex-1 bg-slate-950 border border-slate-850 p-1.5 px-2.5 font-mono text-[10.5px] rounded text-slate-250 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleParseCV}
                    disabled={isParsingUrl}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 border border-slate-75 * text-[9.5px] font-mono uppercase font-bold rounded cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isParsingUrl ? 'Parsing...' : 'Compile / Parse'}
                  </button>
                </div>
                {parserReport && (
                  <div className="bg-slate-950 p-2 rounded border border-slate-900 font-mono text-[9px] text-emerald-400 leading-snug">
                    <p>{parserReport}</p>
                    {parsedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">EXTRACTED SKILLS:</span>
                        {parsedSkills.map((sk, idx) => (
                          <span key={idx} className="bg-slate-900 text-yellow-405 border border-yellow-500/20 px-1 rounded text-[8px] font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleApplySubmit} className="p-5 space-y-4 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-400 leading-snug space-y-1">
                  <strong className="text-slate-100 uppercase text-[10.5px] block font-bold">{applyingJob.title}</strong>
                  <p>Required Score: <strong className="text-yellow-410">{applyingJob.trustScoreRequired}% Trust Index</strong></p>
                  <p>Budget Allocation: <strong className="text-emerald-400">{applyingJob.budgetRange}</strong></p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400">Introduce Your Creative Strengths (Cover Letter)</label>
                  <textarea
                    required
                    rows={4}
                    value={applyCoverLetter}
                    onChange={(e) => setApplyCoverLetter(e.target.value)}
                    placeholder="Mention customizer specs, platform streak count, niche deliverables expertise, or fast turnarounds..."
                    className="w-full bg-slate-950 border border-slate-850 p-2 font-mono text-xs rounded text-slate-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black font-mono text-xs uppercase rounded cursor-pointer"
                >
                  ✓ Submit Application Screen
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
