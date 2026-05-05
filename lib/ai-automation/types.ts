// AI Automation System Types

export interface Lead {
  id: string
  source: 'mock' | 'api' | 'webhook' | 'manual'
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  confidence: number // 0-100, AI confidence score
  company?: string
  contactName?: string
  email?: string
  phone?: string
  industry?: string
  size?: 'startup' | 'smb' | 'enterprise'
  budget?: number
  notes?: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  lastContactedAt?: string
  assignedTo?: string
}

export interface OutreachMessage {
  id: string
  leadId: string
  type: 'email' | 'linkedin' | 'sms' | 'call_script'
  channel: 'outbound' | 'follow_up' | 'nurture' | 'retention'
  subject?: string
  body: string
  tone: 'professional' | 'friendly' | 'urgent' | 'casual'
  personalization: {
    companyMentioned: boolean
    painPoints: string[]
    valueProps: string[]
    cta: string
  }
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro'
  confidence: number
  tokensUsed: number
  generatedAt: string
  sentAt?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'failed'
  metrics?: {
    opens?: number
    clicks?: number
    replies?: number
  }
  requiresHumanReview: boolean
  reviewedBy?: string
  reviewedAt?: string
}

export interface AIActionLog {
  id: string
  timestamp: string
  agentType: 'lead_gen' | 'outreach' | 'retention' | 'support' | 'refund_review'
  action: string
  status: 'started' | 'completed' | 'failed' | 'blocked_by_guardrail'
  leadId?: string
  messageId?: string
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  confidence?: number
  tokensUsed?: number
  cost?: number
  duration: number // milliseconds
  error?: string
  guardrailTriggered?: string
  metadata: Record<string, unknown>
}

export interface GuardrailEvent {
  id: string
  timestamp: string
  type: 'rate_limit' | 'confidence_threshold' | 'high_value_refund' | 'sensitive_data'
  action: string
  blocked: boolean
  reason: string
  data: Record<string, unknown>
  resolution?: 'auto_resolved' | 'human_approved' | 'human_rejected' | 'pending'
  reviewedBy?: string
  reviewedAt?: string
}

export interface HumanFallbackRequest {
  id: string
  createdAt: string
  type: 'refund_review' | 'high_value_action' | 'low_confidence'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  description: string
  context: {
    leadId?: string
    messageId?: string
    amount?: number
    reason?: string
    aiRecommendation?: string
    confidence?: number
  }
  requestedBy: string
  reviewedBy?: string
  reviewedAt?: string
  resolution?: string
}

export interface RateLimitInfo {
  key: string
  windowStart: number
  requests: number
  remaining: number
  resetAt: number
}

export interface AIAgentConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro'
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  rateLimits: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  guardrails: {
    minConfidenceThreshold: number
    maxRefundAutoApprove: number
    requireHumanReviewFor: string[]
    blockedKeywords: string[]
  }
}

// Lead Generation Search Params
export interface LeadSearchParams {
  industry?: string
  companySize?: 'startup' | 'smb' | 'enterprise'
  location?: string
  technology?: string[]
  fundingStage?: 'seed' | 'series_a' | 'series_b' | 'series_c' | 'public'
  limit?: number
  source: 'clearbit' | 'apollo' | 'crunchbase' | 'mock'
}

// Webhook Payloads
export interface WebhookPayload {
  event: string
  timestamp: string
  signature: string
  data: Record<string, unknown>
}

// Retention Campaign
export interface RetentionCampaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  trigger: 'inactivity' | 'churn_risk' | 'anniversary' | 'upsell_opportunity'
  audience: {
    segment: string
    filters: Record<string, unknown>
    estimatedReach: number
  }
  messageTemplate: string
  schedule: {
    startDate: string
    endDate?: string
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    optimalSendTime: boolean
  }
  metrics: {
    sent: number
    opened: number
    clicked: number
    converted: number
    revenue: number
  }
}
