export type UserRole = 'Admin' | 'Brand' | 'Creator';

export interface MascotData {
  skin: 'rose' | 'gold' | 'moon';
  clothes: 'crimson' | 'blue' | 'green';
  hair: 'tuft' | 'bob' | 'spikes';
  generativePrompt?: string;
  themeStyle?: string;
  expressionStyle?: string;
  customSkin?: 'standard' | 'purple' | 'green' | 'gold';
  customHead?: 'none' | 'headset' | 'visor' | 'crown';
  customFace?: 'neutral' | 'happy' | 'focused' | 'glitch';
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  fullName: string;
  niche: string; // e.g. "Gaming, Tech", "https://redcat.example/nike"
  bio: string;
  // Mascot Style for customization (legacy fallback/compatibility)
  mascotSkin: 'rose' | 'gold' | 'moon';
  mascotClothes: 'crimson' | 'blue' | 'green';
  mascotHair: 'tuft' | 'bob' | 'spikes';
  // Encapsulated configuration payload schema
  mascot?: MascotData;
  createdAt: number;
}

export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  stage: string;
  progress: number; // 0 to 100
  deadline: string;
  budget: string;
  aiMatch: number; // percentage
  status: 'active' | 'pending' | 'completed' | 'overdue';
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface TickerNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'payout';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type TierLevel = 'Basic' | 'Pro' | 'Pro Max' | 'Ultra' | 'Ultra Max';

export interface SubscriptionTier {
  level: TierLevel;
  campaignLimit: number; // e.g. 2, 10, or 9999 (Unlimited)
  escrowFeePercent: number; // e.g. 3%, 2%, 1.5%, 1%, or 0.5% (volume-based <1%)
  aiNavigatorDepth: 'Standard Only' | 'AI Briefs Generation' | 'Priority Boosting & Risk Alerting' | 'Dedicated Custom LLM Fine-Tuning' | 'Global isolated Multi-region Core';
  postgresCache: boolean;
  proactiveRiskAlerts: boolean;
  pixelCustomMascotGenerator: boolean;
  codeExportEnabled: boolean;
  priorityBoosting: boolean;
}

export interface Invoice {
  id: string; // Unique Invoice ID
  timestamp: string; // Dynamic Time of release
  brandName: string; // Remitter
  creatorName: string; // Recipient
  campaignName: string; // Associated Campaign Context
  milestoneTitle: string; // Milestone Stage
  baseAmount: number; // Base Value B
  razorpayFee: number; // 2% gateway charge
  droppFee: number; // 0.5% platform fee
  droppDiscount: number; // -(0.02 + 0.005) * B
  netAmount: number; // Equals exactly B
  status: 'Settled & Released' | 'Pending Approval';
}

export interface CampaignReview {
  id: string;
  campaignId: string;
  campaignTitle: string;
  reviewerRole: UserRole;
  reviewerUid: string;
  reviewerName: string;
  revieweeUid: string;
  revieweeName: string;
  rating1: number; // Brand -> Creator: Quality, Creator -> Brand: Clarity
  rating2: number; // Brand -> Creator: Communication, Creator -> Brand: Responsiveness
  rating3: number; // Brand -> Creator: Timeliness, Creator -> Brand: Professionalism
  averageRating: number;
  comments: string;
  timestamp: string;
  createdAt: number;
}

// HIRING ARENA INTERFACES
export type HiringContractType = 'Full-time' | 'Part-time' | 'Freelance' | 'Internship';

export interface JobListing {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  brandAvatar: string;
  contractType: HiringContractType;
  niche: string;
  budgetRange: string;
  trustScoreRequired: number; // 0 to 100
  description: string;
  skillsRequired: string[];
  createdAt: number;
  status: 'open' | 'closed';
  roleRequired: 'Content Creator' | 'Video Editor' | 'Graphic Designer' | 'Copywriter';
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  brandId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string; // Emoji
  creatorNiche: string;
  creatorTrustScore: number;
  portfolioLink: string;
  coverLetter: string;
  status: 'applied' | 'reviewing' | 'accepted' | 'declined';
  createdAt: number;
  stage: 'applied' | 'interview' | 'offer' | 'hired'; // Kanban board tracking standard stages
}

export interface HiringChat {
  id: string;
  jobId: string;
  jobTitle: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
  }>;
  createdAt: number;
  lastMessage: string;
  lastMessageTime: number;
}



