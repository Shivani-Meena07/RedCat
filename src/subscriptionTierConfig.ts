import { SubscriptionTier, TierLevel } from './types';

export const SUBSCRIPTION_TIERS: Record<TierLevel, SubscriptionTier> = {
  'Basic': {
    level: 'Basic',
    campaignLimit: 2,
    escrowFeePercent: 3.0,
    aiNavigatorDepth: 'Standard Only',
    postgresCache: false,
    proactiveRiskAlerts: false,
    pixelCustomMascotGenerator: false,
    codeExportEnabled: false,
    priorityBoosting: false
  },
  'Pro': {
    level: 'Pro',
    campaignLimit: 10,
    escrowFeePercent: 2.0,
    aiNavigatorDepth: 'AI Briefs Generation',
    postgresCache: false,
    proactiveRiskAlerts: false,
    pixelCustomMascotGenerator: false,
    codeExportEnabled: false,
    priorityBoosting: false
  },
  'Pro Max': {
    level: 'Pro Max',
    campaignLimit: 9999, // unlimited
    escrowFeePercent: 1.5,
    aiNavigatorDepth: 'Priority Boosting & Risk Alerting',
    postgresCache: false,
    proactiveRiskAlerts: true,
    pixelCustomMascotGenerator: false,
    codeExportEnabled: false,
    priorityBoosting: true
  },
  'Ultra': {
    level: 'Ultra',
    campaignLimit: 9999,
    escrowFeePercent: 1.0,
    aiNavigatorDepth: 'Dedicated Custom LLM Fine-Tuning',
    postgresCache: true,
    proactiveRiskAlerts: true,
    pixelCustomMascotGenerator: false,
    codeExportEnabled: false,
    priorityBoosting: true
  },
  'Ultra Max': {
    level: 'Ultra Max',
    campaignLimit: 9999,
    escrowFeePercent: 0.5, // Volume-based <1%
    aiNavigatorDepth: 'Global isolated Multi-region Core',
    postgresCache: true,
    proactiveRiskAlerts: true,
    pixelCustomMascotGenerator: true,
    codeExportEnabled: true,
    priorityBoosting: true
  }
};
