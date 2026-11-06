export type Platform = 'instagram' | 'linkedin' | 'web' | 'twitter' | 'whatsapp';

export type LeadStage = 'discovered' | 'broadcast_sent' | 'replied' | 'negotiating' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  avatarUrl?: string;
  niche: string;
  location: string;
  followers?: string;
  website?: string;
  bio: string;
  painPoint: string;
  aiFitScore: number; // 0 - 100
  stage: LeadStage;
  broadcastSentAt?: string;
  lastActiveAt?: string;
  potentialValue: number; // in EUR
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'prospect' | 'bot' | 'user';
  text: string;
  timestamp: string;
  aiStrategyReasoning?: string;
  stageAfterMessage?: LeadStage;
  objectionDetected?: string;
}

export type ObjectionType =
  | 'PRICE'
  | 'NOT_INTERESTED'
  | 'SKEPTICISM_AI'
  | 'ALREADY_HAVE_PROVIDER'
  | 'SEND_INFO'
  | 'SCHEDULE_CALL'
  | 'POSITIVE_INTEREST'
  | 'GENERAL_QUESTION';

/**
 * Classifies the prospect response text into an actionable objection/intent category.
 */
export function classifyObjection(text: string): ObjectionType {
  const lower = text.toLowerCase();

  if (
    lower.includes('costa') ||
    lower.includes('prezzo') ||
    lower.includes('costo') ||
    lower.includes('budget') ||
    lower.includes('troppo caro') ||
    lower.includes('tariffe')
  ) {
    return 'PRICE';
  }

  if (
    lower.includes('fissare una call') ||
    lower.includes('ci sentiamo') ||
    lower.includes('fissiamo') ||
    lower.includes('calendario') ||
    lower.includes('quando sei libero') ||
    lower.includes('parliamone a voce') ||
    lower.includes('link meet')
  ) {
    return 'SCHEDULE_CALL';
  }

  if (
    lower.includes('non mi interessa') ||
    lower.includes('non siamo interessati') ||
    lower.includes('lascia stare') ||
    lower.includes('smetti') ||
    lower.includes('no grazie') ||
    lower.includes('rimuovimi')
  ) {
    return 'NOT_INTERESTED';
  }

  if (
    lower.includes('sei un bot') ||
    lower.includes('intelligenza artificiale') ||
    lower.includes('messaggio automatico') ||
    lower.includes('parlo con un umano') ||
    lower.includes('sei una ai')
  ) {
    return 'SKEPTICISM_AI';
  }

  if (
    lower.includes('abbiamo già') ||
    lower.includes('usiamo già') ||
    lower.includes('ho già chi se ne occupa') ||
    lower.includes('già un fornitore') ||
    lower.includes('già un’agenzia')
  ) {
    return 'ALREADY_HAVE_PROVIDER';
  }

  if (
    lower.includes('manda info') ||
    lower.includes('mandami info') ||
    lower.includes('dettagli') ||
    lower.includes('brochure') ||
    lower.includes('presentazione') ||
    lower.includes('link') ||
    lower.includes('portfolio') ||
    lower.includes('maggiori informazioni') ||
    lower.includes('più informazioni')
  ) {
    return 'SEND_INFO';
  }

  if (
    lower.includes('interessante') ||
    lower.includes('raccontami') ||
    lower.includes('volentieri') ||
    lower.includes('dimmi di più') ||
    lower.includes('ottimo') ||
    lower.includes('vorrei approfondire')
  ) {
    return 'POSITIVE_INTEREST';
  }

  return 'GENERAL_QUESTION';
}

/**
 * Calculates conversion probability score (0 to 100) based on fit score and conversation dynamics.
 */
export function calculateConversionScore(lead: Lead, messages: ChatMessage[]): number {
  let score = lead.aiFitScore;

  if (messages.length === 0) {
    return Math.min(100, Math.max(0, Math.round(score * 0.7)));
  }

  const prospectMsgs = messages.filter((m) => m.sender === 'prospect');
  if (prospectMsgs.length === 0) {
    return Math.min(100, Math.max(0, Math.round(score * 0.75)));
  }

  // Bonus for active exchange
  score += Math.min(20, prospectMsgs.length * 5);

  const lastMsg = prospectMsgs[prospectMsgs.length - 1];
  const objection = classifyObjection(lastMsg.text);

  switch (objection) {
    case 'SCHEDULE_CALL':
      score = Math.max(score, 94);
      break;
    case 'POSITIVE_INTEREST':
      score += 15;
      break;
    case 'SEND_INFO':
      score += 8;
      break;
    case 'PRICE':
      score += 5; // Price inquiry is strong buying intent!
      break;
    case 'ALREADY_HAVE_PROVIDER':
      score -= 10;
      break;
    case 'SKEPTICISM_AI':
      score -= 5;
      break;
    case 'NOT_INTERESTED':
      score = Math.min(score, 20);
      break;
    default:
      score += 2;
  }

  if (lead.stage === 'converted') return 100;
  if (lead.stage === 'lost') return 5;

  return Math.min(99, Math.max(5, Math.round(score)));
}

/**
 * Replaces dynamic tags in outreach templates with prospect personalizations.
 */
export function formatBroadcastMessage(template: string, lead: Lead): string {
  return template
    .replace(/\{\{nome\}\}/gi, lead.name)
    .replace(/\{\{handle\}\}/gi, lead.handle)
    .replace(/\{\{nicchia\}\}/gi, lead.niche)
    .replace(/\{\{location\}\}/gi, lead.location)
    .replace(/\{\{pain_point\}\}/gi, lead.painPoint)
    .replace(/\{\{piattaforma\}\}/gi, lead.platform);
}

export interface PipelineStats {
  totalLeads: number;
  broadcastSent: number;
  repliesReceived: number;
  negotiating: number;
  converted: number;
  conversionRate: number; // percentage
  responseRate: number; // percentage
  totalPipelineValue: number; // EUR
  closedValue: number; // EUR
}

/**
 * Calculates real aggregate metrics for the CRM and dashboard.
 */
export function calculatePipelineStats(leads: Lead[]): PipelineStats {
  const totalLeads = leads.length;
  if (totalLeads === 0) {
    return {
      totalLeads: 0,
      broadcastSent: 0,
      repliesReceived: 0,
      negotiating: 0,
      converted: 0,
      conversionRate: 0,
      responseRate: 0,
      totalPipelineValue: 0,
      closedValue: 0,
    };
  }

  const broadcastSent = leads.filter(
    (l) => l.stage !== 'discovered'
  ).length;

  const replied = leads.filter((l) =>
    ['replied', 'negotiating', 'converted', 'lost'].includes(l.stage)
  ).length;

  const negotiating = leads.filter((l) => l.stage === 'negotiating').length;
  const converted = leads.filter((l) => l.stage === 'converted').length;

  const responseRate = broadcastSent > 0 ? Math.round((replied / broadcastSent) * 100) : 0;
  const conversionRate = broadcastSent > 0 ? Math.round((converted / broadcastSent) * 100) : 0;

  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.potentialValue || 0), 0);
  const closedValue = leads
    .filter((l) => l.stage === 'converted')
    .reduce((acc, l) => acc + (l.potentialValue || 0), 0);

  return {
    totalLeads,
    broadcastSent,
    repliesReceived: replied,
    negotiating,
    converted,
    conversionRate,
    responseRate,
    totalPipelineValue,
    closedValue,
  };
}
