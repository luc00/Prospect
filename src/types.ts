import { Platform, LeadStage, Lead, ChatMessage } from './utils/conversionEngine';

export type { Platform, LeadStage, Lead, ChatMessage };

export interface BroadcastTemplate {
  id: string;
  title: string;
  type: string;
  message: string;
  estimatedConversionRate: string;
}

export interface BroadcastCampaign {
  id: string;
  name: string;
  targetPlatform: Platform;
  targetNiche: string;
  offerDescription: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  selectedTemplate: string;
  recipientsCount: number;
  sentCount: number;
  repliesCount: number;
  createdAt: string;
}

export interface BotSettings {
  autoPilotEnabled: boolean;
  botPersona: string;
  conversionGoal: string;
  customOffer: string;
  delayBetweenMessagesSeconds: number;
  maxDailyDms: number;
  soundNotifications: boolean;
}

export interface EngineLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'ai';
  platform: Platform | 'system';
  message: string;
  leadHandle?: string;
}
