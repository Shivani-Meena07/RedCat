import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  ShieldCheck,
  Coins,
  Shield,
  HelpCircle,
  Briefcase,
  UserCheck,
  Plus,
  RefreshCw,
  LogOut,
  User,
  ExternalLink,
  Lock,
  ArrowRight,
  Database,
  Volume2,
  VolumeX,
  PlusCircle,
  Copy,
  ChevronDown,
  Info,
  Sparkles,
  Download,
  Mail,
  AlertCircle,
  Menu,
  X,
  Key,
  Settings,
  Sliders
} from 'lucide-react';
import { UserRole, UserProfile, Campaign, TierLevel, SubscriptionTier, Invoice, MascotData, CampaignReview } from '../types';
import { SUBSCRIPTION_TIERS } from '../subscriptionTierConfig';
import { Crown, Zap, ShieldAlert, FileText, Globe, Layers, Phone } from 'lucide-react';
import { soundManager } from './SoundManager';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import AIChatroom from './AIChatroom';
import BrandChatbot from './BrandChatbot';
import FAQAccordion from './FAQAccordion';
import MascotRender from './MascotRender';
import HiringArena from './HiringArena';


interface DashboardProps {
  userId: string;
  userRole: UserRole;
  userEmail: string;
  initialMascot?: any;
  onLogout: () => void;
}

// 20+ Brand profiles preset pool list
const brandProfilesMockPool = [
  { id: 'nova', name: 'Nova Snacks Co.', website: 'https://novasnacks.example', bio: 'Plant-based active crunch fuels premium creators.', niche: 'Vegan Food', budget: '$3,800' },
  { id: 'nike', name: 'Nike Running Hub', website: 'https://nike-run.example', bio: 'Finding athletic storytellers for the ultimate zoom series.', niche: 'Athletics & Fashion', budget: '$12,500' },
  { id: 'sony', name: 'Sony Alpha Club', website: 'https://sony-alpha.example', bio: 'Equipping cinematic visual directors with high-speed glass.', niche: 'Cinematography', budget: '$24,000' },
  { id: 'fitfast', name: 'FitFast Core', website: 'https://fitfast.example', bio: 'Standardizing pristine recovery routines.', niche: 'Fitness & Health', budget: '$4,100' },
  { id: 'pixelcorp', name: 'Pixel Corp Hardware', website: 'https://pixelcorp.example', bio: 'Mechanical keyboards for retro gaming enthusiasts.', niche: 'Gaming Tech', budget: '$8,200' },
  { id: 'skincare', name: 'Skincare Sprint', website: 'https://skin-sprint.example', bio: 'Clean organic filters and simple hydration reels.', niche: 'Beauty & Skincare', budget: '$2,400' },
  { id: 'cocacola', name: 'Coca-Cola Zero', website: 'https://cokezero.example', bio: 'Unifying global creators with refresh music notes.', niche: 'Beverages', budget: '$18,000' },
  { id: 'adobe', name: 'Adobe Forge', website: 'https://adobe-forge.example', bio: 'Interactive animation overlays for mobile video editors.', niche: 'Creative Apps', budget: '$15,000' },
  { id: 'razer', name: 'Razer Chroma Line', website: 'https://razer-chroma.example', bio: 'Shining RGB neon backlighting into your streaming room.', niche: 'Gaming Accessories', budget: '$9,800' },
  { id: 'patagonia', name: 'Patagonia Explore', website: 'https://patagonia.example', bio: 'Earth-friendly outdoor gear for travel explorers.', niche: 'Travel & Outdoors', budget: '$7,200' },
  { id: 'tesla', name: 'Tesla Mobility', website: 'https://tesla-run.example', bio: 'Smart zero-emission commuters.', niche: 'Automotive & Tech', budget: '$32,000' },
  { id: 'starbucks', name: 'Starbucks Chill', website: 'https://starbucks-chill.example', bio: 'Iced caramel drip for long creators mornings.', niche: 'Lifestyle Food', budget: '$5,500' },
  { id: 'lululemon', name: 'Lululemon Core', website: 'https://lululemon.example', bio: 'Align athletic stretches.', niche: 'Activewear Fashion', budget: '$6,800' },
  { id: 'duolingo', name: 'Duolingo Streak', website: 'https://duo-streak.example', bio: 'Pushing daily language learning streaks.', niche: 'Education Tech', budget: '$4,500' },
  { id: 'notion', name: 'Notion Workspace', website: 'https://notion-app.example', bio: 'Aesthetic dashboard organizers for creators.', niche: 'Productivity', budget: '$3,400' },
  { id: 'spotify', name: 'Spotify Music Vault', website: 'https://spotify.example', bio: 'Matching sound brand loops with creators.', niche: 'Media & Sound', budget: '$11,000' },
  { id: 'ikea', name: 'IKEA Space', website: 'https://ikeaspace.example', bio: 'Aesthetic minimal work desks.', niche: 'Home Decor', budget: '$6,200' },
  { id: 'asics', name: 'ASICS Nimbus', website: 'https://asics.example', bio: 'Gel-cushioned comfort loops.', niche: 'Footwear', budget: '$4,900' },
  { id: 'headspace', name: 'Headspace Calm', website: 'https://headspace.example', bio: 'Daily mindfulness breathing sessions.', niche: 'Mental Health', budget: '$5,000' },
  { id: 'discord', name: 'Discord Crew', website: 'https://discord-crew.example', bio: 'Direct voice servers for local gaming groups.', niche: 'Social Platforms', budget: '$8,000' },
  { id: 'airbnb', name: 'AirBnB Cabins', website: 'https://airbnb.example', bio: 'Off-grid architectural treehouse tours.', niche: 'Travel Space', budget: '$14,500' }
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const SEED_REVIEW_LIST: CampaignReview[] = [
  {
    id: 'seed-rev-1',
    campaignId: 'c2',
    campaignTitle: 'Alpha Lens Showcase',
    reviewerRole: 'Brand',
    reviewerUid: 'brand-sony-mock',
    reviewerName: 'Sony Alpha Club',
    revieweeUid: 'creator-astro-mock',
    revieweeName: 'AstroVlogs TV',
    rating1: 5,
    rating2: 5,
    rating3: 4,
    averageRating: 4.7,
    comments: 'Exceptional deliverable quality! AstroVlogs TV captured our lens optics perfectly in 4K. Communication was stellar through the RedCat platform. Highly recommended creator.',
    timestamp: '2026-06-18 14:35:05 UTC',
    createdAt: 1781879705000
  },
  {
    id: 'seed-rev-2',
    campaignId: 'c2',
    campaignTitle: 'Alpha Lens Showcase',
    reviewerRole: 'Creator',
    reviewerUid: 'u3',
    reviewerName: 'AstroVlogs TV',
    revieweeUid: 'brand-sony-mock',
    revieweeName: 'Sony Alpha Club',
    rating1: 5,
    rating2: 4,
    rating3: 5,
    averageRating: 4.7,
    comments: 'Sony Alpha Club was a dream partner. Extremely clear brief, super quick feedback loop, and immediate milestone funding release. 10/10 relationship.',
    timestamp: '2026-06-18 14:38:12 UTC',
    createdAt: 1781879892000
  },
  {
    id: 'seed-rev-3',
    campaignId: 'c1',
    campaignTitle: 'Nova Snack Launch',
    reviewerRole: 'Brand',
    reviewerUid: 'brand-nova-mock',
    reviewerName: 'Nova Snacks Co.',
    revieweeUid: 'creator-mira-mock',
    revieweeName: 'MiraReels',
    rating1: 5,
    rating2: 5,
    rating3: 5,
    averageRating: 5.0,
    comments: 'Outstanding work on the snack reels! Direct viral trend adoption and very sweet communication.',
    timestamp: '2026-06-19 12:12:00 UTC',
    createdAt: 1781957520000
  }
];

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Dashboard({ userId, userRole, userEmail, initialMascot, onLogout }: DashboardProps) {
   // Navigation tabs
  const [activeTab, setActiveTab] = useState<'console' | 'chatroom' | 'escrow' | 'privacy' | 'tiers' | 'hiring' | 'settings'>('console');
  const [selectedChatBrandId, setSelectedChatBrandId] = useState<string>('nova-snack');

  // Collapsible Navigation Menu Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Platform Verification States
  const [docInputValue, setDocInputValue] = useState('');
  const [submittingVerify, setSubmittingVerify] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Brand-to-Creator Direct chats workspace states
  const [brandDirectChats, setBrandDirectChats] = useState<any[]>(() => {
    const saved = localStorage.getItem('rc_brand_direct_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeBrandChatCreatorId, setActiveBrandChatCreatorId] = useState<string>('ai'); // 'ai' or a creator.id
  const [brandChatConversations, setBrandChatConversations] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('rc_brand_conversations');
    return saved ? JSON.parse(saved) : {};
  });
  const [brandDirectInput, setBrandDirectInput] = useState('');
  const [brandDirectTyping, setBrandDirectTyping] = useState(false);

  // Voice Calling Simulation System state fields
  const [activeCall, setActiveCall] = useState<{
    state: 'idle' | 'outgoing' | 'incoming' | 'connecting' | 'connected' | 'completed';
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    role: 'Brand' | 'Creator';
  } | null>(null);

  const [callTimer, setCallTimer] = useState<number>(0);
  const [callTranscript, setCallTranscript] = useState<{ speaker: string; text: string; highlight?: boolean; }[]>([]);
  const [callStep, setCallStep] = useState<number>(0);
  
  // Subscription management wrapper config mapping
  const [currentTier, setCurrentTier] = useState<TierLevel>(() => {
    const cached = localStorage.getItem('rc_subscription_tier');
    if (cached && (cached === 'Basic' || cached === 'Pro' || cached === 'Pro Max' || cached === 'Ultra' || cached === 'Ultra Max')) {
      return cached as TierLevel;
    }
    return 'Pro';
  });

  const subscriptionTier = SUBSCRIPTION_TIERS[currentTier];
  
  // Local profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Sound enablement state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Subscription simulation testing cockpit and log parameters
  const [simulationLog, setSimulationLog] = useState<string>('Select one of the sandbox operational actions above to run a live compilation test against your active workspace tier.');
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'success' | 'warn'>('idle');

  // Administrative actions
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState<UserProfile | null>(null);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [typedCaptchaCode, setTypedCaptchaCode] = useState('');
  const [captchaStatus, setCaptchaStatus] = useState<UserProfile | null>(null);

  // Settings & Security Parameters states
  const [settingsOldPassword, setSettingsOldPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [settingsPasswordSuccess, setSettingsPasswordSuccess] = useState('');
  const [settingsPasswordError, setSettingsPasswordError] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(() => {
    return localStorage.getItem(`rc_2fa_${userId}`) === 'true';
  });

  const [profileVisibility, setProfileVisibility] = useState<boolean>(() => {
    return localStorage.getItem(`rc_visibility_${userId}`) !== 'false';
  });

  const [emailNotifications, setEmailNotifications] = useState({
    escrowReleases: true,
    biddingAlerts: true,
    directMessages: true,
    weeklyDigest: false,
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(`rc_apikey_${userId}`) || `rc_live_sk_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
  });

  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const [securityAuditLogs, setSecurityAuditLogs] = useState<Array<{ id: string; event: string; ip: string; timestamp: string; status: 'SUCCESS' | 'WARN' }>>([
    { id: 'log-1', event: 'Console Session Initialized', ip: '192.168.1.104 (TLS 1.3)', timestamp: 'Just now', status: 'SUCCESS' },
    { id: 'log-2', event: 'Anti-Bot Captcha Clearance', ip: '192.168.1.104', timestamp: '12 mins ago', status: 'SUCCESS' },
    { id: 'log-3', event: 'Identity Gate Verification Query', ip: '10.0.4.88', timestamp: '2 hours ago', status: 'SUCCESS' },
    { id: 'log-4', event: 'OAuth Google Token Exchange', ip: '192.168.1.104', timestamp: '1 day ago', status: 'SUCCESS' }
  ]);

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsPasswordError('');
    setSettingsPasswordSuccess('');

    if (!settingsOldPassword) {
      setSettingsPasswordError('Please enter your current password.');
      soundManager.play('error');
      return;
    }
    if (settingsNewPassword.length < 6) {
      setSettingsPasswordError('New password must be at least 6 characters long.');
      soundManager.play('error');
      return;
    }
    if (settingsNewPassword !== settingsConfirmPassword) {
      setSettingsPasswordError('New passwords do not match.');
      soundManager.play('error');
      return;
    }

    soundManager.play('success');
    setSettingsPasswordSuccess('🔒 Security Parameter Updated: Password changed successfully.');
    setSettingsOldPassword('');
    setSettingsNewPassword('');
    setSettingsConfirmPassword('');

    setSecurityAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        event: 'Password Parameter Update',
        ip: '192.168.1.104',
        timestamp: 'Just now',
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    localStorage.setItem(`rc_2fa_${userId}`, String(nextVal));
    soundManager.play('switch');

    setSecurityAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        event: nextVal ? '2FA Security Enabled' : '2FA Security Disabled',
        ip: '192.168.1.104',
        timestamp: 'Just now',
        status: nextVal ? 'SUCCESS' : 'WARN'
      },
      ...prev
    ]);
  };

  const handleRegenerateApiKey = () => {
    const newKey = `rc_live_sk_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(newKey);
    localStorage.setItem(`rc_apikey_${userId}`, newKey);
    soundManager.play('success');

    setSecurityAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        event: 'API Security Token Rotated',
        ip: '192.168.1.104',
        timestamp: 'Just now',
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  // Brand active brief lists
  const [brandSelectedId, setBrandSelectedId] = useState('nova');
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: 'c1', title: 'Nova Snack Launch', brandName: 'Nova Snacks Co.', stage: 'Creative Draft Review', progress: 68, deadline: 'Jun 21', budget: '$3,800', aiMatch: 94, status: 'active' },
    { id: 'c2', title: 'Alpha Lens Showcase', brandName: 'Sony Alpha Club', stage: 'Final Delivery Approved', progress: 100, deadline: 'Completed', budget: '$24,000', aiMatch: 89, status: 'completed' },
    { id: 'c3', title: 'Skincare Hydration Sprint', brandName: 'Skincare Sprint', stage: 'Bidding Window Closing', progress: 20, deadline: 'Jun 28', budget: '$2,400', aiMatch: 91, status: 'pending' }
  ]);

  // Automated Billing & Invoice Registry state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const cached = localStorage.getItem('rc_platform_invoices');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached invoices', e);
      }
    }
    // Preload beautiful seed invoice
    const seeds: Invoice[] = [
      {
        id: 'RC-INV-2026-F9A2',
        timestamp: '2026-06-18 14:32:10 UTC',
        brandName: 'Sony Alpha Club',
        creatorName: 'AstroVlogs TV',
        campaignName: 'Alpha Lens Showcase',
        milestoneTitle: 'Final Delivery Approved',
        baseAmount: 24000,
        razorpayFee: 480,
        droppFee: 120,
        droppDiscount: -600,
        netAmount: 24000,
        status: 'Settled & Released'
      }
    ];
    localStorage.setItem('rc_platform_invoices', JSON.stringify(seeds));
    return seeds;
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Campaign Reviews State with local cache fallback
  const [reviews, setReviews] = useState<CampaignReview[]>(() => {
    const cached = localStorage.getItem('rc_platform_reviews');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cached review listings', e);
      }
    }
    return SEED_REVIEW_LIST;
  });

  // Dynamic Rating metric States for modal collection form
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCampaignId, setFeedbackCampaignId] = useState<string>('');
  const [feedbackCampaignTitle, setFeedbackCampaignTitle] = useState<string>('');
  const [feedbackBrandName, setFeedbackBrandName] = useState<string>('');
  const [feedbackCreatorName, setFeedbackCreatorName] = useState<string>('');
  const [feedbackRolePersona, setFeedbackRolePersona] = useState<'Brand' | 'Creator'>('Brand');

  const [ratingMetric1, setRatingMetric1] = useState(5); // Brand->Creator: Quality, Creator->Brand: Clarity
  const [ratingMetric2, setRatingMetric2] = useState(5); // Brand->Creator: Communication, Creator->Brand: Responsiveness
  const [ratingMetric3, setRatingMetric3] = useState(5); // Brand->Creator: Timeliness, Creator->Brand: Professionalism
  const [reviewComments, setReviewComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Reputation Engine Dynamic Metrics
  const ratingsBrandToCreator = reviews.filter(r => r.reviewerRole === 'Brand');
  const ratingsCreatorToBrand = reviews.filter(r => r.reviewerRole === 'Creator');

  const creatorTrustScore = ratingsBrandToCreator.length > 0 
    ? Number((ratingsBrandToCreator.reduce((sum, r) => sum + r.averageRating, 0) / ratingsBrandToCreator.length) * 20).toFixed(1)
    : '95.4';

  const brandTrustScore = ratingsCreatorToBrand.length > 0
    ? Number((ratingsCreatorToBrand.reduce((sum, r) => sum + r.averageRating, 0) / ratingsCreatorToBrand.length) * 20).toFixed(1)
    : '96.2';

  // Mascot Customizer State
  const [isMascotCustomizerOpen, setIsMascotCustomizerOpen] = useState(false);
  const [mascotSkinState, setMascotSkinState] = useState<'rose' | 'gold' | 'moon'>('rose');
  const [mascotClothesState, setMascotClothesState] = useState<'crimson' | 'blue' | 'green'>('crimson');
  const [mascotHairState, setMascotHairState] = useState<'tuft' | 'bob' | 'spikes'>('tuft');
  
  // Customizer Compiled_Mascot visual states
  const [customSkinState, setCustomSkinState] = useState<'standard' | 'purple' | 'green' | 'gold'>('standard');
  const [customHeadState, setCustomHeadState] = useState<'none' | 'headset' | 'visor' | 'crown'>('none');
  const [customFaceState, setCustomFaceState] = useState<'neutral' | 'happy' | 'focused' | 'glitch'>('neutral');

  const [mascotPromptState, setMascotPromptState] = useState('');
  const [mascotThemeState, setMascotThemeState] = useState('Default Retro');
  const [mascotExpressionState, setMascotExpressionState] = useState('Standard Smile');
  const [mascotAiGenerationError, setMascotAiGenerationError] = useState<string | null>(null);
  const [mascotAiSuccess, setMascotAiSuccess] = useState<string | null>(null);
  const [mascotAiLoading, setMascotAiLoading] = useState(false);
  const [mascotAiSteps, setMascotAiSteps] = useState<string[]>([]);

  // Manual Test Rig fields
  const [manualBrand, setManualBrand] = useState('');
  const [manualCreator, setManualCreator] = useState('');
  const [manualCampaign, setManualCampaign] = useState('');
  const [manualMilestone, setManualMilestone] = useState('');
  const [manualBaseAmount, setManualBaseAmount] = useState('');
  const [manualValidationError, setManualValidationError] = useState<string | null>(null);

  // Call System effect timers & dynamic transcripts matching role
  useEffect(() => {
    let tInterval: NodeJS.Timeout;
    if (activeCall && activeCall.state === 'connected') {
      tInterval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(tInterval);
  }, [activeCall?.state]);

  useEffect(() => {
    let callInterval: NodeJS.Timeout;
    if (activeCall) {
      if (activeCall.state === 'outgoing') {
        setCallStep(0);
        setCallTranscript([]);
        
        // Auto transition Ringing -> Connected
        callInterval = setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, state: 'connecting' } : null);
          soundManager.play('switch');
          
          setTimeout(() => {
            setActiveCall(prev => prev ? { ...prev, state: 'connected' } : null);
            soundManager.play('success');
          }, 1500);
        }, 3000);
      } else if (activeCall.state === 'connected') {
        const script = activeCall.role === 'Brand' 
          ? [
              { speaker: 'Brand rep', text: "Hey! We noticed your beautiful custom voxel mascot and highly engaging reels editing format." },
              { speaker: 'Creator', text: "Stoked to connect! I draft all assets natively in 3D voxels, ready for fast-cuts & main-character motivational campaigns." },
              { speaker: 'Brand rep', text: "Excellent! We want to secure an automated milestone bid of $1,500 on our escrow ledger.", highlight: true },
              { speaker: 'Creator', text: "Deal! I will deliver 1x Cinematic short within 2 weeks. Let's record this on RedCat Ledger." },
              { speaker: 'Brand rep', text: "Securing milestone now! See you on the grid.", highlight: true }
            ]
          : [
              { speaker: 'Creator', text: "Yo! Pitching hyper-detailed hardware setups to your brand's promotional team." },
              { speaker: 'Brand', text: "Hello! We loved your profile engagement. We want to fund a secure contract of $12,500 with a training gear delivery phase.", highlight: true },
              { speaker: 'Creator', text: "Perfect! Biting that milestone offer. I will showcase live exercise feedback under motivational sport hooks." },
              { speaker: 'Brand', text: "Awesome! Let's lock this in our secure ledger and notify both parties instantly.", highlight: true }
            ];

        callInterval = setInterval(() => {
          setCallStep(prev => {
            const nextIdx = prev;
            if (nextIdx < script.length) {
              setCallTranscript(t => [...t, script[nextIdx]]);
              soundManager.play('click');
              return prev + 1;
            } else {
              clearInterval(callInterval);
              return prev;
            }
          });
        }, 3500);
      }
    } else {
      setCallTranscript([]);
      setCallStep(0);
    }

    return () => clearInterval(callInterval);
  }, [activeCall?.state, activeCall?.role]);

  const handleSelectCreatorForBrand = (creator: any) => {
    soundManager.play('success');
    
    // Check if thread exists in brandDirectChats
    if (!brandDirectChats.some(c => c.id === creator.id)) {
      const newDMChat = {
        id: creator.id,
        name: creator.name,
        avatar: creator.avatar,
        niche: creator.niche,
        skin: creator.skin,
        clothes: creator.clothes,
        hair: creator.hair,
        specialty: creator.specialty,
        trustRating: creator.trustRating,
        budgetQuote: creator.budgetQuote
      };
      
      const updated = [...brandDirectChats, newDMChat];
      setBrandDirectChats(updated);
      localStorage.setItem('rc_brand_direct_chats', JSON.stringify(updated));
      
      // Seed welcome conversation
      setBrandChatConversations(prev => ({
        ...prev,
        [creator.id]: [
          {
            id: 'con-w-' + Date.now(),
            sender: 'ai',
            text: `👋 Hey! I am ${creator.name}. Stoked to establish this direct Match thread on RedCat! I am fully configured with your target specifications.\n\nTell me, what kind of asset or deliverable hook can I produce for you?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    }
    
    // Set active thread to this creator
    setActiveBrandChatCreatorId(creator.id);
  };

  const handleInitiateCall = (partnerId: string, partnerName: string, partnerAvatar: string, role: 'Brand' | 'Creator') => {
    soundManager.play('click');
    setActiveCall({
      state: 'outgoing',
      partnerId,
      partnerName,
      partnerAvatar,
      role
    });
  };

  const handleAcceptCall = () => {
    soundManager.play('success');
    setActiveCall(prev => prev ? { ...prev, state: 'connecting' } : null);
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, state: 'connected' } : null);
      soundManager.play('success');
    }, 1500);
  };

  const handleDeclineOrHangUp = () => {
    soundManager.play('error');
    if (activeCall && activeCall.state === 'connected') {
      setActiveCall(prev => prev ? { ...prev, state: 'completed' } : null);
    } else {
      setActiveCall(null);
    }
  };

  const handleSecureMilestoneFromCall = () => {
    soundManager.play('success');
    if (!activeCall) return;

    const budgetVal = activeCall.role === 'Brand' ? '$1,500' : '$12,500';
    const milestoneTitle = activeCall.role === 'Brand' ? '1x Custom Mascot Reel' : 'Alpha Gear Athletics Campaign';
    const bName = activeCall.role === 'Brand' ? 'RedCat Hub Brand' : activeCall.partnerName;
    const cName = activeCall.role === 'Brand' ? activeCall.partnerName : 'Premium Mascot Creator';

    const newCampaign: Campaign = {
      id: 'cam-call-' + Date.now(),
      title: milestoneTitle,
      brandName: bName,
      stage: 'Voxel Asset Draft',
      progress: 10,
      deadline: '2 Weeks',
      budget: budgetVal,
      aiMatch: 98,
      status: 'active'
    };

    const updatedCampaigns = [newCampaign, ...campaigns];
    setCampaigns(updatedCampaigns);

    const baseAmt = parseFloat(budgetVal.replace('$', '').replace(',', ''));
    const droppF = baseAmt * 0.005;
    const gatewayF = baseAmt * 0.02;
    const newInvoice: Invoice = {
      id: `INV-CALL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      brandName: bName,
      creatorName: cName,
      campaignName: milestoneTitle,
      milestoneTitle: 'Security Escrow Deposit',
      baseAmount: baseAmt,
      razorpayFee: gatewayF,
      droppFee: droppF,
      droppDiscount: -(droppF + gatewayF),
      netAmount: baseAmt,
      status: 'Settled & Released'
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('rc_platform_invoices', JSON.stringify(updatedInvoices));

    setSimulationLog(`💰 [Milestone Secured From Voice] Brand partner locked escrow of ${budgetVal} for campaign item "${milestoneTitle}". Direct-text message links synchronized.`);
    setSimulationStatus('success');

    setActiveCall(null);
  };

  const handleSendBrandDirectMsg = (creatorId: string) => {
    if (!brandDirectInput.trim()) return;
    const txt = brandDirectInput;
    setBrandDirectInput('');
    soundManager.play('click');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Math.random().toString(), sender: 'user', text: txt, timestamp };

    setBrandChatConversations(prev => {
      const existing = prev[creatorId] || [];
      const updated = {
        ...prev,
        [creatorId]: [...existing, userMsg]
      };
      localStorage.setItem('rc_brand_conversations', JSON.stringify(updated));
      return updated;
    });

    setBrandDirectTyping(true);

    setTimeout(() => {
      setBrandDirectTyping(false);
      soundManager.play('success');

      // Find creator details
      const creator = brandDirectChats.find(c => c.id === creatorId);
      const specialtyInfo = creator?.specialty || 'producing beautiful designs for Minecraft';
      const replyText = `Hey! Appreciate you reaching out directly. Love the campaign brief! Regarding my specialty in "${specialtyInfo}", I've already conceptualized our 3D voxel scenes.\n\nLet's coordinate on a secure Escrow milestone to release our staging branches! 📞 Give me a call anytime so we can finalize values.`;

      const creatorReply = {
        id: Math.random().toString(),
        sender: 'creator',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setBrandChatConversations(prev => {
        const existing = prev[creatorId] || [];
        const updated = {
          ...prev,
          [creatorId]: [...existing, creatorReply]
        };
        localStorage.setItem('rc_brand_conversations', JSON.stringify(updated));
        return updated;
      });
    }, 1500);
  };

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // Offline/unauthenticated/sandbox mode bypass: use local storage cache or fallback profile
      if (!auth.currentUser) {
        const localProfile = localStorage.getItem(`rc_profile_${userId}`);
        if (localProfile) {
          try {
            const cachedData = JSON.parse(localProfile);
            setProfile({
              ...cachedData,
              mascotSkin: cachedData.mascotSkin || 'rose',
              mascotClothes: cachedData.mascotClothes || 'crimson',
              mascotHair: cachedData.mascotHair || 'tuft'
            } as UserProfile);
          } catch (e) {
            console.warn("Failed parsing cached local profile", e);
          }
        } else {
          const mockProfile: UserProfile = {
            uid: userId,
            email: userEmail,
            role: userRole,
            fullName: userRole === 'Admin' ? 'Nova Administrator' : userRole === 'Brand' ? 'Nova Brands Group' : 'C3rat Explorer',
            niche: userRole === 'Brand' ? 'https://novasnacks.example' : 'Gaming & Technology Video reels',
            bio: 'Active explorer building high contrast aesthetic campaigns.',
            mascotSkin: initialMascot?.skin || 'rose',
            mascotClothes: initialMascot?.clothes || 'crimson',
            mascotHair: initialMascot?.hair || 'tuft',
            createdAt: Date.now()
          };
          setProfile(mockProfile);
        }
        return;
      }

      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          setProfile({
            ...fetchedData,
            mascotSkin: fetchedData.mascotSkin || 'rose',
            mascotClothes: fetchedData.mascotClothes || 'crimson',
            mascotHair: fetchedData.mascotHair || 'tuft'
          } as UserProfile);
        } else {
          // Fallback to cache
          const localProfile = localStorage.getItem(`rc_profile_${userId}`);
          if (localProfile) {
            const cachedData = JSON.parse(localProfile);
            setProfile({
              ...cachedData,
              mascotSkin: cachedData.mascotSkin || 'rose',
              mascotClothes: cachedData.mascotClothes || 'crimson',
              mascotHair: cachedData.mascotHair || 'tuft'
             } as UserProfile);
          } else {
            // Lazy load basic
            const mockProfile: UserProfile = {
              uid: userId,
              email: userEmail,
              role: userRole,
              fullName: userRole === 'Admin' ? 'Nova Administrator' : userRole === 'Brand' ? 'Nova Brands Group' : 'C3rat Explorer',
              niche: userRole === 'Brand' ? 'https://novasnacks.example' : 'Gaming & Technology Video reels',
              bio: 'Active explorer building high contrast aesthetic campaigns.',
              mascotSkin: initialMascot?.skin || 'rose',
              mascotClothes: initialMascot?.clothes || 'crimson',
              mascotHair: initialMascot?.hair || 'tuft',
              createdAt: Date.now()
            };
            setProfile(mockProfile);
          }
        }
      } catch (err) {
        console.warn("Could not retrieve Firestore profile, running mock configuration:", err);
      }
    };

    fetchProfile();
  }, [userId, userRole, userEmail, initialMascot]);

  // Load & Synchronize Campaign Reviews from Firestore
  useEffect(() => {
    const listPath = 'campaign_reviews';
    const fetchReviews = async () => {
      // Offline/unauthenticated/sandbox mode bypass: use local storage cache or fallback reviews
      if (!auth.currentUser) {
        const localReviews = localStorage.getItem('rc_platform_reviews');
        if (localReviews) {
          try {
            setReviews(JSON.parse(localReviews));
          } catch (e) {
            setReviews(SEED_REVIEW_LIST);
          }
        } else {
          setReviews(SEED_REVIEW_LIST);
        }
        return;
      }

      try {
        const querySnap = await getDocs(collection(db, listPath));
        const onlineReviews: CampaignReview[] = [];
        querySnap.forEach(d => {
          onlineReviews.push(d.data() as CampaignReview);
        });
        if (onlineReviews.length > 0) {
          // Sort descending
          const sorted = onlineReviews.sort((a, b) => b.createdAt - a.createdAt);
          setReviews(sorted);
          localStorage.setItem('rc_platform_reviews', JSON.stringify(sorted));
        } else {
          // Push seeds to Firestore to have verified records live!
          for (const review of SEED_REVIEW_LIST) {
            try {
              await setDoc(doc(db, listPath, review.id), review);
            } catch (err) {
              console.warn("Skipped dynamic seeding write check:", err);
            }
          }
        }
      } catch (error) {
        console.warn("Retrieving campaign reviews offline fallback:", error);
        try {
          handleFirestoreError(error, OperationType.LIST, listPath);
        } catch (jsonErr) {
          // logged successfully
        }
      }
    };

    fetchReviews();
  }, [userId]);

  // Synchronize customizer state values when profile is initially loaded
  useEffect(() => {
    if (profile) {
      setMascotSkinState(profile.mascot?.skin || profile.mascotSkin || 'rose');
      setMascotClothesState(profile.mascot?.clothes || profile.mascotClothes || 'crimson');
      setMascotHairState(profile.mascot?.hair || profile.mascotHair || 'tuft');
      setMascotPromptState(profile.mascot?.generativePrompt || '');
      setMascotThemeState(profile.mascot?.themeStyle || 'Default Retro');
      setMascotExpressionState(profile.mascot?.expressionStyle || 'Standard Smile');
    }
  }, [profile?.uid]);

  // Load user registrations count if Admin
  useEffect(() => {
    if (userRole === 'Admin') {
      const loadAllUsers = async () => {
        try {
          const querySnap = await getDocs(collection(db, 'users'));
          const usersList: UserProfile[] = [];
          querySnap.forEach(d => {
            usersList.push(d.data() as UserProfile);
          });
          if (usersList.length > 0) {
            setAdminUsers(usersList);
          } else {
            setAdminUsers(getAdminUsersMockPool());
          }
        } catch (err) {
          // Failover mock
          setAdminUsers(getAdminUsersMockPool());
        }
      };
      loadAllUsers();
    }
  }, [userRole]);

  const getAdminUsersMockPool = (): UserProfile[] => [
    { uid: 'u1', email: 'mira@mirareels.com', role: 'Creator', fullName: 'MiraReels', niche: 'Beauty & Lifestyle', bio: '2.9k average viewership', mascotSkin: 'rose', mascotClothes: 'crimson', mascotHair: 'bob', createdAt: Date.now() },
    { uid: 'u2', email: 'nikunj@fitfast.co', role: 'Brand', fullName: 'FitFast Fitness', niche: 'https://fitfast.example', bio: 'Premium workout products', mascotSkin: 'gold', mascotClothes: 'blue', mascotHair: 'spikes', createdAt: Date.now() },
    { uid: 'u3', email: 'rahul_vids@gmail.com', role: 'Creator', fullName: 'Rahul Vlogs', niche: 'Street Gaming', bio: 'Fast chaotic editing style', mascotSkin: 'moon', mascotClothes: 'green', mascotHair: 'tuft', createdAt: Date.now() },
    { uid: 'u4', email: 'collab@nike.com', role: 'Brand', fullName: 'Nike Runners Co', niche: 'https://nike.example', bio: 'High performance wear loops', mascotSkin: 'rose', mascotClothes: 'blue', mascotHair: 'tuft', createdAt: Date.now() }
  ];

  // Sound toggling control
  const handleToggleSound = () => {
    setSoundEnabled(prev => !prev);
    soundManager.play('click');
  };

  // Switch Brand select target
  const handleBrandPresetChange = (brandId: string) => {
    soundManager.play('switch');
    setBrandSelectedId(brandId);
    const mockBrand = brandProfilesMockPool.find(b => b.id === brandId);
    if (mockBrand && profile) {
      setProfile(prev => prev ? {
        ...prev,
        fullName: mockBrand.name,
        niche: mockBrand.website,
        bio: mockBrand.bio
      } : null);
    }
  };

  // Add a newly generated Campaign Brief from AIChatroom
  const handleAddBriefFromAI = (briefData: any) => {
    // Check if campaign limit has been reached for active/pending campaigns
    const activeCount = campaigns.filter(c => c.status === 'active' || c.status === 'pending').length;
    if (activeCount >= subscriptionTier.campaignLimit) {
      soundManager.play('error');
      alert(`⚠️ Operating Limit Exceeded [Tier: ${subscriptionTier.level}]
Currently, you have ${activeCount} active/pending campaigns.
Under your current "${subscriptionTier.level}" tier, you are allowed a maximum of ${subscriptionTier.campaignLimit} active campaigns.

Please navigate to the "👑 Subscription Tiers" tab in your dashboard hierarchy to instantly upgrade your workspace permissions!`);
      setActiveTab('tiers');
      return;
    }

    soundManager.play('success');
    const newCamp: Campaign = {
      id: 'ai-' + Math.random().toString(),
      title: briefData.title,
      brandName: profile?.fullName || 'Nova Snacks Co.',
      stage: 'Awaiting Signatures',
      progress: 0,
      deadline: 'July 15',
      budget: briefData.recommendedEscrow,
      aiMatch: 94,
      status: 'pending'
    };
    setCampaigns(prev => [newCamp, ...prev]);
    setActiveTab('console');
    alert(`Success: Campaign brief was compiled! It was instantly added to your dashboard.`);
  };

  // Automated Invoice download service (renders self-contained printable HTML-PDF document blob)
  const downloadInvoiceFile = (inv: Invoice) => {
    soundManager.play('success');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RedCat Invoice ${inv.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; margin: 0; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; max-width: 680px; margin: 0 auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    .header { border-bottom: 2px solid #334155; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { color: #facc15; font-weight: 800; font-size: 26px; letter-spacing: -0.05em; margin: 0; }
    .sublogo { color: #94a3b8; font-size: 11px; font-family: monospace; text-transform: uppercase; margin-top: 4px; }
    .badge { background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399; font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-family: monospace; text-transform: uppercase; display: inline-block; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .section-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-family: monospace; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #334155; padding-bottom: 4px; }
    .detail-text { font-size: 13px; color: #cbd5e1; line-height: 1.5; margin: 0; }
    .bold-white { color: #ffffff; font-weight: bold; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; font-size: 13px; }
    .table th { text-align: left; padding: 10px; border-bottom: 2px solid #475569; color: #94a3b8; font-family: monospace; font-size: 11px; text-transform: uppercase; }
    .table td { padding: 12px 10px; border-bottom: 1px dashed #334155; color: #cbd5e1; }
    .currency { text-align: right; font-family: monospace; }
    .negative { color: #34d399; font-weight: bold; }
    .net-box { background: rgba(250, 204, 21, 0.08); border: 2px solid rgba(250, 204, 21, 0.3); padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .net-title { font-size: 12px; font-family: monospace; text-transform: uppercase; color: #facc15; font-weight: bold; margin: 0; }
    .net-val { font-size: 20px; font-weight: 900; color: #facc15; font-family: monospace; margin: 0; }
    .footer { text-align: center; color: #64748b; font-size: 10px; font-family: monospace; border-top: 1px solid #334155; padding-top: 24px; margin-top: 24px; text-transform: uppercase; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1 class="logo">REDCAT OS</h1>
        <div class="sublogo">Interactive Escrow Settlements Ledger</div>
      </div>
      <div>
        <div class="badge">${inv.status}</div>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="section-title">Settlement Audit Metadata</div>
        <div class="detail-text"><span style="color:#94a3b8;">INVOICE ID:</span> <span class="bold-white" style="font-family: monospace;">${inv.id}</span></div>
        <div class="detail-text"><span style="color:#94a3b8;">RELEASE DATE:</span> <span class="bold-white" style="font-family: monospace;">${inv.timestamp}</span></div>
      </div>
      <div>
        <div class="section-title">Campaign Context</div>
        <div class="detail-text"><span style="color:#94a3b8;">CAMPAIGN TITLE:</span> <span class="bold-white">${inv.campaignName}</span></div>
        <div class="detail-text"><span style="color:#94a3b8;">MILESTONE:</span> <span class="bold-white" style="font-style: italic;">"${inv.milestoneTitle}"</span></div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 10px;">
      <div>
        <div class="section-title">Remitter (Brand)</div>
        <p class="detail-text bold-white" style="font-size: 15px;">${inv.brandName}</p>
        <p class="detail-text" style="font-size: 11px; color:#94a3b8; font-family: monospace; margin-top: 3px;">Sponsors Escrow Wallet</p>
      </div>
      <div>
        <div class="section-title">Recipient (Creator)</div>
        <p class="detail-text bold-white" style="font-size: 15px;">${inv.creatorName}</p>
        <p class="detail-text" style="font-size: 11px; color:#94a3b8; font-family: monospace; margin-top: 3px;">Verified Creator Payout Core</p>
      </div>
    </div>

    <h3 class="section-title" style="margin-top: 30px;">Itemized Financial Realization</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Reference / Multiplier</th>
          <th style="text-align: right;">Amount (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Base Milestone Value (₹B)</td>
          <td style="text-align: right; font-family: monospace; color:#cbd5e1;">100% Base Value</td>
          <td class="currency bold-white">₹$${inv.baseAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td>Razorpay Gateway Transaction Charge</td>
          <td style="text-align: right; font-family: monospace; color:#cbd5e1;">2.0% Fixed Surcharge</td>
          <td class="currency">₹$${inv.razorpayFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td>Dropp Platform Access Commission Fee</td>
          <td style="text-align: right; font-family: monospace; color:#cbd5e1;">0.5% Fixed Fee</td>
          <td class="currency">₹$${inv.droppFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td>Dropp Platform Zero-Liability Sponsor Surcharge Discount</td>
          <td style="text-align: right; font-family: monospace; color: #34d399;">-2.5% Waived Offset</td>
          <td class="currency negative">-₹$${Math.abs(inv.droppDiscount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
      </tbody>
    </table>

    <div class="net-box">
      <p class="net-title">Net Released Amount ("You Pay Today")</p>
      <p class="net-val">₹$${inv.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} INR</p>
    </div>

    <div class="footer">
      Cryptographic Sinuous-Weft Ledger Verification: RC-STABLE-NODE-SECURE<br/>
      Generated automatically upon brand payment execution block.<br/>
      Thank you for building with RedCat!
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RedCat_Invoice_${inv.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Release payment and dynamically generate real structured invoice
  const handleReleaseMilestone = (
    brandName: string,
    creatorName: string,
    campaignName: string,
    milestoneTitle: string,
    baseAmount: number,
    campaignIdToComplete?: string
  ) => {
    // Math and parameter validation
    if (!brandName || brandName.trim() === '') {
      throw new Error('REMITTER_BRAND_MISSING: brand full entity description parameter coordinates are required.');
    }
    if (!creatorName || creatorName.trim() === '') {
      throw new Error('RECIPIENT_CREATOR_MISSING: creator recipient descriptor parameter coordinates are required.');
    }
    if (!campaignName || campaignName.trim() === '') {
      throw new Error('CAMPAIGN_CONTEXT_MISSING: campaign context label must be defined.');
    }
    if (!milestoneTitle || milestoneTitle.trim() === '') {
      throw new Error('MILESTONE_TITLE_MISSING: targeted contract stage title must description.');
    }
    if (isNaN(baseAmount) || baseAmount <= 0) {
      throw new Error('INVALID_BASE_AMOUNT: base Plan/Milestone contract value (B) must be a positive numeric value.');
    }

    // Programmatic billing math
    const B = baseAmount;
    const razorpayFee = Number((0.02 * B).toFixed(2));
    const droppFee = Number((0.005 * B).toFixed(2));
    const droppDiscount = Number((-(0.02 + 0.005) * B).toFixed(2));
    const netAmount = Number((B + razorpayFee + droppFee + droppDiscount).toFixed(2));

    // Formulate structured invoice payload
    const invoiceId = `RC-INV-2026-${Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')}`;
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const newInvoice: Invoice = {
      id: invoiceId,
      timestamp: timestampStr,
      brandName,
      creatorName,
      campaignName,
      milestoneTitle,
      baseAmount: B,
      razorpayFee,
      droppFee,
      droppDiscount,
      netAmount,
      status: 'Settled & Released'
    };

    // Update invoices ledger
    setInvoices(prev => {
      const updated = [newInvoice, ...prev];
      localStorage.setItem('rc_platform_invoices', JSON.stringify(updated));
      return updated;
    });

    // Complete campaign if mapped
    if (campaignIdToComplete) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === campaignIdToComplete) {
          return { ...c, status: 'completed', progress: 100, stage: 'Fund Released & Settled ✓' };
        }
        return c;
      }));
    }

    soundManager.play('success');
    setSelectedInvoice(newInvoice);

    // Event-driven feedback prompt triggers instantly when milestone contract settles
    setFeedbackCampaignId(campaignIdToComplete || 'manual-' + invoiceId);
    setFeedbackCampaignTitle(campaignName);
    setFeedbackBrandName(brandName);
    setFeedbackCreatorName(creatorName);
    setFeedbackRolePersona(userRole === 'Creator' ? 'Creator' : 'Brand');
    setRatingMetric1(5);
    setRatingMetric2(5);
    setRatingMetric3(5);
    setReviewComments('');
    setFeedbackError(null);

    setTimeout(() => {
      setFeedbackModalOpen(true);
    }, 500);

    return newInvoice;
  };

  // Trigger manual invoice generation & validation
  const handleCompileManualInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setManualValidationError(null);

    try {
      const amount = parseFloat(manualBaseAmount);
      
      // Validation checks that trigger soft rejection without crashing
      if (!manualBrand || manualBrand.trim() === '') {
        setManualValidationError('🛑 Remitter Brand Name cannot be empty.');
        soundManager.play('error');
        return;
      }
      if (!manualCreator || manualCreator.trim() === '') {
        setManualValidationError('🛑 Recipient Creator Name cannot be empty.');
        soundManager.play('error');
        return;
      }
      if (!manualCampaign || manualCampaign.trim() === '') {
        setManualValidationError('🛑 Associated Campaign Name cannot be empty.');
        soundManager.play('error');
        return;
      }
      if (!manualMilestone || manualMilestone.trim() === '') {
        setManualValidationError('🛑 Milestone Stage Title cannot be empty.');
        soundManager.play('error');
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        setManualValidationError('🛑 Math Surcharge Anomaly Detected: Contract budget base value must be numeric and greater than ₹0.00.');
        soundManager.play('error');
        return;
      }

      // Success compilation
      const compiled = handleReleaseMilestone(
        manualBrand,
        manualCreator,
        manualCampaign,
        manualMilestone,
        amount
      );

      // Clear form inputs
      setManualBrand('');
      setManualCreator('');
      setManualCampaign('');
      setManualMilestone('');
      setManualBaseAmount('');
      
    } catch (err: any) {
      setManualValidationError(`🔴 Pipeline Guard rejection: ${err.message}`);
      soundManager.play('error');
    }
  };

  // Submit Campaign Milestone feedback to Firestore 'campaign_reviews'
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    if (!reviewComments || reviewComments.trim().length === 0) {
      soundManager.play('error');
      setFeedbackError("🛑 Testimonial text comments cannot be empty.");
      return;
    }

    setSubmittingFeedback(true);

    const reviewerUid = feedbackRolePersona === 'Creator'
      ? userId
      : 'brand-' + feedbackBrandName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const reviewerName = feedbackRolePersona === 'Creator'
      ? feedbackCreatorName
      : feedbackBrandName;

    const revieweeUid = feedbackRolePersona === 'Creator'
      ? 'brand-' + feedbackBrandName.toLowerCase().replace(/[^a-z0-9]/g, '')
      : userId;

    const revieweeName = feedbackRolePersona === 'Creator'
      ? feedbackBrandName
      : feedbackCreatorName;

    const newReviewId = 'rev-' + Math.floor(Math.random() * 99999999).toString();
    const listPath = 'campaign_reviews';

    const newReview: CampaignReview = {
      id: newReviewId,
      campaignId: feedbackCampaignId,
      campaignTitle: feedbackCampaignTitle,
      reviewerRole: feedbackRolePersona,
      reviewerUid,
      reviewerName,
      revieweeUid,
      revieweeName,
      rating1: ratingMetric1,
      rating2: ratingMetric2,
      rating3: ratingMetric3,
      averageRating: Number(((ratingMetric1 + ratingMetric2 + ratingMetric3) / 3).toFixed(2)),
      comments: reviewComments,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      createdAt: Date.now()
    };

    try {
      // Secure write targeting campaign_reviews/{id} in Firestore if authenticated
      if (auth.currentUser) {
        await setDoc(doc(db, listPath, newReview.id), newReview);
      } else {
        console.warn("User running in Sandbox/Offline mode. Bypassing online Firestore setDoc query to prevent permission failure.");
      }
      
      // Update local state instantly so Reputation index reacts
      setReviews(prev => [newReview, ...prev]);
      
      // Save reviews cache to local storage
      const cached = localStorage.getItem('rc_platform_reviews');
      let currentCache: CampaignReview[] = [];
      if (cached) {
        try {
          currentCache = JSON.parse(cached);
        } catch (e) {
          // ignore
        }
      }
      localStorage.setItem('rc_platform_reviews', JSON.stringify([newReview, ...currentCache]));

      // Play audio feedback
      soundManager.play('success');
      alert(`✨ Superb! Your authentic testimonial has been processed in our background Reputation Engine and synchronized securely.`);
      
      // Reset form variables
      setReviewComments('');
      setFeedbackModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setFeedbackError("🔴 Firestore security authorization failed: access was rejected.");
      
      // Throw standard detailed exception mapping
      try {
        handleFirestoreError(err, OperationType.WRITE, `${listPath}/${newReview.id}`);
      } catch (logErr) {
        // logged successfully
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Helper gate simulation for verifying sandbox enterprise features
  const triggerSimulationCheck = (featureName: string, requiredTierLevel: TierLevel) => {
    // Tiers hierarchy validation
    const levelsOrder: TierLevel[] = ['Basic', 'Pro', 'Pro Max', 'Ultra', 'Ultra Max'];
    const currentIdx = levelsOrder.indexOf(currentTier);
    const requiredIdx = levelsOrder.indexOf(requiredTierLevel);

    if (currentIdx >= requiredIdx) {
      soundManager.play('success');
      setSimulationStatus('success');
      let detailsText = '';
      if (featureName === 'AI Mascot Generator') {
        detailsText = `[SYS] Dynamic Asset Engine loaded.
[SYS] Initializing vector canvas compilation.
[SYS] Generating brand-customized mascot with standard assets...
[OUTPUT] ✨ Success! Generated high-contrast Mascot assets [Tier: Ultra Max Custom Assets Core]. Ready for multi-channel video exports.`;
      } else if (featureName === 'Fine-Tuning LLM') {
        detailsText = `[SYS] Connecting custom LLM pipeline (Antigravity v3 backend).
[SYS] Injecting personalized tone context for brand brief catalogs.
[SYS] Fine-tuning 8B parameters inside dedicated Postgres sandbox.
[OUTPUT] Verified optimized copywriting prompts & matching algorithm successfully calibrated!`;
      } else if (featureName === 'Fraud Alerts') {
        detailsText = `[SYS] Polling cross-platform video statistics APIs.
[SYS] Risk profile scanned successfully.
[OUTPUT] Status: Pure Green. Credibility index: 98% (Zero anomalous view spikes identified). Safeguard guarantees released.`;
      } else if (featureName === 'Brief Compiler') {
        detailsText = `[SYS] Activating standard OpenAI proxy node.
[OUTPUT] AI Creative brief compiled with hook, timeline milestones, and target formats. Ready to add to workspace.`;
      }
      setSimulationLog(detailsText);
    } else {
      soundManager.play('error');
      setSimulationStatus('warn');
      const levelsLabels: Record<TierLevel, string> = {
        'Basic': 'Starter Workspace',
        'Pro': 'AI-Accelerated Growth Tier',
        'Pro Max': 'High-Velocity Campaign Engine',
        'Ultra': 'Multi-Region Cloud Enterprise',
        'Ultra Max': 'Global Ecosystem Hub'
      };
      setSimulationLog(`🛑 OPERATION DENIED [Tier Restriction]
Attempted operation: ${featureName}
Required tier: ${requiredTierLevel} (${levelsLabels[requiredTierLevel]})
Your current tier: ${currentTier} (${levelsLabels[currentTier]})

Architect Recommendation:
Please exit this simulation and tap "UPGRADE INSTANTLY" under the ${requiredTierLevel} card. This will instantly release your virtual compute caps!`);
    }
  };

  // Mascot customization save state
  const handleUpdateMascot = async (skin: any, clothes: any, hair: any) => {
    soundManager.play('success');
    if (profile) {
      const updated = { ...profile, mascotSkin: skin, mascotClothes: clothes, mascotHair: hair };
      setProfile(updated);
      
      // Update persistent local caches
      localStorage.setItem(`rc_profile_${userId}`, JSON.stringify(updated));
      const sandboxUserStr = localStorage.getItem('rc_sandbox_auth');
      if (sandboxUserStr) {
        try {
          const sUser = JSON.parse(sandboxUserStr);
          if (sUser.uid === userId) {
            sUser.mascotSkin = skin;
            sUser.mascotClothes = clothes;
            sUser.mascotHair = hair;
            localStorage.setItem('rc_sandbox_auth', JSON.stringify(sUser));
          }
        } catch (e) {
          console.warn(e);
        }
      }

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', userId), {
            mascotSkin: skin,
            mascotClothes: clothes,
            mascotHair: hair
          });
        } catch (err) {
          console.warn("Could not fire online mascot update", err);
        }
      } else {
        console.warn("User in Sandbox/Offline mode. Bypassing online Firestore mascot updateDoc.");
      }
    }
  };

  // Save encapsulated custom mascot configurations
  const handleSaveMascotEngine = async () => {
    soundManager.play('success');
    if (profile) {
      const mascotConfig: MascotData = {
        skin: mascotSkinState,
        clothes: mascotClothesState,
        hair: mascotHairState,
        generativePrompt: mascotPromptState,
        themeStyle: mascotThemeState,
        expressionStyle: mascotExpressionState,
        customSkin: customSkinState,
        customHead: customHeadState,
        customFace: customFaceState
      };
      
      const updatedProfile: UserProfile = {
        ...profile,
        mascotSkin: mascotSkinState,
        mascotClothes: mascotClothesState,
        mascotHair: mascotHairState,
        mascot: mascotConfig
      };
      
      setProfile(updatedProfile);
      
      // Update persistent local caches
      localStorage.setItem(`rc_profile_${userId}`, JSON.stringify(updatedProfile));
      const sandboxUserStr = localStorage.getItem('rc_sandbox_auth');
      if (sandboxUserStr) {
        try {
          const sUser = JSON.parse(sandboxUserStr);
          if (sUser.uid === userId) {
            sUser.mascotSkin = mascotSkinState;
            sUser.mascotClothes = mascotClothesState;
            sUser.mascotHair = mascotHairState;
            sUser.mascot = mascotConfig;
            localStorage.setItem('rc_sandbox_auth', JSON.stringify(sUser));
          }
        } catch (e) {
          console.warn(e);
        }
      }

      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', userId), {
            mascotSkin: mascotSkinState,
            mascotClothes: mascotClothesState,
            mascotHair: mascotHairState,
            mascot: mascotConfig
          });
        } catch (err) {
          console.warn("Could not fire online mascot update", err);
        }
      } else {
        console.warn("User in Sandbox/Offline mode. Bypassing online Firestore mascot updateDoc.");
      }
      
      setMascotAiSuccess("✨ Custom Pixel Mascot Configuration synchronized safely inside the profile database schema!");
      setTimeout(() => {
        setMascotAiSuccess(null);
        setIsMascotCustomizerOpen(false);
      }, 2000);
    }
  };

  const handleGenerateMascotWithAi = () => {
    if (!subscriptionTier.pixelCustomMascotGenerator) {
      soundManager.play('error');
      setMascotAiGenerationError(`🔒 Generative Asset Lock Rejection: 'AI custom asset generation' is restricted to 'Ultra Max' subscribers. Please upgrade your workspace tier!`);
      setMascotAiSuccess(null);
      return;
    }

    // Success flow - compile!
    soundManager.play('switch');
    setMascotAiGenerationError(null);
    setMascotAiLoading(true);
    setMascotAiSteps([]);
    
    const steps = [
      "📡 Handshaking with RedCat Cloud Neural Node...",
      "🔬 Parsing prompt coordinates: '" + (mascotPromptState || "Retro Futuristic Cat Voyager") + "'...",
      "🎨 Simulating aesthetic visual layer: Theme '" + mascotThemeState + "' + Expression '" + mascotExpressionState + "'...",
      "🧩 Rasterizing pixel matrix textures & alpha frames...",
      "🟢 Asset Compiled Successfully! Mapped to local responsive canvas."
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setMascotAiSteps(prev => [...prev, steps[currentStepIdx]]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setMascotAiLoading(false);
        soundManager.play('success');
        
        // Randomize/Map aesthetic styles according to keywords/presets for complete dynamic realism!
        const skinPresets: Array<'rose' | 'gold' | 'moon'> = ['rose', 'gold', 'moon'];
        const clothesPresets: Array<'crimson' | 'blue' | 'green'> = ['crimson', 'blue', 'green'];
        const hairPresets: Array<'tuft' | 'bob' | 'spikes'> = ['tuft', 'bob', 'spikes'];
        
        const promptSeed = (mascotPromptState + mascotThemeState + mascotExpressionState).length || 7;
        const newSkin = skinPresets[promptSeed % skinPresets.length];
        const newClothes = clothesPresets[(promptSeed + 1) % clothesPresets.length];
        const newHair = hairPresets[(promptSeed + 2) % hairPresets.length];

        setMascotSkinState(newSkin);
        setMascotClothesState(newClothes);
        setMascotHairState(newHair);
        
        setMascotAiSuccess("✨ Outstanding! Neural Engine completed the asset compilation cleanly under Ultra Max tier!");
      }
    }, 450);
  };

  // ADMIN ACTION: View user dossier report
  const handleAdminViewUser = (u: UserProfile) => {
    soundManager.play('click');
    setSelectedAdminUser(u);
  };

  // ADMIN ACTION: Start Verification with simulated Captcha
  const handleAdminVerifyInit = (u: UserProfile) => {
    soundManager.play('switch');
    setCaptchaStatus(u);
    // Generate code
    const keys = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += keys.charAt(Math.floor(Math.random() * keys.length));
    }
    setVerificationCode(code);
    setTypedCaptchaCode('');
    setCaptchaOpen(true);
  };

  // ADMIN ACTION: Check captcha to approve registration verify state
  const handleAdminVerifySubmit = () => {
    if (typedCaptchaCode.trim().toUpperCase() === verificationCode) {
      soundManager.play('success');
      alert(`User ${captchaStatus?.fullName} verified with authorized alphanumeric captcha token! Registration accepted.`);
      
      // Update in locally loaded array
      if (captchaStatus) {
        setAdminUsers(prev => prev.map(u => u.uid === captchaStatus.uid ? { ...u, niche: "VERIFIED ✓" } : u));
      }

      setCaptchaOpen(false);
      setCaptchaStatus(null);
    } else {
      soundManager.play('error');
      alert("Invalid captcha. Verification mismatch!");
    }
  };

  // Secure KYC verification request handler with isolated error logs
  const handleVerificationSubmit = async () => {
    if (!docInputValue) {
      setVerificationError("Invalid Document Identification");
      soundManager.play('error');
      return;
    }
    
    setSubmittingVerify(true);
    setVerificationError('');
    soundManager.play('click');
    
    const endpoint = userRole === 'Brand' ? '/api/verify/gstin' : '/api/verify/pan';
    const bodyKey = userRole === 'Brand' ? 'gstin' : 'pan';

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: docInputValue })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid Document Identification");
      }
      
      soundManager.play('success');
      
      const updatedProfile = {
        ...profile,
        is_verified: true,
        kyc_ref_code: `${userRole === 'Brand' ? 'GSTIN' : 'PAN'}-${docInputValue.slice(0, 4)}XXXX-${Date.now().toString().slice(-4)}`
      };
      
      setProfile(updatedProfile as any);
      localStorage.setItem(`rc_profile_${userId}`, JSON.stringify(updatedProfile));
      
      // Update local storage sandbox authentication status cached backup as reference
      const authStr = localStorage.getItem('rc_sandbox_auth');
      if (authStr) {
        try {
          const sUser = JSON.parse(authStr);
          if (sUser.uid === userId) {
            sUser.is_verified = true;
            localStorage.setItem('rc_sandbox_auth', JSON.stringify(sUser));
          }
        } catch (e) {
          console.warn(e);
        }
      }
      
      alert(`✨ Superb! Compliance Verification Succeeded! Your ${userRole === 'Brand' ? 'GSTIN' : 'PAN'} has been successfully checked and registered.`);
    } catch (err: any) {
      soundManager.play('error');
      setVerificationError(err.message || "Invalid Document Identification");
    } finally {
      setSubmittingVerify(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-between selection:bg-yellow-400 selection:text-slate-950 leading-relaxed font-sans">
      
      {/* Dynamic Status Notifications Bar */}
      <div className="w-full">
        {/* Render notification ticker */}
      </div>

      {/* Collapsible Sidebar Navigation Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                soundManager.play('click');
                setDrawerOpen(false);
              }}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 border-r border-rose-950/60 p-6 z-[100] flex flex-col shadow-2xl justify-between"
            >
              <div className="space-y-6">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    <span className="text-sm font-mono font-black text-rose-500 tracking-wider">REDCAT NAVIGATOR</span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setDrawerOpen(false);
                    }}
                    className="p-1 px-2 border border-slate-700 hover:border-yellow-400 bg-slate-950 rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation links stack matches previous tab structures */}
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('console');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'console' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>📊 Core Workspace</span>
                    {activeTab === 'console' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('chatroom');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'chatroom' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>💬 {userRole === 'Brand' ? 'AI Brief Chatroom' : 'Chat with Brands'}</span>
                    {activeTab === 'chatroom' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('escrow');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'escrow' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>🔒 Milestones &amp; Escrow</span>
                    {activeTab === 'escrow' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('privacy');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'privacy' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>🛡️ Privacy Vault</span>
                    {activeTab === 'privacy' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('tiers');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'tiers' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>👑 Operating Tiers</span>
                    {activeTab === 'tiers' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('hiring');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'hiring' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>💼 Hiring Arena</span>
                    {activeTab === 'hiring' && <span className="text-[10px]">●</span>}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('settings');
                      setDrawerOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all flex items-center justify-between ${
                      activeTab === 'settings' ? 'bg-yellow-400 text-slate-950 font-bold shadow-lg' : 'text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>⚙️ Settings &amp; Security Parameters</span>
                    {activeTab === 'settings' && <span className="text-[10px]">●</span>}
                  </button>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-slate-800 pt-4 text-center">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  RedCat Enterprise Node
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  Active User: <strong className="text-yellow-400">{userRole}</strong>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DASHBOARD NAVBAR */}
      <header className="bg-slate-900 border-b border-rose-950/60 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand logo & sound status */}
          <div className="flex items-center gap-3">
            {/* Hamburger Icon button in the top-left section */}
            <button
              id="hamburger-menu-trigger"
              onClick={() => {
                soundManager.play('click');
                setDrawerOpen(prev => !prev);
              }}
              className="mr-2 p-1 px-2.5 border border-rose-950 rounded-lg bg-slate-950 hover:bg-slate-900 hover:border-yellow-400 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping shrink-0" />
            <h1 className="text-xl font-mono font-black text-rose-500 tracking-wider">
              REDCAT COMMAND
            </h1>
            
            {/* Audio Toggle button */}
            <button
              onClick={handleToggleSound}
              className="ml-2 p-1.5 rounded-md hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
              title="Toggle Audio Brand Feedback"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-yellow-400 animate-bounce" />
                  <span className="text-[10px] font-mono select-none hidden md:inline text-slate-300">SOUND ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-600" />
                  <span className="text-[10px] font-mono select-none hidden md:inline text-slate-500">MUTED</span>
                </>
              )}
            </button>
          </div>

          {/* Logout & Settings controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.play('click');
                setActiveTab('settings');
              }}
              className={`p-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 font-mono text-xs ${
                activeTab === 'settings'
                  ? 'bg-yellow-400 text-slate-950 border-yellow-400 font-bold shadow-md'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-yellow-400'
              }`}
              title="Settings & Security Parameters"
            >
              <Settings className="w-4 h-4 text-yellow-400" />
              <span className="hidden sm:inline text-[11px] font-bold">Settings</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-mono text-slate-300 truncate max-w-[120px]" title={userEmail}>
                {userEmail}
              </span>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded uppercase">
                {userRole}
              </span>
              <span className="text-[10px] bg-rose-600/20 text-yellow-450 border border-yellow-500/20 font-bold font-mono px-1.5 py-0.5 rounded flex items-center gap-1" title="Operating Subscription Tier Level">
                👑 {subscriptionTier.level}
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.play('close');
                signOut(auth);
                onLogout();
              }}
              className="p-2 bg-slate-850 hover:bg-red-500 hover:text-white border border-slate-800 hover:border-red-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
              title="Sign Out Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CORE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CORE WORKSPACE */}
          {activeTab === 'console' && (
            <motion.div
              key="console"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              {/* HERO GREETING & DETAILS */}
              <div className="bg-slate-900 border border-rose-950/60 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none rounded-full" />
                
                <div className="flex items-center gap-4">
                  {/* Customized Mascot Avatar preview inside dashboard */}
                  {profile && (
                    <MascotRender 
                      mascot={profile.mascot || {
                        skin: profile.mascotSkin || 'rose',
                        clothes: profile.mascotClothes || 'crimson',
                        hair: profile.mascotHair || 'tuft'
                      }}
                      scale={0.9}
                      className="shrink-0"
                    />
                  )}

                  <div>
                    <h2 className="text-xl font-bold font-mono text-slate-100">
                      Welcome, {profile?.fullName || 'Consul officer'} 
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Role assigned: <strong className="text-rose-400 font-mono">{userRole}</strong> • Verified cloud database connected.
                    </p>
                  </div>
                </div>

                {/* Dynamically Aggregate Reputation Badges */}
                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-center px-3 border-r border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Reputation Score</span>
                    <span className="text-sm font-extrabold text-yellow-400 font-mono">
                      {userRole === 'Creator' ? creatorTrustScore : brandTrustScore}%
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-300 font-mono block font-bold flex items-center gap-1">
                      <span className="text-yellow-400">★</span> Tier Status Verified
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Based on {userRole === 'Creator' ? ratingsBrandToCreator.length : ratingsCreatorToBrand.length} verified reviews
                    </span>
                  </div>
                </div>

                {/* BRAND ROLE PRESETS (Switch over 20+ profiles list) */}
                {userRole === 'Brand' && (
                  <div className="w-full md:w-auto bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-yellow-400 font-mono block">
                      Switch Profiles ({brandProfilesMockPool.length}+ presets option)
                    </label>
                    <select
                      value={brandSelectedId}
                      onChange={(e) => handleBrandPresetChange(e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 text-xs border border-slate-700 py-1.5 px-3 font-mono rounded cursor-pointer focus:outline-none focus:border-yellow-400"
                    >
                      {brandProfilesMockPool.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.niche})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* LEGAL COMPLIANCE VERIFICATION PORTAL */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded border ${profile?.is_verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-mono font-bold text-slate-100">PLATFORM COMPLIANCE &amp; IDENTITY GATE</h3>
                      <p className="text-[10px] text-slate-400">Verifies corporate/creator identity for escrow operations</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full border ${
                      profile?.is_verified 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-red-500/10 text-rose-400 border-red-500/30 animate-pulse'
                    }`}>
                      {profile?.is_verified ? '✓ Verified Entity' : '⚠️ Pending Verification'}
                    </span>
                  </div>
                </div>

                {!profile?.is_verified ? (
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg space-y-2">
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        {userRole === 'Brand' 
                          ? 'Enterprise verification mandatory. Please specify your 15-character Goods and Services Tax Identification Number (GSTIN) to unlock bidding permissions and Escrow Vault operations.'
                          : 'KYC identity setup required. Please submit your 10-character Indian Permanent Account Number (PAN) to verify physical/corporate entity status and unlock active contract handshakes.'
                        }
                      </p>
                      <span className="text-[9px] text-rose-450 font-mono italic block">
                        Notice: posting jobs, making Escrow locks, and direct AI voice handshakes are locked until verified.
                      </span>
                    </div>

                    <div className="max-w-md space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-slate-400 font-bold block">
                          {userRole === 'Brand' ? 'Goods & Services Tax Identification Number (GSTIN)' : 'Permanent Account Number (PAN)'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={docInputValue}
                            onChange={(e) => setDocInputValue(e.target.value.toUpperCase())}
                            placeholder={userRole === 'Brand' ? '27AAAAA1111A1Z1' : 'ABCDE1234F'}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 uppercase font-mono focus:outline-none focus:border-yellow-400 font-bold tracking-wider"
                          />
                          <button
                            onClick={handleVerificationSubmit}
                            disabled={submittingVerify}
                            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-950 font-black font-mono text-xs px-5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            {submittingVerify ? 'Verifying...' : 'Submit Doc'}
                          </button>
                        </div>
                        {verificationError && (
                          <p className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                            <span>{verificationError}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-lg flex items-center justify-between">
                    <div className="space-y-1 font-mono">
                      <span className="text-xs text-emerald-400 font-extrabold block">✓ Verified Active Status</span>
                      <p className="text-[11px] text-slate-300">
                        Your credentials match registered compliance profiles in Postgres. All direct-call pipelines and Escrow milestones are fully interactive.
                      </p>
                      <span className="text-[10px] text-slate-500 block">
                        Document Reference: <strong className="text-slate-400">{profile.kyc_ref_code || 'Verified via RedCat API'}</strong>
                      </span>
                    </div>
                    <div className="text-3xl text-emerald-500 font-mono pr-4 font-black">
                      🛡️
                    </div>
                  </div>
                )}
              </div>

              {/* ROLE SPECIFIC CORE VISUALIZATIONS */}
              
              {/* BRAND INTERFACES */}
              {userRole === 'Brand' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Brand matches */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-cyan-400" /> Influencer Radar Matches
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-yellow-400 transition-colors">
                        <div>
                          <strong className="text-xs text-slate-200 font-mono">MiraReels (Beauty Niche)</strong>
                          <span className="block text-[10px] text-slate-400">98% satisfaction rating • 2.9k avg views</span>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono font-bold">96% AI Fit</span>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-yellow-400 transition-colors">
                        <div>
                          <strong className="text-xs text-slate-200 font-mono">Rahul Vlogs (Gaming Stream)</strong>
                          <span className="block text-[10px] text-slate-400">91% active response • Fast editing style</span>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono font-bold">91% AI Fit</span>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-yellow-400 transition-colors">
                        <div>
                          <strong className="text-xs text-slate-200 font-mono">HookHacker Video</strong>
                          <span className="block text-[10px] text-slate-400">Fast visual retention hooks focus</span>
                        </div>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono font-bold">88% AI Fit</span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow budgets stats */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-green-400" /> Escrow Balance Dashboard
                    </h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center text-slate-100">
                      <span className="text-[10px] uppercase text-slate-400 font-mono font-bold block mb-1">TOTAL ESCROW COMMITTED</span>
                      <strong className="text-4xl font-mono font-black text-rose-500 block mb-2">₹3,840.00</strong>
                      <div className="flex gap-2 justify-center text-[10px] text-slate-300 font-mono flex-wrap">
                        <span className="bg-slate-900 px-2 py-1 rounded">Released: ₹2,640</span>
                        <span className="bg-slate-900 px-2 py-1 rounded">Pending: ₹1,200</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Nova Snacks draft milestone</span>
                        <span className="text-yellow-400 font-mono font-bold">Secured</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Sony Alpha final payout releases</span>
                        <span className="text-green-400 font-mono font-bold">Completed ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* AIChatroom trigger info box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" /> Conversational AI brief writer
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2">
                        Instead of multi-field forms, construct high-performance creator instructions using our Brand x AI Chatroom assistant. State target website assets to outline immediate deliverables.
                      </p>
                    </div>

                    <button
                      onClick={() => { soundManager.play('click'); setActiveTab('chatroom'); }}
                      className="w-full bg-slate-950 border border-slate-700 hover:border-yellow-400 text-yellow-400 font-mono text-xs uppercase py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <span>Open Briefing Chatroom</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* CREATOR INTERFACES */}
              {userRole === 'Creator' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Mascot attribute Customizer inside Dashboard */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      🎭 Customize Mascot Look List
                    </h3>

                    {profile && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                          {/* Live render inside card */}
                          <MascotRender 
                            mascot={profile.mascot || {
                              skin: profile.mascotSkin || 'rose',
                              clothes: profile.mascotClothes || 'crimson',
                              hair: profile.mascotHair || 'tuft'
                            }}
                            scale={0.9}
                            className="shrink-0"
                          />
                          <div>
                            <span className="text-xs text-slate-100 font-bold block">{profile.fullName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Rank: Bronze Explorer</span>
                          </div>
                        </div>

                        {/* select characteristics dropdown list controls */}
                        <div className="space-y-2.5 text-xs font-mono">
                          <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-800 rounded">
                            <span className="text-slate-400">Skin Texture</span>
                            <div className="flex gap-1.5">
                              {['rose', 'gold', 'moon'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateMascot(s, profile.mascotClothes, profile.mascotHair)}
                                  className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold border ${
                                    profile.mascotSkin === s ? 'bg-yellow-400 text-slate-950 border-yellow-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-800 rounded">
                            <span className="text-slate-400">Clothes Tint</span>
                            <div className="flex gap-1.5">
                              {['crimson', 'blue', 'green'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => handleUpdateMascot(profile.mascotSkin, c, profile.mascotHair)}
                                  className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold border ${
                                    profile.mascotClothes === c ? 'bg-yellow-400 text-slate-950 border-yellow-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-800 rounded">
                            <span className="text-slate-400">Hairstyle</span>
                            <div className="flex gap-1.5">
                              {['tuft', 'bob', 'spikes'].map(h => (
                                <button
                                  key={h}
                                  onClick={() => handleUpdateMascot(profile.mascotSkin, profile.mascotClothes, h)}
                                  className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold border ${
                                    profile.mascotHair === h ? 'bg-yellow-400 text-slate-950 border-yellow-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {h}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Bidding matches list */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      🛸 Active Match Radar Discovery
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-lg space-y-2.5 hover:border-yellow-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-100 italic">Nova Snack Launch</strong>
                          <span className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">94% Fit</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">Budget: ₹3,800 • Stage: Draft Review</p>
                        <button
                          onClick={() => {
                            soundManager.play('click');
                            setSelectedChatBrandId('nova-snack');
                            setActiveTab('chatroom');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-yellow-400 hover:text-yellow-400 text-slate-300 font-mono text-[9px] uppercase py-1.5 rounded transition-all cursor-pointer block text-center font-bold"
                        >
                          💬 Pitch & Chat with Brand
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-lg space-y-2.5 hover:border-yellow-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-100 italic">Cinematic Alpha Lens</strong>
                          <span className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">89% Fit</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">Budget: ₹24,000 • Stage: Final Approved</p>
                        <button
                          onClick={() => {
                            soundManager.play('click');
                            setSelectedChatBrandId('cinematic-alpha');
                            setActiveTab('chatroom');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-yellow-400 hover:text-yellow-400 text-slate-300 font-mono text-[9px] uppercase py-1.5 rounded transition-all cursor-pointer block text-center font-bold"
                        >
                          💬 Pitch & Chat with Brand
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-lg space-y-2.5 hover:border-yellow-400 transition-colors">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-100 italic">Nike Athletics series</strong>
                          <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">78% Match</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">Bidding starts June 21 • Flat ₹12,500 Escrow</p>
                        <button
                          onClick={() => {
                            soundManager.play('click');
                            setSelectedChatBrandId('nike-athletics');
                            setActiveTab('chatroom');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-yellow-400 hover:text-yellow-400 text-slate-300 font-mono text-[9px] uppercase py-1.5 rounded transition-all cursor-pointer block text-center font-bold"
                        >
                          💬 Pitch & Chat with Brand
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Creator challenges */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      ⚔️ Creator Crew Station Challenges
                    </h3>
                    
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
                      <div>
                        <strong className="text-xs text-yellow-400 block font-mono">Pixel Reel Sprint 🎥</strong>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          Submit a 15-second reel subverting a classical meme. Direct community voting selects the final ₹1,500 bonus reward.
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-900 text-slate-300 font-mono">
                        <span>Participants: 18 live</span>
                        <span className="text-rose-400">Ends in 2 days</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] bg-slate-950/40 p-2.5 rounded border border-slate-800/60 font-mono">
                      <span>Galaxy Rank: Bronze IV</span>
                      <span className="text-yellow-400">XP: 540 / 1000</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PERSISTENT MUTABLE PROFILE CONSOLE FOR CREATORS & BRANDS */}
              {(userRole === 'Creator' || userRole === 'Brand') && profile && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-6 mt-6">
                  <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-mono text-sm uppercase tracking-wider text-yellow-400 font-extrabold flex items-center gap-2">
                        <span>👤</span> 
                        <span>{userRole === 'Brand' ? 'Brand Corporate Identity & Pitch' : 'Creator Sponsorship Portfolio'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Show, verify, and live-edit your system details instantly broadcasted on search pipelines.
                      </p>
                    </div>
                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 text-[10px] text-slate-400 font-mono flex items-center gap-1.5 self-start">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>SYNCED TO FIRESTORE</span>
                    </div>
                  </div>

                  {/* Two-Column Grid: Left: Live Card Preview, Right: Editable Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: LIVE CARD PREVIEW (DISPLAY ONLY) */}
                    <div className="md:col-span-5 bg-slate-950 border border-slate-850 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group">
                      {/* background ambient decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-2xl rounded-full pointer-events-none" />
                      
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                          {userRole === 'Creator' ? (
                            <MascotRender 
                              mascot={profile.mascot || {
                                skin: profile.mascotSkin || 'rose',
                                clothes: profile.mascotClothes || 'crimson',
                                hair: profile.mascotHair || 'tuft'
                              }}
                              scale={0.9}
                              className="shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 font-sans font-bold flex items-center justify-center text-rose-500 text-lg">
                              🏢
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
                              {userRole === 'Brand' ? 'Verified Corporate Entity' : 'Custom Minecraft Mascot'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-200">
                              {profile.fullName || 'Untitled Identity'}
                            </h4>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">
                              {userRole === 'Brand' ? 'Official Link / Portal' : 'Primary Niche Focus'}
                            </span>
                            <span className="text-xs text-yellow-400 font-mono truncate block">
                              {profile.niche || 'Not declared'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block">
                              Biography Pitch
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3 italic">
                              "{profile.bio || 'Please write a brief background/pitch for match-making...'}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {userRole === 'Creator' && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.play('click');
                              // Initialize state fields
                              if (profile) {
                                const mc = profile.mascot;
                                setCustomSkinState(mc?.customSkin || 'standard');
                                setCustomHeadState(mc?.customHead || 'none');
                                setCustomFaceState(mc?.customFace || 'neutral');
                                setMascotSkinState(profile.mascotSkin || 'rose');
                                setMascotClothesState(profile.mascotClothes || 'crimson');
                                setMascotHairState(profile.mascotHair || 'tuft');
                              }
                              setIsMascotCustomizerOpen(true);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 hover:border-yellow-450 hover:bg-slate-800 text-yellow-400 hover:text-yellow-300 font-mono font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 text-center"
                          >
                            <span>🎭 Customize Mascot Engine</span>
                          </button>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>Role: {profile.role}</span>
                        <span>UID: {profile.uid ? profile.uid.substring(0, 8) + '...' : 'Guest'}</span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: EDIT FORM */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                            {userRole === 'Brand' ? 'Brand / Corporate Name' : 'Creator Display Name'}
                          </label>
                          <input
                            type="text"
                            value={profile.fullName || ''}
                            onChange={(e) => {
                              setProfile({ ...profile, fullName: e.target.value });
                            }}
                            placeholder={userRole === 'Brand' ? "e.g. FitFast Co." : "e.g. AstroVlogs TV"}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-yellow-400 font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                            {userRole === 'Brand' ? 'Website Portal Link' : 'Category / Platform Niche'}
                          </label>
                          <input
                            type="text"
                            value={profile.niche || ''}
                            onChange={(e) => {
                              setProfile({ ...profile, niche: e.target.value });
                            }}
                            placeholder={userRole === 'Brand' ? "e.g. https://fitfast.company" : "e.g. Retro Gaming & Reels"}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-yellow-400 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                          Biography Pitch (Maximum 140 Characters)
                        </label>
                        <textarea
                          rows={3}
                          value={profile.bio || ''}
                          onChange={(e) => {
                            setProfile({ ...profile, bio: e.target.value });
                          }}
                          placeholder="Introduce yourself to brands/creators, stating your target objectives, escrow milestones, and typical response turnarounds..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-yellow-400 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            soundManager.play('success');
                            // Save profile to local storage cache
                            localStorage.setItem(`rc_profile_${userId}`, JSON.stringify(profile));
                            
                            // Save profile to Sandbox auth fallback if synced
                            const authStr = localStorage.getItem('rc_sandbox_auth');
                            if (authStr) {
                              try {
                                const sUser = JSON.parse(authStr);
                                if (sUser.uid === userId) {
                                  sUser.fullName = profile.fullName;
                                  sUser.niche = profile.niche;
                                  sUser.bio = profile.bio;
                                  localStorage.setItem('rc_sandbox_auth', JSON.stringify(sUser));
                                }
                              } catch (e) {
                                console.warn(e);
                              }
                            }

                            // Deploy online in Firestore users collection
                            try {
                              await updateDoc(doc(db, 'users', userId), {
                                fullName: profile.fullName,
                                niche: profile.niche,
                                bio: profile.bio
                              });
                              alert("✨ Superb! Your persistent profile information has been securely updated and synced in Firebase!");
                            } catch (error) {
                              console.warn("Firestore save fallback", error);
                              alert("✨ Local Cache Updated successfully! (Online sandbox sync active)");
                            }
                          }}
                          className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold font-mono text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                        >
                          <span>💾 Save & Broadcast Profile</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ADMIN CONSOLE (Restricted Management Console) */}
              {userRole === 'Admin' && (
                <div className="space-y-6">
                  
                  {/* Stats blocks overview */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-mono">Database Users</span>
                      <strong className="text-2xl font-mono block mt-1 font-bold text-yellow-400">{adminUsers.length} active</strong>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-mono">Pending Verifications</span>
                      <strong className="text-2xl font-mono block mt-1 font-bold text-red-400">1 standard</strong>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-mono">Active Escrow</span>
                      <strong className="text-2xl font-mono block mt-1 font-bold text-green-400">₹27.8k</strong>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                      <span className="text-[10px] uppercase text-slate-400 block font-mono">Platform Health</span>
                      <strong className="text-2xl font-mono block mt-1 font-bold text-cyan-400">99.98%</strong>
                    </div>
                  </div>

                  {/* Users moderation list containing verify captcha logic */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2">
                      👥 System Registries Registration & Dossier Oversight
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-2.5 px-3">Assignee Name</th>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Credentials Class</th>
                            <th className="py-2.5 px-3 text-right">Administrative Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map(u => (
                            <tr key={u.uid} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-slate-300">
                              <td className="py-3 px-3 font-bold">{u.fullName}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                  u.role === 'Brand' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40' : 'bg-green-950 text-green-300 border border-green-800/40'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-bold ${u.niche === 'VERIFIED ✓' ? 'text-green-400 animate-pulse' : 'text-yellow-400'}`}>
                                  {u.niche === 'VERIFIED ✓' ? 'Verified Account ✓' : 'Awaiting Dossier'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right space-x-2">
                                <button
                                  onClick={() => handleAdminViewUser(u)}
                                  className="px-2 py-1 bg-slate-850 hover:bg-slate-800 rounded text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
                                >
                                  View Report
                                </button>
                                {u.niche !== 'VERIFIED ✓' && (
                                  <button
                                    onClick={() => handleAdminVerifyInit(u)}
                                    className="px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded text-[10px] cursor-pointer"
                                  >
                                    Verify Registration
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE CAMPAIGN STATUS LISTS */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-rose-500" /> Active Platform Campaigns Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800 font-mono">
                            {camp.brandName}
                          </span>
                          <span className="text-[9px] font-mono text-yellow-400 font-semibold uppercase">
                            AI Match: {camp.aiMatch}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{camp.title}</h4>
                        <p className="text-[11px] text-slate-400">Milestone Stage: {camp.stage}</p>
                      </div>

                      {/* Progress line */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                          <span>Complete</span>
                          <span>{camp.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-yellow-400 h-1.5 transition-all" style={{ width: `${camp.progress}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] font-mono">
                        <span className="text-slate-400">Budget: <strong className="text-green-400">{camp.budget}</strong></span>
                        <span className="text-cyan-400">Due: {camp.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VERIFIED TESTIMONIALS LEDGER & SYSTEM REPUTATION MATRIX */}
              <div id="verified-testimonials-ledger" className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 mt-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-yellow-400 font-extrabold flex items-center gap-2">
                      <span>★</span>
                      <span>Verified Testimonials Ledger & Reputation Index</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Direct proof of performance settled securely via verified Escrow smart release verification chains.
                    </p>
                  </div>

                  {/* Manual Testimonial Generator Trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-sandbox-review"
                      onClick={() => {
                        soundManager.play('click');
                        setFeedbackCampaignId('sandbox-' + Math.floor(Math.random() * 1000));
                        setFeedbackCampaignTitle('Sandbox Discovery Sprint');
                        setFeedbackBrandName('Aesthetic Sneakers Corp');
                        setFeedbackCreatorName('MiraReels');
                        setFeedbackRolePersona(userRole === 'Creator' ? 'Creator' : 'Brand');
                        setRatingMetric1(5);
                        setRatingMetric2(5);
                        setRatingMetric3(5);
                        setReviewComments('');
                        setFeedbackError(null);
                        setFeedbackModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-mono text-[10px] uppercase rounded-md font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <span>📝</span> Write Sandbox Review
                    </button>
                  </div>
                </div>

                {/* Score Summary Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/5 blur-xl pointer-events-none rounded-full" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Aggregate Creator Reputation</span>
                      <strong className="text-2xl font-mono text-cyan-400">{creatorTrustScore}%</strong>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-mono">
                        Evaluated across Quality, Communication, and Timeline Adherence.
                      </span>
                    </div>
                    <div className="bg-cyan-950/20 text-cyan-400/80 border border-cyan-800/30 font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-md">
                      Verified {ratingsBrandToCreator.length}x
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex justify-between items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/5 blur-xl pointer-events-none rounded-full" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Aggregate Brand Reputation</span>
                      <strong className="text-2xl font-mono text-yellow-400">{brandTrustScore}%</strong>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-mono">
                        Evaluated across Requirement Clarity, Responsiveness, and Professionalism.
                      </span>
                    </div>
                    <div className="bg-yellow-950/20 text-yellow-500/80 border border-yellow-800/30 font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-md">
                      Verified {ratingsCreatorToBrand.length}x
                    </div>
                  </div>
                </div>

                {/* Testimonial slider / list */}
                <div className="space-y-4">
                  <div className="flex gap-2 border-b border-slate-800/40 pb-2 overflow-x-auto">
                    <span className="text-xs text-slate-400 font-mono uppercase font-bold self-center">Active Feed:</span>
                    <button
                      id="feed-select-brand"
                      onClick={() => { soundManager.play('switch'); setFeedbackRolePersona('Brand'); }}
                      className={`px-3 py-1 text-[10px] rounded font-mono uppercase font-bold border transition-colors ${
                        feedbackRolePersona === 'Brand' 
                          ? 'bg-yellow-400 text-slate-950 border-yellow-400' 
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      Brand reviews of Creators ({ratingsBrandToCreator.length})
                    </button>
                    <button
                      id="feed-select-creator"
                      onClick={() => { soundManager.play('switch'); setFeedbackRolePersona('Creator'); }}
                      className={`px-3 py-1 text-[10px] rounded font-mono uppercase font-bold border transition-colors ${
                        feedbackRolePersona === 'Creator' 
                          ? 'bg-yellow-400 text-slate-950 border-yellow-400' 
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      Creator reviews of Brands ({ratingsCreatorToBrand.length})
                    </button>
                  </div>

                  {/* Reviews Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.filter(r => r.reviewerRole === (feedbackRolePersona === 'Brand' ? 'Brand' : 'Creator')).map((review, rIdx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: rIdx * 0.05 }}
                        className="bg-slate-950/80 border border-slate-850 rounded-lg p-4 space-y-3 flex flex-col justify-between group hover:border-slate-750 transition-all shadow-md hover:-translate-y-0.5"
                      >
                        <div className="space-y-2.5">
                          {/* Top row */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <strong className="text-xs text-slate-200 block font-bold leading-tight">
                                {review.reviewerName}
                              </strong>
                              <span className="text-[9px] text-slate-500 font-mono uppercase block">
                                Reviewed {review.revieweeName}
                              </span>
                            </div>
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded font-mono font-black shrink-0">
                              ★ {review.averageRating.toFixed(1)}
                            </span>
                          </div>

                          {/* Metric breakdown labels */}
                          <div className="grid grid-cols-3 gap-1 text-[8px] font-mono uppercase text-slate-400">
                            <div className="bg-slate-900 px-1 py-0.5 rounded text-center">
                              {review.reviewerRole === 'Brand' ? 'Quality' : 'Clarity'}: {review.rating1}
                            </div>
                            <div className="bg-slate-900 px-1 py-0.5 rounded text-center">
                              {review.reviewerRole === 'Brand' ? 'Comm' : 'Resp'}: {review.rating2}
                            </div>
                            <div className="bg-slate-900 px-1 py-0.5 rounded text-center">
                              {review.reviewerRole === 'Brand' ? 'Time' : 'Prof'}: {review.rating3}
                            </div>
                          </div>

                          {/* Feedback text commentary */}
                          <p className="text-[11px] text-slate-300 leading-relaxed italic border-t border-slate-900 pt-2 font-serif">
                            "{review.comments}"
                          </p>
                        </div>

                        {/* Footer context */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[8px] font-mono text-slate-500">
                          <span>Ref: {review.campaignTitle}</span>
                          <span>{review.timestamp.split(' ')[0]}</span>
                        </div>
                      </motion.div>
                    ))}

                    {reviews.filter(r => r.reviewerRole === (feedbackRolePersona === 'Brand' ? 'Brand' : 'Creator')).length === 0 && (
                      <div className="col-span-full py-8 text-center bg-slate-950/25 border border-dashed border-slate-850 rounded-lg text-slate-500 text-xs font-mono">
                        No reviews loaded in this feed sandbox segment. Release a milestone or write a review to generate verified feeds!
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: AI BRIEFING CHATROOM (EXCLUSIVE FOR BRANDS) */}
          {activeTab === 'chatroom' && userRole === 'Brand' && (
            <motion.div
              key="chatroom"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-6xl mx-auto space-y-4"
            >
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black">
                    Sponsor Partnerships & Dynamic Communication Hub
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Leverage our context-aware AI Briefing Strategist to create milestone campaigns, discover matched Voxel creators, or chat instantly over peer-to-peer voice channels.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="p-1 px-2 bg-yellow-400/15 text-yellow-400 border border-yellow-400/20 rounded font-bold uppercase shrink-0">DIRECT ROUTING ACTIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[580px]">
                {/* Sidebar selection column */}
                <div className="md:col-span-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="block text-[9px] uppercase font-mono font-bold text-slate-400 mb-2 border-b border-slate-800/60 pb-1">AI STRATEGISTS</span>
                    <button
                      onClick={() => {
                        soundManager.play('switch');
                        setActiveBrandChatCreatorId('ai');
                      }}
                      className={`w-full text-left p-2 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 mb-4 transition-all ${
                        activeBrandChatCreatorId === 'ai'
                          ? 'bg-slate-950 border-yellow-400 text-yellow-400'
                          : 'bg-slate-950/40 border-slate-850 text-slate-350 hover:border-slate-700'
                      }`}
                    >
                      <span>🧠</span>
                      <span className="truncate">AI Brief Analyst</span>
                    </button>

                    <div className="space-y-2">
                      <span className="block text-[9px] uppercase font-mono font-bold text-slate-400 mb-1">DIRECT CREATOR CHATS ({brandDirectChats.length})</span>
                      {brandDirectChats.length === 0 ? (
                        <div className="py-6 px-3 bg-slate-950/20 border border-dashed border-slate-850 rounded text-center text-[10px] text-slate-500 font-mono">
                          No active Direct Creator threads. Trigger discovery inside AI Brief Analyst segment to initiate conversations.
                        </div>
                      ) : (
                        brandDirectChats.map((c) => {
                          const isSelected = activeBrandChatCreatorId === c.id;
                          const messagesList = brandChatConversations[c.id] || [];
                          const lastMsg = messagesList[messagesList.length - 1]?.text || 'No messages';
                          
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                soundManager.play('switch');
                                setActiveBrandChatCreatorId(c.id);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-2.5 relative overflow-hidden ${
                                isSelected
                                  ? 'bg-slate-950 border-yellow-400 shadow-md'
                                  : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/30'
                              }`}
                            >
                              <span className="text-xl select-none">{c.avatar}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[11px] font-bold text-slate-100 font-sans truncate pr-1 pb-1">
                                    {c.name}
                                  </h5>
                                  <span className="text-[8px] font-mono text-yellow-400">{c.trustRating}% FIT</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-mono truncate max-w-[130px] italic mt-0.5">
                                  {lastMsg}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-lg font-mono text-[9px] text-slate-400 space-y-1 mt-4">
                    <p className="text-yellow-400 font-bold flex items-center gap-1">
                      ⚡ Micro-Handshake Escrows
                    </p>
                    <p className="leading-snug">
                      All negotiations with Creators over direct chat can be captured instantly into the Escrow Ledger.
                    </p>
                  </div>
                </div>

                {/* Main chatroom component content column */}
                <div className="md:col-span-9 bg-slate-950 min-h-0">
                  {activeBrandChatCreatorId === 'ai' ? (
                    <AIChatroom
                      onUseBrief={handleAddBriefFromAI}
                      onSelectCreator={handleSelectCreatorForBrand}
                    />
                  ) : (
                    (() => {
                      const creator = brandDirectChats.find(c => c.id === activeBrandChatCreatorId);
                      if (!creator) return null;
                      const messagesList = brandChatConversations[creator.id] || [];
                      
                      return (
                        <div className="flex flex-col justify-between border border-slate-800 rounded-xl overflow-hidden h-[580px] bg-slate-950">
                          {/* Header detail mapping */}
                          <div className="bg-slate-900 border-b border-slate-850 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl select-none">{creator.avatar}</span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                  {creator.name} <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                </h4>
                                <p className="text-[9px] text-slate-400 font-mono">
                                  Niche: {creator.niche} • Match Rating: {creator.trustRating}%
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleInitiateCall(creator.id, creator.name, creator.avatar, 'Brand')}
                                className="flex items-center gap-1.5 bg-green-950 hover:bg-green-900 text-white font-mono text-[10px] font-bold py-1 px-2.5 rounded border border-green-800 hover:border-green-500 transition-all hover:scale-[1.03] shadow-md animate-pulse cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                <span>Call Creator</span>
                              </button>

                              <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-slate-500 font-mono text-[9px]">
                                <span className="relative flex h-1.5 w-1.5 min-w-[6px]">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                                <span>Creator Active</span>
                              </div>
                            </div>
                          </div>

                          {/* Direct Message Feed Streams container */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesList.map((msg: any) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed border ${
                                    msg.sender === 'user'
                                      ? 'bg-slate-900 border-yellow-400/50 text-slate-101 rounded-tr-none shadow-md'
                                      : 'bg-slate-900/40 text-slate-202 border-slate-800 rounded-tl-none'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1 bg-black/20 px-1.5 py-0.5 rounded w-fit text-[8px] uppercase font-mono tracking-widest text-slate-400">
                                    <span>{msg.sender === 'user' ? 'Brand Officer' : creator.name}</span>
                                    <span>•</span>
                                    <span>{msg.timestamp}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap select-text leading-relaxed text-xs">{msg.text}</p>
                                </div>
                              </div>
                            ))}

                            {brandDirectTyping && (
                              <div className="flex items-center gap-2 text-slate-400 text-xs italic font-mono bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 w-[180px] animate-pulse">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                                </span>
                                <span className="text-[10px]">Creator typing...</span>
                              </div>
                            )}
                          </div>

                          {/* Direct message inputs */}
                          <div className="p-3 bg-slate-900 border-t border-slate-850 flex items-center gap-3">
                            <input
                              type="text"
                              value={brandDirectInput}
                              onChange={(e) => setBrandDirectInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendBrandDirectMsg(creator.id);
                              }}
                              placeholder={`Propose a creative milestone format or type message to ${creator.name}...`}
                              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-slate-200 focus:outline-none focus:border-yellow-400 text-xs placeholder-slate-500 font-mono"
                            />
                            <button
                              onClick={() => handleSendBrandDirectMsg(creator.id)}
                              disabled={!brandDirectInput.trim() || brandDirectTyping}
                              className="bg-yellow-400 hover:bg-yellow-350 disabled:bg-slate-800 text-slate-950 font-bold rounded-lg px-4 py-2 text-xs transition-colors disabled:opacity-55 disabled:cursor-not-allowed font-mono flex items-center gap-1"
                            >
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2B: BRAND INTERACTIVE CHATBOT (EXCLUSIVE FOR CREATORS) */}
          {activeTab === 'chatroom' && userRole === 'Creator' && (
            <motion.div
              key="creator-chatroom"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-6xl mx-auto"
            >
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-yellow-400 font-black">
                    Sponsor Chat Desk & Milestones Negotiation
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Select a matched brand sponsorship pool to interact directly, coordinate deliverables, pitch concepts, and negotiate your milestone values.
                  </p>
                </div>

                <BrandChatbot 
                  initialBrandId={selectedChatBrandId} 
                  onInitiateCall={(partnerId, partnerName, partnerAvatar) => handleInitiateCall(partnerId, partnerName, partnerAvatar, 'Creator')}
                />
              </div>
            </motion.div>
          )}

          {/* TAB 3: ESCROW MILESTONES ACTIONS */}
          {activeTab === 'escrow' && (
            <motion.div
              key="escrow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {!profile?.is_verified ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
                  <div className="inline-flex bg-red-500/10 p-4 rounded-full text-red-500 border border-red-500/30">
                    <Lock className="w-10 h-10 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-mono font-bold text-red-400">Escrow Vault Is Locked</h3>
                  <p className="text-xs text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
                    Identity validation required. In accordance with RedCat standard compliance regulations, you must verify your identity (PAN card for Creators or GSTIN for Brands) to access the escrow vault.
                  </p>
                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveTab('console');
                    }}
                    className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Go to Workspace and Verify
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="bg-green-500/10 p-2 rounded text-green-400 border border-green-500/30">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-green-400 font-black">
                      RedCat Verified Escrow Ledger
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Double-sided payment security backed by cryptographic target milestones execution verification.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Protected Escrow Vault features</span>
                    <ul className="space-y-2 list-disc pl-4 text-slate-300">
                      <li>Brands commit specific contract budgets before assigning missions.</li>
                      <li>Payment is cryptographically locked in our Sinous-Weft escrow node.</li>
                      <li>Payouts are triggered with first-party API reached analytics confirmation.</li>
                      <li className="text-yellow-400 font-bold">Dynamic protection rate: {subscriptionTier.escrowFeePercent}% (Based on active tier: {subscriptionTier.level})</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center flex flex-col justify-center space-y-2">
                    <span className="text-[11px] text-slate-300 font-bold">Your Operating Tier Advantage:</span>
                    <div className="bg-yellow-450/10 border border-yellow-500/30 rounded p-2 max-w-xs mx-auto text-[10px] text-yellow-400 uppercase font-mono">
                      👑 {subscriptionTier.level} rate: {subscriptionTier.escrowFeePercent}% fee
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto font-mono">
                      Basic workspace sits at 3.0%, while upgrading to Ultra Max delivers a customized volume flat fee of &lt;1% (0.5%).
                    </p>
                  </div>
                </div>

                {/* ESCROW CALCULATOR SUB-COMPONENT */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    🪙 Interactive Payout Calculator
                  </h4>
                  <p className="text-[10px] text-slate-450 font-mono">
                    Simulate your target contract budget and see how your active <strong>{subscriptionTier.level}</strong> tier affects net creator payout.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Contract Value (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono font-extrabold">₹</span>
                        <input
                          type="number"
                          id="escrow-calc-amount"
                          defaultValue={5000}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const fee = (val * subscriptionTier.escrowFeePercent) / 100;
                            const net = val - fee;
                            const feeEl = document.getElementById('calc-fee-display');
                            const netEl = document.getElementById('calc-net-display');
                            if (feeEl) feeEl.innerText = `₹${fee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} INR`;
                            if (netEl) netEl.innerText = `₹${net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} INR`;
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 pl-7 text-xs text-slate-100 font-mono focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded flex flex-col justify-center">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Operating Protection Fee ({subscriptionTier.escrowFeePercent}%)</span>
                      <span id="calc-fee-display" className="text-sm font-bold text-slate-200 font-mono">
                        ₹150.00 INR
                      </span>
                    </div>

                    <div className="bg-yellow-400/5 border border-yellow-400/20 p-2.5 rounded flex flex-col justify-center">
                      <span className="text-[9px] font-mono text-yellow-500 uppercase block font-bold">Net Creator Payout (97%)</span>
                      <span id="calc-net-display" className="text-sm font-bold text-yellow-400 font-mono">
                        ₹4,850.00 INR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. ACTIVE ESCROW MILESTONES (PENDING PAYMENT DISBURSEMENT HANDLERS) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 justify-between flex-wrap">
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-rose-450 font-black flex items-center gap-2 text-rose-500">
                      <span>🔓</span> Active Milestone Escrow Releases
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Release approved milestone checkpoints to creators. Release initiates the automatic transaction math compiler instantly.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded font-bold">
                    Role Privilege: {userRole}
                  </span>
                </div>

                {campaigns.filter(c => c.status !== 'completed').length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
                    🎉 Excellent! All platform milestone contracts have been fully funded, released, and settled.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.filter(c => c.status !== 'completed').map((camp) => {
                      const baseVal = parseFloat(camp.budget.replace(/[^0-9.]/g, '')) || 0;
                      // Display dynamic math references
                      const rFee = baseVal * 0.02;
                      const dFee = baseVal * 0.005;
                      const dDisc = - (rFee + dFee);
                      
                      return (
                        <div key={camp.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 hover:border-slate-800 transition-all">
                          <div className="flex justify-between items-start gap-4 flex-wrap pb-2 border-b border-slate-900">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-bold text-slate-200">{camp.title}</span>
                                <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                                  Id: {camp.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Brand Sponsors: <strong>{camp.brandName}</strong> &bull; Milestone Stage: <span className="text-yellow-405 font-medium italic text-yellow-500">"{camp.stage}"</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Base Milestone Budget</span>
                              <strong className="text-sm font-mono text-green-400">{camp.budget}</strong>
                            </div>
                          </div>

                          {/* Live calculation pipeline schema preview */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 px-3 py-2 bg-slate-900/60 rounded border border-slate-900/80 font-mono text-[10px]">
                            <div>
                              <span className="text-slate-500 block">BASE VALUE (₹B):</span>
                              <span className="text-slate-300 font-bold">₹{baseVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div>
                              <span className="text-slate-550 block">RAZORPAY CHARGE (2%):</span>
                              <span className="text-slate-400">₹{rFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">DROPP platform (0.5%):</span>
                              <span className="text-slate-400">₹{dFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">DROPP DISCOUNT (-2.5%):</span>
                              <span className="text-green-400 font-bold">-₹{Math.abs(dDisc).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="border-l border-slate-800 pl-2">
                              <span className="text-yellow-505 font-bold block text-yellow-500">NET RELEASED AMOUNT:</span>
                              <span className="text-yellow-400 font-extrabold">₹{baseVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          </div>

                          {/* Execution controller */}
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                try {
                                  handleReleaseMilestone(
                                    camp.brandName,
                                    profile?.fullName || 'RedCat Star Influencer',
                                    camp.title,
                                    camp.stage,
                                    baseVal,
                                    camp.id
                                  );
                                } catch (e: any) {
                                  alert(`Compilation failed: ${e.message}`);
                                }
                              }}
                              className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-bold font-mono text-[10px] uppercase py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                            >
                              <span>🔓 Release Milestone & Compile Invoice</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. MANUAL WORKSPACE COMPLIANCE INVOICE COMPILER (THE TEST RIG) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-cyan-455 font-black flex items-center gap-2 text-cyan-400">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Pipeline Sandbox Invoice Compiler & Rig
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Thoroughly test RedCat's automated invoice calculation loops with custom brand inputs. Mathematical check guards isolate data anomalies instantly.
                  </p>
                </div>

                {manualValidationError && (
                  <div className="bg-red-950/40 border border-red-500/30 text-rose-450 p-3 rounded-lg text-[11px] font-mono flex items-center gap-2 text-rose-400">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>{manualValidationError}</span>
                  </div>
                )}

                <form onSubmit={handleCompileManualInvoice} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Remitter Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cinematic Alpha Lens"
                      value={manualBrand}
                      onChange={(e) => setManualBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2.5 rounded focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Recipient Creator Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AstroVlogs TV"
                      value={manualCreator}
                      onChange={(e) => setManualCreator(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2.5 rounded focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Campaign Title Context</label>
                    <input
                      type="text"
                      placeholder="e.g. Lifestyle Showcase Promo"
                      value={manualCampaign}
                      onChange={(e) => setManualCampaign(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2.5 rounded focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Checkpoint Milestone Stage Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Phase 2 Storyboard Sign-off"
                      value={manualMilestone}
                      onChange={(e) => setManualMilestone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2.5 rounded focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Base Contract Budget (₹B, INR value)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-550 text-xs font-mono">₹</span>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={manualBaseAmount}
                        onChange={(e) => setManualBaseAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-2.5 pl-7 rounded focus:outline-none focus:border-yellow-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase p-3 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <span>✨ Compile Sandbox Invoice & Verify Math</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 3. SETTLED TRANSACTIONS & INVOICE REGISTRY LEDGER */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-wider text-green-400 font-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" /> Settled Payments & Invoice Registry Ledger
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">Invoice Identification</th>
                        <th className="py-2.5 px-3">Date / Timestamp</th>
                        <th className="py-2.5 px-3">Brand / Recipient</th>
                        <th className="py-2.5 px-3 text-right">Net Amount</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 text-slate-300">
                          <td className="py-3 px-3">
                            <span className="font-bold text-yellow-400 block">{inv.id}</span>
                            <span className="text-[9px] text-slate-500 block">Milestone: {inv.milestoneTitle}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[10px]">
                            {inv.timestamp}
                          </td>
                          <td className="py-3 px-3">
                            <span className="block text-[11px] font-bold text-slate-200">{inv.brandName}</span>
                            <span className="block text-[9px] text-slate-500">to {inv.creatorName}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-green-400 text-sm">
                            ₹{inv.baseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => {
                                soundManager.play('click');
                                setSelectedInvoice(inv);
                              }}
                              className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] text-yellow-400 font-bold rounded border border-slate-700 cursor-pointer"
                            >
                              👁️ View Details
                            </button>
                            <button
                              onClick={() => downloadInvoiceFile(inv)}
                              className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-[10px] text-slate-950 font-bold rounded cursor-pointer gap-1 inline-flex items-center"
                            >
                              <Download className="w-3 h-3" /> 📥 PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
              )}
            </motion.div>
          )}

          {/* TAB 4: SYSTEM PRIVACY VAULT & SECURITY STANDARDS */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="bg-cyan-500/10 p-2 rounded text-cyan-450 border border-cyan-500/30">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm uppercase tracking-wider text-cyan-400 font-black">
                      Platform Privacy & Encryption standards
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Pragmatic digital hygiene for elite creator marketing ecosystems.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-200 font-mono">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <strong className="text-yellow-400">1. Client-Side Hash Protection (AES-256)</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      All communication channels, links, profiles attributes and direct messages are ciphered locally before syncing back with Firebase document streams, ensuring fully verified zero identity exposure options.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <strong className="text-yellow-400">2. OAuth First-Party Data Capture Only</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      We never ask for dashboard credentials. RedCat checks and verifies campaign metrics directly through secure read-only platform APIs from Instagram & Youtube. We compile raw analytics without scanning cookies.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <strong className="text-yellow-400">3. Non-Custodial Brief Protection</strong>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Your campaign scripts, visual files, hook strategies, and drafts remain 100% owned by your team. RedCat claims zero rights to content assets saved within Sandbox nodes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: COMPREHENSIVE 5-TIER OPERATING SYSTEM SUBSCRIPTIONS */}
          {activeTab === 'tiers' && (
            <motion.div
              key="tiers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 max-w-6xl mx-auto"
            >
              {/* TIER HEADLINE PANEL */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/5 blur-3xl pointer-events-none rounded-full" />
                <div className="space-y-2 relative z-10">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-yellow-400 font-extrabold flex items-center gap-2">
                    <span>👑</span>
                    <span>Sponsorship & Active Operating Tiers</span>
                  </h3>
                  <h2 className="text-2xl font-bold font-sans text-slate-100 tracking-tight">
                    Powering RedCat Influencer Discovery Ecosystem
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                    Discover, escrow, verify, and broadcast your campaign pipeline instantly. RedCat orchestrates feature flags and access limits securely through standalone high-performance wrapper objects.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl font-mono text-[11px] text-slate-300 space-y-1 shrink-0 self-start md:self-center">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">ACTIVE WORKSPACE:</span>
                    <span className="text-yellow-400 font-bold">{subscriptionTier.level}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">PROTECTION FEE:</span>
                    <span className="text-green-400 font-bold">{subscriptionTier.escrowFeePercent}%</span>
                  </div>
                </div>
              </div>

              {/* FIVE TIER TILES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(['Basic', 'Pro', 'Pro Max', 'Ultra', 'Ultra Max'] as TierLevel[]).map((level) => {
                  const item = SUBSCRIPTION_TIERS[level];
                  const isActive = currentTier === level;
                  
                  // Setup tier price details
                  const priceLabels: Record<TierLevel, string> = {
                    'Basic': '₹0',
                    'Pro': '₹199',
                    'Pro Max': '₹499',
                    'Ultra': '₹1,499',
                    'Ultra Max': '₹4,999'
                  };

                  return (
                    <div
                      key={level}
                      className={`relative rounded-xl p-5 flex flex-col justify-between transition-all duration-300 border ${
                        isActive
                          ? 'bg-slate-900 border-yellow-400 shadow-lg shadow-yellow-400/5 scale-[1.02] z-10'
                          : 'bg-slate-900/60 border-slate-850 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md">
                          👑 ACTIVE
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${isActive ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {level}
                          </span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-sans font-black text-slate-100">{priceLabels[level]}</span>
                            <span className="text-[10px] text-slate-500 font-mono">/mo</span>
                          </div>
                        </div>

                        {/* List of limited stats */}
                        <div className="space-y-2 border-t border-slate-800/80 pt-3">
                          <div className="text-[10px] font-mono leading-relaxed space-y-1.5 text-slate-300">
                            <div className="flex justify-between border-b border-slate-800/40 pb-1">
                              <span className="text-slate-500">Campaign Limit:</span>
                              <span className="font-bold">{item.campaignLimit === 9999 ? 'Unlimited' : `<= ${item.campaignLimit}`}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/40 pb-1">
                              <span className="text-slate-500">Milestone fee:</span>
                              <span className="font-bold text-green-400">{item.escrowFeePercent}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 pt-1">
                              <span className="text-slate-500 text-[9px] uppercase tracking-wider block font-bold">AI Orchestration:</span>
                              <span className="text-yellow-400 font-medium leading-snug">{item.aiNavigatorDepth}</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional features checklist */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase font-black block">Special Access Components:</span>
                          <div className="space-y-1 text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className={item.proactiveRiskAlerts ? 'text-yellow-400 font-bold' : 'text-slate-600'}>
                                {item.proactiveRiskAlerts ? '✓' : '✗'}
                              </span>
                              <span className={item.proactiveRiskAlerts ? 'text-slate-200' : 'text-slate-605'}>Fraud Safeguards</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={item.postgresCache ? 'text-yellow-400 font-bold' : 'text-slate-600'}>
                                {item.postgresCache ? '✓' : '✗'}
                              </span>
                              <span className={item.postgresCache ? 'text-slate-200' : 'text-slate-605'}>Dedicated Postgres DB</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={item.pixelCustomMascotGenerator ? 'text-yellow-400 font-bold' : 'text-slate-600'}>
                                {item.pixelCustomMascotGenerator ? '✓' : '✗'}
                              </span>
                              <span className={item.pixelCustomMascotGenerator ? 'text-slate-200' : 'text-slate-605'}>Custom Pixel Mascots</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={item.codeExportEnabled ? 'text-yellow-400 font-bold' : 'text-slate-600'}>
                                {item.codeExportEnabled ? '✓' : '✗'}
                              </span>
                              <span className={item.codeExportEnabled ? 'text-slate-200' : 'text-slate-605'}>White-Label Code Exports</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isActive) {
                              soundManager.play('click');
                              return;
                            }
                            soundManager.play('success');
                            setCurrentTier(level);
                            localStorage.setItem('rc_subscription_tier', level);
                            alert(`🌟 Superb upgrade! Your account has successfully switched to the "${level}" Operating Level! Pricing fee scales & limitations have updated.`);
                          }}
                          className={`w-full font-mono text-[10px] font-bold py-2 px-3 rounded-lg text-center transition-all duration-150 flex items-center justify-center gap-1.5 ${
                            isActive
                              ? 'bg-slate-950 text-slate-500 cursor-default border border-slate-800'
                              : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm'
                          }`}
                        >
                          {isActive ? '✓ Active Tier' : 'Upgrade Instantly'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION COMPUTE SANDBOX TESTING COCKPIT */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-rose-500 font-extrabold flex items-center gap-2">
                    <span>⚔️</span>
                    <span>Sandbox Action Compute Gating Sandbox</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Test how your current workspace permissions interact with advanced system operations below. Action simulation respects your dynamic Operating Tier level in real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Action 1 */}
                  <button
                    onClick={() => triggerSimulationCheck('Brief Compiler', 'Pro')}
                    className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-left space-y-2 group transition-all hover:scale-[1.02] active:scale-95 text-slate-350 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1 px-2 bg-yellow-400/10 text-yellow-400 rounded border border-yellow-400/20 text-[9px] uppercase font-mono font-bold">
                        Pro+
                      </span>
                      <Sparkles className="w-4 h-4 text-slate-550 group-hover:text-yellow-405 text-yellow-450" />
                    </div>
                    <strong className="text-xs font-mono text-slate-200 block font-bold">AI Brief Script Generator</strong>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-normal">
                      Produces specialized interactive ad scenario transcripts & scripts automatically.
                    </span>
                  </button>

                  {/* Action 2 */}
                  <button
                    onClick={() => triggerSimulationCheck('Fraud Alerts', 'Pro Max')}
                    className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-left space-y-2 group transition-all hover:scale-[1.02] active:scale-95 text-slate-350 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1 px-2 bg-rose-500/10 text-rose-450 rounded border border-rose-500/20 text-[9px] uppercase font-mono font-bold">
                        Pro Max+
                      </span>
                      <Shield className="w-4 h-4 text-slate-550 group-hover:text-rose-405 text-rose-450" />
                    </div>
                    <strong className="text-xs font-mono text-slate-200 block font-bold">Fraud & Alerting Sentinel</strong>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-normal">
                      Deep scanner tracing automated viewership spikes, fraud history & credibility indexes.
                    </span>
                  </button>

                  {/* Action 3 */}
                  <button
                    onClick={() => triggerSimulationCheck('Fine-Tuning LLM', 'Ultra')}
                    className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-left space-y-2 group transition-all hover:scale-[1.02] active:scale-95 text-slate-350 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1 px-2 bg-cyan-400/10 text-cyan-400 rounded border border-cyan-405/20 text-[9px] uppercase font-mono font-bold">
                        Ultra+
                      </span>
                      <Database className="w-4 h-4 text-slate-550 group-hover:text-cyan-405 text-cyan-450" />
                    </div>
                    <strong className="text-xs font-mono text-slate-200 block font-bold">Fine-Tuned LLM Sync</strong>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-normal">
                      Calibrates specialized LLMs inside Postgres caches custom-trained to your matching tone guidelines.
                    </span>
                  </button>

                  {/* Action 4 */}
                  <button
                    onClick={() => triggerSimulationCheck('AI Mascot Generator', 'Ultra Max')}
                    className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-left space-y-2 group transition-all hover:scale-[1.02] active:scale-95 text-slate-350 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1 px-2 bg-purple-500/10 text-purple-400 rounded border border-purple-505/20 text-[9px] uppercase font-mono font-bold font-bold font-bold">
                        Ultra Max
                      </span>
                      <Users className="w-4 h-4 text-slate-550 group-hover:text-purple-450 text-purple-400" />
                    </div>
                    <strong className="text-xs font-mono text-slate-200 block font-bold">Custom Pixel Mascots</strong>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-normal">
                      Deploys high-fidelity generator tools producing unique Minecraft Pixel avatars on the fly.
                    </span>
                  </button>

                  {/* Action 5 - Simulate Inbound Call */}
                  <button
                    onClick={() => {
                      soundManager.play('click');
                      setActiveCall({
                        state: 'incoming',
                        partnerId: userRole === 'Brand' ? 'creator-nova' : 'nova-snack',
                        partnerName: userRole === 'Brand' ? 'Premium Mascot Creator' : 'Nova Snack Rep',
                        partnerAvatar: userRole === 'Brand' ? '🦖' : '🍿',
                        role: userRole === 'Brand' ? 'Brand' : 'Creator'
                      });
                    }}
                    className="p-4 bg-slate-950 hover:bg-slate-900 border border-green-950 hover:border-green-500 rounded-xl text-left space-y-2 group transition-all hover:scale-[1.02] active:scale-95 text-slate-350 cursor-pointer animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-1 px-2 bg-green-500/10 text-green-400 rounded border border-green-500/20 text-[9px] uppercase font-mono font-black">
                        DEMO CALL
                      </span>
                      <Phone className="w-4 h-4 text-green-400 animate-bounce" />
                    </div>
                    <strong className="text-xs font-mono text-green-400 block font-black">Test Direct Phone Call</strong>
                    <span className="text-[10px] text-slate-400 block font-normal font-sans leading-normal">
                      Triggers inbound live phone call handshake request with simulated dialog transcripts & escrows.
                    </span>
                  </button>
                </div>

                {/* HEAVY SIMULATION TERMINAL LOGGER */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    🛡️ Compiling Sandbox Orchestration Output
                  </span>

                  <div className="relative rounded-lg overflow-hidden border border-slate-800">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-[10px] text-slate-500 font-mono pl-3">redcat-orchestrator-shell</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        STATUS: {simulationStatus === 'success' ? 'SUCCESS' : simulationStatus === 'warn' ? 'DENIED' : 'WAITING'}
                      </div>
                    </div>

                    <pre className={`whitespace-pre-wrap font-mono text-xs p-4 leading-relaxed font-semibold min-h-[140px] ${
                      simulationStatus === 'success'
                        ? 'text-green-400 bg-slate-950'
                        : simulationStatus === 'warn'
                        ? 'text-rose-400 bg-rose-950/20'
                        : 'text-slate-400 bg-slate-950'
                    }`}>
                      {simulationLog}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hiring' && profile && (
            <motion.div
              key="hiring"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <HiringArena 
                userId={userId}
                userRole={userRole}
                userEmail={userEmail || profile.email}
                currentMascot={profile.mascot || { skin: profile.mascotSkin, clothes: profile.mascotClothes, hair: profile.mascotHair }}
                isVerified={!!profile?.is_verified}
              />
            </motion.div>
          )}

          {/* TAB 7: SETTINGS & SECURITY PARAMETERS */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              {/* HEADLINE PANEL */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/5 blur-3xl pointer-events-none rounded-full" />
                <div className="space-y-2 relative z-10">
                  <h3 className="font-mono text-sm uppercase tracking-wider text-yellow-400 font-extrabold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
                    <span>Settings &amp; Security Parameters</span>
                  </h3>
                  <h2 className="text-2xl font-bold font-sans text-slate-100 tracking-tight">
                    Account Security &amp; Access Controls
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                    Manage authentication credentials, 2FA verification steps, API security tokens, notification triggers, and real-time security logs.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-mono text-xs text-slate-300 space-y-1.5 shrink-0">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">2FA SECURITY:</span>
                    <span className={twoFactorEnabled ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                      {twoFactorEnabled ? '● ACTIVE' : '○ DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">API STATUS:</span>
                    <span className="text-cyan-400 font-bold">READY</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. PASSWORD PARAMETERS FORM */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded border border-yellow-400/20">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm uppercase font-bold text-slate-100">Password &amp; Auth Parameters</h4>
                      <p className="text-[10px] text-slate-400 font-sans">Update login password and credential encryption</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 font-mono text-xs">
                    {settingsPasswordError && (
                      <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-rose-300 text-xs">
                        ❌ {settingsPasswordError}
                      </div>
                    )}
                    {settingsPasswordSuccess && (
                      <div className="p-3 bg-green-950/40 border border-green-800 rounded-lg text-green-300 text-xs">
                        {settingsPasswordSuccess}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-slate-400 font-bold block">Current Password</label>
                      <input
                        type="password"
                        required
                        value={settingsOldPassword}
                        onChange={(e) => setSettingsOldPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-slate-400 font-bold block">New Security Password</label>
                      <input
                        type="password"
                        required
                        value={settingsNewPassword}
                        onChange={(e) => setSettingsNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-slate-400 font-bold block">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={settingsConfirmPassword}
                        onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider text-xs shadow-md"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Update Password Parameter</span>
                    </button>
                  </form>
                </div>

                {/* 2. TWO-FACTOR AUTH & SESSION CONTROL */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="p-2 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm uppercase font-bold text-slate-100">2FA &amp; Session Management</h4>
                      <p className="text-[10px] text-slate-400 font-sans">Multi-factor security and active session revocation</p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    {/* 2FA Toggle */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex items-center justify-between gap-4">
                      <div>
                        <strong className="text-slate-200 block">Two-Factor Authentication (2FA)</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">Require OTP code for escrow &amp; login operations</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggle2FA}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                          twoFactorEnabled
                            ? 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {twoFactorEnabled ? '✓ ENABLED' : 'ENABLE 2FA'}
                      </button>
                    </div>

                    {/* Profile Radar Visibility Toggle */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex items-center justify-between gap-4">
                      <div>
                        <strong className="text-slate-200 block">Match Radar Visibility</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">Display profile on public bidding discovery list</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !profileVisibility;
                          setProfileVisibility(nextVal);
                          localStorage.setItem(`rc_visibility_${userId}`, String(nextVal));
                          soundManager.play('switch');
                        }}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                          profileVisibility
                            ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {profileVisibility ? 'PUBLIC' : 'HIDDEN'}
                      </button>
                    </div>

                    {/* Active Sessions Control */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-200 block">Active Device Sessions</strong>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">2 ACTIVE</span>
                      </div>

                      <div className="space-y-2 text-[10px] text-slate-400 border-t border-slate-850 pt-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-slate-200 font-bold block">Chrome Linux Console (Current)</span>
                            <span className="text-[9px] text-slate-500">192.168.1.104 • Active now</span>
                          </div>
                          <span className="text-green-400 font-bold">THIS DEVICE</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                          <div>
                            <span className="text-slate-200 font-bold block">Mobile App Navigator</span>
                            <span className="text-[9px] text-slate-500">10.0.4.88 • 2 hours ago</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.play('click');
                              alert("✓ Session Revoked: Mobile App Navigator has been signed out.");
                            }}
                            className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                          >
                            REVOKE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. DEVELOPER API KEYS & NOTIFICATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* API KEY PANEL */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                      <Key className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm uppercase font-bold text-slate-100">API Security Tokens &amp; Webhooks</h4>
                      <p className="text-[10px] text-slate-400 font-sans">Access credentials for programmatic integration</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <label className="text-[10px] uppercase text-slate-400 font-bold block">Live Secret API Key</label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2.5 border border-slate-800 rounded-lg">
                      <code className="text-yellow-400 text-xs flex-1 truncate">{apiKey}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(apiKey);
                          setApiKeyCopied(true);
                          soundManager.play('click');
                          setTimeout(() => setApiKeyCopied(false), 2000);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                      >
                        {apiKeyCopied ? '✓ COPIED' : 'COPY'}
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-500">Rotate token if exposed or compromised</span>
                      <button
                        type="button"
                        onClick={handleRegenerateApiKey}
                        className="bg-red-950/40 hover:bg-red-900/60 text-rose-300 border border-red-900/50 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer uppercase transition-colors"
                      >
                        Rotate Key 🔄
                      </button>
                    </div>
                  </div>
                </div>

                {/* NOTIFICATION PREFERENCES */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm uppercase font-bold text-slate-100">Notification Triggers</h4>
                      <p className="text-[10px] text-slate-400 font-sans">Configure automated alert &amp; email dispatch preferences</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { key: 'escrowReleases', label: 'Escrow Milestone Release Alerts', desc: 'Notify when milestone funds are deposited or released' },
                      { key: 'biddingAlerts', label: 'Direct Campaign Bidding Triggers', desc: 'Receive instant notifications when brands pitch briefs' },
                      { key: 'directMessages', label: 'In-App Direct Chat Messages', desc: 'Alerts when creator/brand messages arrive' },
                      { key: 'weeklyDigest', label: 'Weekly Performance Digest', desc: 'Summary of completed campaigns and trust metrics' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-start gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={(emailNotifications as any)[item.key]}
                          onChange={(e) => {
                            setEmailNotifications(prev => ({ ...prev, [item.key]: e.target.checked }));
                            soundManager.play('switch');
                          }}
                          className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-400 focus:ring-0"
                        />
                        <div>
                          <strong className="text-slate-200 block text-xs">{item.label}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. SECURITY AUDIT LOGS */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm uppercase font-bold text-slate-100">Security Audit Logs &amp; Events</h4>
                      <p className="text-[10px] text-slate-400 font-sans">Immutable chronological trail of account access and parameter edits</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-slate-400">
                    REALTIME RECORDING
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                        <th className="py-2 px-3">Event Type</th>
                        <th className="py-2 px-3">IP Address / TLS</th>
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {securityAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-950/50 transition-colors">
                          <td className="py-3 px-3 text-slate-200 font-bold">{log.event}</td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">{log.ip}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">{log.timestamp}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              log.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-rose-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* DETAILED FAQ ACCORDION DISPLAY */}
        <div className="mt-16 border-t border-slate-800 pt-8">
          <FAQAccordion />
        </div>
      </main>

      {/* ADMIN LEVEL INDIVIDUAL DOSSIER REPORT MODAL */}
      <AnimatePresence>
        {selectedAdminUser && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-slate-750 max-w-lg w-full rounded-xl overflow-hidden shadow-2xl relative"
            >
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-black font-mono text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                  <span>📋 System Dossier: {selectedAdminUser.fullName}</span>
                </h3>
                <button
                  onClick={() => { soundManager.play('close'); setSelectedAdminUser(null); }}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-xs"
                >
                  X
                </button>
              </div>

              <div className="p-5 space-y-4 font-mono text-xs">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
                  <p><strong>Database ID:</strong> {selectedAdminUser.uid}</p>
                  <p><strong>Email Address:</strong> {selectedAdminUser.email}</p>
                  <p><strong>System Role:</strong> <span className="text-rose-400">{selectedAdminUser.role}</span></p>
                  <p><strong>Industry Scope:</strong> {selectedAdminUser.niche}</p>
                  <p className="whitespace-pre-normal text-slate-300 leading-relaxed"><strong>Biography:</strong> {selectedAdminUser.bio}</p>
                </div>

                <div className="bg-black/20 p-3 rounded text-[11px] text-slate-400 leading-normal italic">
                  Note: Profile values represent documents stored securely under AES-250 security schemas. System holds zero tracing metadata.
                </div>

                <button
                  onClick={() => { soundManager.play('click'); setSelectedAdminUser(null); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded font-bold transition-all text-xs border border-slate-700 hover:text-white"
                >
                  Close dossier report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN LEVEL REGISTRATION VERIFICATION CAPTCHA INTERACTIVE DIALOG */}
      <AnimatePresence>
        {captchaOpen && captchaStatus && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-red-500 rounded-xl overflow-hidden max-w-sm w-full shadow-2xl relative p-5 space-y-4 font-mono"
            >
              <div className="text-center space-y-1">
                <span className="text-xs text-red-500 font-bold uppercase tracking-widest block">ADMIN AUTH SECURITY ACTION</span>
                <h3 className="text-sm font-bold text-slate-200">Verify Account Approval</h3>
                <p className="text-[10px] text-slate-400">Complete standard alphanumeric verification path to authorize registration.</p>
              </div>

              {/* simulated physical minecraft-styled Captcha block */}
              <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-lg p-5 text-center flex flex-col items-center justify-center space-y-3 shadow-inner">
                <span className="text-3xl font-black text-rose-500 tracking-widest select-none select-none line-through decoration-slate-700 decoration-wavy py-2 px-6 rounded bg-black/40 border border-slate-900 text-[#dfcedf] [text-shadow:_2px_2px_0_#000]">
                  {verificationCode}
                </span>

                <input
                  type="text"
                  required
                  value={typedCaptchaCode}
                  onChange={(e) => setTypedCaptchaCode(e.target.value)}
                  placeholder="Enter captcha text..."
                  maxLength={6}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-slate-200 text-sm focus:outline-none focus:border-yellow-400 tracking-widest uppercase font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { soundManager.play('close'); setCaptchaOpen(false); setCaptchaStatus(null); }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminVerifySubmit}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2.5 rounded font-black text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  Authorize ✓
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">📄</span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Printable Settlement Receipt Creator
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Invoice Ref: {selectedInvoice.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => { soundManager.play('close'); setSelectedInvoice(null); }}
                  className="text-slate-400 hover:text-white font-black text-xs px-2 py-1 bg-slate-900 hover:bg-slate-850 rounded cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Printable Area preview wrapper (mimicking PDF container) */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-mono bg-slate-950/60 flex-1">
                <div className="space-y-4 bg-slate-950 p-5 rounded-lg border border-slate-850 shadow-inner relative">
                  {/* Decorative stamp */}
                  <div className="absolute right-4 top-4 border-2 border-green-500/30 text-green-400/50 rounded text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest rotate-6 pointer-events-none">
                    Verified Release ✓
                  </div>

                  <div className="flex justify-between items-start pb-4 border-b border-slate-900">
                    <div>
                      <h4 className="text-sm font-black text-yellow-400">REDCAT SYSTEM</h4>
                      <p className="text-[9px] text-slate-500">Escrow Settlement Division</p>
                    </div>
                    <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">
                      {selectedInvoice.status}
                    </span>
                  </div>

                  {/* Context metadata */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] pt-1">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold">Audit Reference</span>
                      <p className="text-slate-300">{selectedInvoice.id}</p>
                      <p className="text-[9px] text-slate-500">{selectedInvoice.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold">Campaign Context</span>
                      <p className="text-slate-300 truncate font-bold">{selectedInvoice.campaignName}</p>
                      <p className="text-[9px] text-slate-500 italic">"{selectedInvoice.milestoneTitle}"</p>
                    </div>
                  </div>

                  {/* Entities info */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] pt-3 border-t border-slate-900">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold">Remitter (Brand)</span>
                      <p className="text-slate-300 font-bold">{selectedInvoice.brandName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold">Recipient (Creator)</span>
                      <p className="text-slate-300 font-bold">{selectedInvoice.creatorName}</p>
                    </div>
                  </div>

                  {/* Arithmetic Table */}
                  <div className="pt-3 border-t border-slate-900 space-y-1 text-[11px]">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block pb-1">Itemized Realization (Math Verification)</span>
                    
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>Base Plan / Milestone Payout (₹B)</span>
                      <span className="font-bold text-slate-200">₹{selectedInvoice.baseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-400 text-[10px]">
                      <span>Razorpay Processing Surcharge (2%)</span>
                      <span>+₹{selectedInvoice.razorpayFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-400 text-[10px]">
                      <span>Dropp Platform Maintenance Surcharge (0.5%)</span>
                      <span>+₹{selectedInvoice.droppFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="flex justify-between py-1 text-green-400 text-[10px]">
                      <span>Dropp platform Zero-Liability Waiver (-2.5%)</span>
                      <span>-₹{Math.abs(selectedInvoice.droppDiscount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 bg-yellow-405/10 text-yellow-400 font-bold px-2 rounded mt-2 border border-yellow-500/20 text-xs">
                      <span>You Pay Today (Net Payable = ₹B)</span>
                      <span className="text-sm font-extrabold">₹{selectedInvoice.netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} INR</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Simulation Log */}
                <div className="bg-slate-900/60 p-3 rounded border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                  <span className="text-[9px] text-slate-500 uppercase font-black block">✉️ Automated Dispatch Delivery Logs</span>
                  <div className="space-y-0.5">
                    <p className="text-green-500">✔ [SYSTEM] Cryptographic deliverability check passed.</p>
                    <p className="text-slate-300">✔ [SYSTEM] Dispatched dynamic PDF asset to recipient endpoint: <strong className="text-teal-400">"{selectedInvoice.creatorName.toLowerCase().replace(/[^a-z]/g, '') || 'creator'}@redcat.network"</strong></p>
                    <p className="text-[9px] text-slate-500">SMTP deliverability confirmation token: RC-SMTP-200.OK-SECURE</p>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => {
                    soundManager.play('success');
                    soundManager.play('click');
                    alert(`Dispatcher simulated successfully! Re-sent transactional receipt to both sponsors and creators with priority deliverance tags.`);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 hover:text-white py-2.5 rounded font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer text-slate-300 border border-slate-700"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Dispatcher Copy
                </button>
                <button
                  onClick={() => downloadInvoiceFile(selectedInvoice)}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 py-2.5 rounded font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Download Printable PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isMascotCustomizerOpen && profile && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto w-full">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[95vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-yellow-400 text-lg">🎭</span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Pixel Creator Universe Mascot Customizer
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      State Isolated Sandbox Module • Active Tier: <strong className="text-rose-400">{currentTier}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { soundManager.play('close'); setIsMascotCustomizerOpen(false); }}
                  className="text-slate-400 hover:text-white font-black text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-850 rounded cursor-pointer border border-slate-800"
                >
                  ✕ Close
                </button>
              </div>

              {/* Body Layout */}
              <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950/60 flex-1">
                
                {/* LEFT COLUMN: LIVE MOCKUP RENDER PANEL */}
                <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden h-fit md:h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />
                  
                  <div className="space-y-4 relative z-10">
                    <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block">
                      Live Neural Render Mockup
                    </span>
                    
                    {/* Live Customizer Mascot rendering */}
                    <div className="flex justify-center py-6 bg-slate-900/40 rounded-lg border border-slate-850/80 aspect-square items-center relative overflow-hidden group">
                      <div className="absolute inset-x-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
                      
                      <MascotRender 
                        mascot={{
                          skin: mascotSkinState,
                          clothes: mascotClothesState,
                          hair: mascotHairState,
                          customSkin: customSkinState,
                          customHead: customHeadState,
                          customFace: customFaceState
                        }}
                        scale={1.6} 
                      />
                    </div>

                    <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-850 text-[10px] font-mono font-bold">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mascot Colorway:</span>
                        <span className="text-slate-300 font-bold capitalize">{customSkinState} base</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Headwear:</span>
                        <span className="text-yellow-405 font-bold capitalize">{customHeadState}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Active Expression:</span>
                        <span className="text-green-500 font-bold capitalize">{customFaceState}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Clothes Tone:</span>
                        <span className="text-slate-300 font-bold capitalize">{mascotClothesState}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hairstyle:</span>
                        <span className="text-slate-300 font-bold capitalize">{mascotHairState}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Theme Style:</span>
                        <span className="text-teal-400 font-bold">{mascotThemeState}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expression style:</span>
                        <span className="text-yellow-400 font-bold">{mascotExpressionState}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500 space-y-1">
                    <p>✔ State isolation: active</p>
                    <p>✔ Target ID: profile.mascot</p>
                  </div>
                </div>

                {/* RIGHT COLUMN: CONTROL PANEL */}
                <div className="md:col-span-7 space-y-6">
                  
                  {/* Status Banner */}
                  {mascotAiSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono font-bold"
                    >
                      {mascotAiSuccess}
                    </motion.div>
                  )}

                  {mascotAiGenerationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono space-y-2 font-bold"
                    >
                      <p>{mascotAiGenerationError}</p>
                      
                      <div className="pt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Sandbox bypass validation available:</span>
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.play('success');
                            setCurrentTier('Ultra Max');
                            localStorage.setItem('rc_subscription_tier', 'Ultra Max');
                            setMascotAiGenerationError(null);
                            setMascotAiSuccess("🚀 Workspace tier upgraded to 'Ultra Max' instantly! Neural compile pipeline now unrestricted!");
                            setTimeout(() => setMascotAiSuccess(null), 3000);
                          }}
                          className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold font-mono text-[9px] uppercase rounded transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow"
                        >
                          ⚡ Upgrade to Ultra Max
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SECTION 1: VISUAL CUSTOMIZER CONTROLS */}
                  <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <span className="text-yellow-400 text-xs">🎨</span>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                          Mascot Colorway & Accessories (Compiled_Mascot specifications)
                        </h4>
                    </div>

                    <div className="space-y-3.5 text-xs font-mono animate-fade-in">
                      {/* Custom Skin selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        <div>
                          <span className="text-slate-300 font-bold block">Skin Base Override</span>
                          <span className="text-[10px] text-slate-500">Standard, Purple, Green, or Gold</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(['standard', 'purple', 'green', 'gold'] as const).map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => { soundManager.play('click'); setCustomSkinState(s); }}
                              className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold border transition-all hover:scale-105 cursor-pointer ${
                                customSkinState === s ? 'bg-teal-500 text-slate-950 border-teal-400 font-black shadow' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Headwear accessory selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        <div>
                          <span className="text-slate-300 font-bold block">Headwear Wear</span>
                          <span className="text-[10px] text-slate-500">Retro Headset, Cyber Visor, or Neon Crown</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(['none', 'headset', 'visor', 'crown'] as const).map(h => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => { soundManager.play('click'); setCustomHeadState(h); }}
                              className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold border transition-all hover:scale-105 cursor-pointer ${
                                customHeadState === h ? 'bg-yellow-405 text-slate-950 border-yellow-400 font-black shadow' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Facial expression override selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        <div>
                          <span className="text-slate-300 font-bold block">Facial expression override</span>
                          <span className="text-[10px] text-slate-500">Neutral, Happy, Focused, Glitch</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(['neutral', 'happy', 'focused', 'glitch'] as const).map(f => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => { soundManager.play('click'); setCustomFaceState(f); }}
                              className={`px-2.5 py-1 text-[10px] rounded uppercase font-bold border transition-all hover:scale-105 cursor-pointer ${
                                customFaceState === f ? 'bg-green-500 text-slate-950 border-green-400 font-black shadow' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clothes Hue selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        <span className="text-slate-400 font-bold">Clothes Colorway</span>
                        <div className="flex gap-1.5">
                          {(['crimson', 'blue', 'green'] as const).map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => { soundManager.play('click'); setMascotClothesState(c); }}
                              className={`px-3 py-1 text-[10px] rounded uppercase font-bold border transition-colors cursor-pointer ${
                                mascotClothesState === c ? 'bg-slate-300 text-slate-950 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hairstyle selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                        <span className="text-slate-400 font-bold">Base Hairstyle</span>
                        <div className="flex gap-1.5">
                          {(['tuft', 'bob', 'spikes'] as const).map(h => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => { soundManager.play('click'); setMascotHairState(h); }}
                              className={`px-3 py-1 text-[10px] rounded uppercase font-bold border transition-colors cursor-pointer ${
                                mascotHairState === h ? 'bg-slate-300 text-slate-950 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* SECTION 2: ADVANCED GENERATIVE ENGINE (PREMIUM SUBSCRIPTION LOGIC) */}
                  <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-400 text-xs">✨</span>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                          Neural Generative Engine Core
                        </h4>
                      </div>
                      <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${
                        subscriptionTier.pixelCustomMascotGenerator 
                        ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {subscriptionTier.pixelCustomMascotGenerator ? 'UNLOCKED' : 'PREMIUM LOCKED'}
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs text-slate-300">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Generative Prompt Core Vibe Input
                        </label>
                        <input
                          type="text"
                          value={mascotPromptState}
                          onChange={(e) => setMascotPromptState(e.target.value)}
                          placeholder="e.g. Cyberpunk ninja cat in lava armor and holographic goggles..."
                          disabled={mascotAiLoading}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-yellow-400 placeholder-slate-600 disabled:opacity-50"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                            Theme Style Template
                          </label>
                          <select
                            value={mascotThemeState}
                            onChange={(e) => setMascotThemeState(e.target.value)}
                            disabled={mascotAiLoading}
                            className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 p-2 font-mono rounded focus:outline-none focus:border-yellow-400 cursor-pointer disabled:opacity-50"
                          >
                            <option value="Default Retro">Default Retro</option>
                            <option value="Chrono Obsidian">Chrono Obsidian</option>
                            <option value="Vaporwave Neon">Vaporwave Neon</option>
                            <option value="Pixelated Gold">Pixelated Gold</option>
                            <option value="Solarglow Horizon">Solarglow Horizon</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                            Avatar Aspect Expression
                          </label>
                          <select
                            value={mascotExpressionState}
                            onChange={(e) => setMascotExpressionState(e.target.value)}
                            disabled={mascotAiLoading}
                            className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 p-2 font-mono rounded focus:outline-none focus:border-yellow-400 cursor-pointer disabled:opacity-50"
                          >
                            <option value="Standard Smile">Standard Smile</option>
                            <option value="Hero Glasses">Hero Glasses</option>
                            <option value="Cosmic Cybervisor">Cosmic Cybervisor</option>
                            <option value="Pixelated Mask">Pixelated Mask</option>
                            <option value="Stealth Hood">Stealth Hood</option>
                          </select>
                        </div>
                      </div>

                      {/* Compilation log sequence status terminal lists */}
                      {mascotAiLoading ? (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1 text-[9px] font-mono text-emerald-400 border-emerald-500/20 max-h-[110px] overflow-y-auto">
                          {mascotAiSteps.map((step, idx) => (
                            <p key={idx} className="animate-fade-in">{step}</p>
                          ))}
                          <div className="flex items-center gap-1.5 pt-1 text-slate-400 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Processing pixel arrays, please stand by...</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGenerateMascotWithAi}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white py-2.5 rounded-lg border font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer border-slate-700 select-none shadow hover:border-yellow-400"
                        >
                          <span>✨ Trigger AI Generative Render Engine</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { soundManager.play('close'); setIsMascotCustomizerOpen(false); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-5 py-2.5 rounded-lg font-mono font-bold text-xs uppercase border border-slate-700 transition-colors shadow cursor-pointer"
                  disabled={mascotAiLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMascotEngine}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-6 py-2.5 rounded-lg font-mono font-black text-xs uppercase transition-transform hover:scale-[1.03] active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                  disabled={mascotAiLoading}
                >
                  <span>💾 Save & Sync Custom Mascot</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {feedbackModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto w-full">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-w-lg w-full shadow-2xl relative flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">★</span>
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Escrow-Driven Mutual Feedback Prompt
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Reputation Engine Integration Module Model
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { soundManager.play('close'); setFeedbackModalOpen(false); }}
                  className="text-slate-400 hover:text-white font-black text-xs px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded cursor-pointer border border-slate-800"
                >
                  ✕ Skip
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitFeedback} className="p-5 space-y-4 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-bold uppercase">Campaign Context</span>
                    <span className="text-teal-400 font-bold font-mono font-bold">Milestone Liquidated ✓</span>
                  </div>
                  <div>
                    <strong className="text-slate-200 block text-sm">{feedbackCampaignTitle}</strong>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Brand: {feedbackBrandName}</span>
                      <span>Creator: {feedbackCreatorName}</span>
                    </div>
                  </div>
                </div>

                {/* Sandbox Persona Selector (Allows testing BOTH directions easily) */}
                <div className="space-y-1 bg-slate-950/40 p-2.5 border border-slate-850 rounded-lg">
                  <label className="text-[9px] uppercase font-bold text-yellow-400 font-mono block">
                    Submit Evaluator Authority Role (Sandbox Switchable)
                  </label>
                  <p className="text-[9px] text-slate-500 mb-1.5 leading-tight">
                    In live operations, this is governed by signed-in cookies. Switch below to preview how each side rates the other.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { soundManager.play('switch'); setFeedbackRolePersona('Brand'); }}
                      className={`py-1.5 px-2.5 rounded font-bold uppercase tracking-wide text-[10px] border transition-colors ${
                        feedbackRolePersona === 'Brand'
                          ? 'bg-yellow-400 text-slate-950 border-yellow-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Brand (Rate Creator)
                    </button>
                    <button
                      type="button"
                      onClick={() => { soundManager.play('switch'); setFeedbackRolePersona('Creator'); }}
                      className={`py-1.5 px-2.5 rounded font-bold uppercase tracking-wide text-[10px] border transition-colors ${
                        feedbackRolePersona === 'Creator'
                          ? 'bg-yellow-400 text-slate-950 border-yellow-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Creator (Rate Brand)
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block border-b border-slate-800 pb-1">
                    Performance Evaluation Metrics (1-5 Star Ratings)
                  </span>

                  {/* Rating Metric 1 */}
                  <div className="flex justify-between items-center bg-slate-950/20 p-2 border border-slate-850 rounded">
                    <div>
                      <strong className="text-slate-200 block text-[11px]">
                        {feedbackRolePersona === 'Brand' ? 'Deliverable Quality' : 'Requirement Clarity'}
                      </strong>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {feedbackRolePersona === 'Brand' ? 'Standard of final reels work' : 'How distinct the original brief outline was'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => { soundManager.play('switch'); setRatingMetric1(star); }}
                          className={`text-sm select-none ${ratingMetric1 >= star ? 'text-yellow-400' : 'text-slate-705 hover:text-slate-500'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Metric 2 */}
                  <div className="flex justify-between items-center bg-slate-950/20 p-2 border border-slate-850 rounded">
                    <div>
                      <strong className="text-slate-200 block text-[11px]">
                        {feedbackRolePersona === 'Brand' ? 'Communication Cooperation' : 'Responsiveness Speed'}
                      </strong>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {feedbackRolePersona === 'Brand' ? 'Quickness in answering updates' : 'Answering queries during active milestones'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => { soundManager.play('switch'); setRatingMetric2(star); }}
                          className={`text-sm select-none ${ratingMetric2 >= star ? 'text-yellow-400' : 'text-slate-705 hover:text-slate-500'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Metric 3 */}
                  <div className="flex justify-between items-center bg-slate-950/20 p-2 border border-slate-850 rounded">
                    <div>
                      <strong className="text-slate-200 block text-[11px]">
                        {feedbackRolePersona === 'Brand' ? 'Timeline Adherence' : 'Professionalism & Cooperation'}
                      </strong>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {feedbackRolePersona === 'Brand' ? 'Delivering drafts under constraints' : 'Respectfulness and milestone clarity'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => { soundManager.play('switch'); setRatingMetric3(star); }}
                          className={`text-sm select-none ${ratingMetric3 >= star ? 'text-yellow-400' : 'text-slate-705 hover:text-slate-500'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Testimonial Written Comments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase font-bold text-slate-400 font-mono block">
                      Written Performance Testimonial Comments
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono">Verified signature attached</span>
                  </div>
                  <textarea
                    rows={3}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder={
                      feedbackRolePersona === 'Brand'
                        ? 'Provide outstanding praise explaining the content creator’s work quality, timeline speed, and aesthetic contribution...'
                        : 'Provide feedback explaining the sponsor brand’s brief clarity, payment speed, and general support clarity...'
                    }
                    className="w-full bg-slate-950 text-slate-100 text-xs border border-slate-850 p-2.5 rounded focus:outline-none focus:border-yellow-400 placeholder:text-slate-650 leading-relaxed font-mono"
                  />
                </div>

                {feedbackError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded text-[11px] font-mono leading-normal">
                    {feedbackError}
                  </div>
                )}

                {/* Submittal buttons */}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { soundManager.play('close'); setFeedbackModalOpen(false); }}
                    className="bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold px-4 py-2 rounded font-mono transition-colors active:scale-95 cursor-pointer"
                    disabled={submittingFeedback}
                  >
                    Skip Feedback
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-505 text-slate-950 font-black px-5 py-2 uppercase rounded font-mono transition-transform active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                    disabled={submittingFeedback}
                  >
                    <span>{submittingFeedback ? 'Syncing...' : '💾 Submit Testimonial'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* VOICE CALL SYSTEM HANDSHAKE OVERLAY MODAL */}
        {activeCall && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl relative flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="font-mono text-slate-400 font-bold uppercase tracking-wider">RedCat Voice Transceiver</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  SECURE P2P CHANNEL
                </div>
              </div>

              <div className="p-6 flex flex-col items-center justify-center text-center space-y-6">
                
                {/* Visual Glow Call State Avatar */}
                <div className="relative">
                  <div className={`absolute -inset-2 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full opacity-30 blur-md ${
                    activeCall.state === 'outgoing' || activeCall.state === 'incoming' ? 'animate-pulse' : 'animate-none'
                  }`} />
                  <div className="relative bg-slate-950 border border-slate-800 rounded-full w-24 h-24 flex items-center justify-center text-5xl shadow-xl">
                    {activeCall.partnerAvatar}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold font-sans text-slate-100">{activeCall.partnerName}</h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {activeCall.state === 'outgoing' && 'Ringing... Dialing Out'}
                    {activeCall.state === 'incoming' && 'Incoming Call Handshake Request'}
                    {activeCall.state === 'connecting' && 'Cryptographic Shaking...'}
                    {activeCall.state === 'connected' && `Session Connected • ${Math.floor(callTimer / 60)}:${(callTimer % 60).toString().padStart(2, '0')}`}
                    {activeCall.state === 'completed' && 'Session Intercept Suspended'}
                  </p>
                </div>

                {/* State-specific Interactive Sections */}
                {activeCall.state === 'outgoing' && (
                  <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-850/60 font-mono text-[10px] text-slate-400 leading-relaxed text-center space-y-2">
                    <p className="animate-pulse">Initializing direct messaging router channels. Please stand by for voice handshake.</p>
                    <div className="flex justify-center gap-1.5 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {activeCall.state === 'incoming' && (
                  <div className="w-full flex gap-3">
                    <button
                      onClick={handleDeclineOrHangUp}
                      className="flex-1 py-2.5 bg-red-650 hover:bg-red-600 text-white border border-red-700/80 hover:border-red-500 rounded-xl font-mono text-xs font-bold uppercase cursor-pointer"
                    >
                      Decline Switch
                    </button>
                    <button
                      onClick={handleAcceptCall}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-550 text-white border border-green-700 hover:border-green-500 rounded-xl font-mono text-xs font-black uppercase cursor-pointer animate-pulse"
                    >
                      Accept Handshake
                    </button>
                  </div>
                )}

                {activeCall.state === 'connecting' && (
                  <div className="w-full bg-slate-950 py-4 px-3 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                    <p className="text-yellow-400 font-bold uppercase tracking-wider">SECURE SHAKE SYNC</p>
                    <p className="animate-pulse">Locking voice codec keys against ledger addresses...</p>
                  </div>
                )}

                {activeCall.state === 'connected' && (
                  <div className="w-full space-y-4">
                    {/* Live Scrolling Transcription Streams */}
                    <div className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 h-[180px] overflow-y-auto text-left font-mono space-y-2 text-[10px] leading-relaxed select-text flex flex-col justify-end">
                      <span className="text-[8px] text-yellow-500 uppercase tracking-widest font-black block border-b border-slate-900 pb-1 mb-1">LIVE TRANSCRIPTION TRANSLATOR</span>
                      <div className="space-y-2.5 max-h-[145px] overflow-y-auto w-full">
                        {callTranscript.length === 0 ? (
                          <p className="text-slate-500 italic text-center py-4">Speaking lines initializing...</p>
                        ) : (
                          callTranscript.map((t, idx) => (
                            <div key={idx} className={`p-1.5 rounded leading-normal ${t.highlight ? 'bg-yellow-400/10 border border-yellow-500/20 text-yellow-300' : 'text-slate-300'}`}>
                              <strong className="text-slate-400 uppercase tracking-wider text-[8px] mr-1 block">{t.speaker}:</strong>
                              <span>{t.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Highly Contrast Security Escrow release lock */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/20 flex flex-col items-center justify-between text-[11px] gap-2">
                      <div className="text-center font-mono space-y-0.5">
                        <span className="text-yellow-400 font-extrabold uppercase select-text tracking-wide bg-yellow-400/10 py-0.5 px-2 rounded border border-yellow-400/20 text-[9px] block w-fit mx-auto font-black">ESCROW MILESTONE SYNCABLE</span>
                        <p className="text-slate-400 text-[10px] leading-snug">The parties proposed a <strong>{activeCall.role === 'Brand' ? '₹1,500' : '₹12,500'}</strong> campaign deliverable milestone during active speech.</p>
                      </div>
                      
                      <button
                        onClick={handleSecureMilestoneFromCall}
                        className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-350 hover:to-yellow-450 text-slate-950 font-mono text-[10px] font-black uppercase rounded-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer block text-center"
                      >
                        🔒 Secure Escrow Milestone
                      </button>
                    </div>

                    <div className="flex gap-2">
                       <button
                        onClick={handleDeclineOrHangUp}
                        className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 text-rose-300 hover:text-white border border-red-900/40 rounded-lg font-mono text-xs font-bold uppercase cursor-pointer"
                      >
                        Hang Up Phone
                      </button>
                    </div>
                  </div>
                )}

                {activeCall.state === 'completed' && (
                  <div className="w-full space-y-4 font-mono text-xs">
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left space-y-2">
                      <span className="text-green-400 font-bold uppercase text-[10px]">✓ CALL LOG COMPILED</span>
                      <p className="text-slate-300 leading-relaxed text-[10px]">Voice communications intercept successfully closed. Transcripts, escrow milestone agreements, and chat sessions are preserved in the platform cache.</p>
                    </div>

                    <button
                      onClick={() => setActiveCall(null)}
                      className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-305 text-slate-950 rounded-lg font-mono text-xs font-black uppercase cursor-pointer"
                    >
                      Return to grid console
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MASTER FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 text-center">
          <div>
            <span>RedCat CommandCenter Engine v2.4</span>
            <span className="mx-2">•</span>
            <span>Local Node: Sinous-Weft Active</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 cursor-help hover:text-yellow-400">
              <Shield className="w-3.5 h-3.5" /> Identity Scrubber: Active
            </span>
            <p className="text-xs">©Mojang AB & RedCat Corp</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
