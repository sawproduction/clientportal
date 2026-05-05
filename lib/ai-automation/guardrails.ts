import { GuardrailEvent, HumanFallbackRequest } from './types'

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export class RateLimiter {
  private config: { requestsPerMinute: number; requestsPerHour: number; requestsPerDay: number }

  constructor(config: { requestsPerMinute: number; requestsPerHour: number; requestsPerDay: number }) {
    this.config = config
  }

  async check(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowKey = `${key}:${Math.floor(now / 60000)}` // Per minute window

    const current = rateLimitStore.get(windowKey)
    const count = current ? current.count + 1 : 1
    const resetAt = current ? current.resetAt : now + 60000

    if (count > this.config.requestsPerMinute) {
      return { allowed: false, remaining: 0, resetAt }
    }

    rateLimitStore.set(windowKey, { count, resetAt })

    // Cleanup old entries
    for (const [k, v] of rateLimitStore) {
      if (v.resetAt < now) rateLimitStore.delete(k)
    }

    return {
      allowed: true,
      remaining: this.config.requestsPerMinute - count,
      resetAt,
    }
  }

  async getStats(key: string): Promise<{ minute: number; hour: number; day: number }> {
    const now = Date.now()
    const minuteWindow = Math.floor(now / 60000)
    const hourWindow = Math.floor(now / 3600000)
    const dayWindow = Math.floor(now / 86400000)

    let minuteCount = 0
    let hourCount = 0
    let dayCount = 0

    for (const [k, v] of rateLimitStore) {
      if (v.resetAt < now) continue

      if (k.startsWith(`${key}:${minuteWindow}`)) minuteCount += v.count
      if (k.startsWith(`${key}:${hourWindow}`)) hourCount += v.count
      if (k.startsWith(`${key}:${dayWindow}`)) dayCount += v.count
    }

    return { minute: minuteCount, hour: hourCount, day: dayCount }
  }
}

// Guardrail checker for high-value actions
export async function checkHighValueGuardrail(
  action: string,
  data: { amount?: number; currency?: string; reason?: string; customerTier?: string }
): Promise<{ allowed: boolean; reason?: string; requiresHumanReview: boolean }> {
  const MAX_AUTO_APPROVE_AMOUNT = 5 // $5 USD

  // Check amount guardrail
  if (data.amount && data.amount > MAX_AUTO_APPROVE_AMOUNT) {
    const event: GuardrailEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'high_value_refund',
      action,
      blocked: true,
      reason: `Amount $${data.amount} exceeds auto-approve threshold of $${MAX_AUTO_APPROVE_AMOUNT}`,
      data,
      resolution: 'pending',
    }

    // Store guardrail event
    await storeGuardrailEvent(event)

    // Create human fallback request
    await createHumanFallbackRequest({
      type: 'refund_review',
      priority: data.amount > 100 ? 'urgent' : 'high',
      description: `High-value ${action} requires approval`,
      context: {
        amount: data.amount,
        reason: data.reason,
      },
    })

    return {
      allowed: false,
      reason: 'High-value action requires human review',
      requiresHumanReview: true,
    }
  }

  // Check confidence threshold
  if (data.customerTier === 'enterprise' && data.amount && data.amount > 1) {
    return {
      allowed: false,
      reason: 'Enterprise customer actions require human review',
      requiresHumanReview: true,
    }
  }

  return { allowed: true, requiresHumanReview: false }
}

// Confidence scoring guardrail
export async function checkConfidenceGuardrail(
  confidence: number,
  action: string,
  context: Record<string, unknown>
): Promise<{ allowed: boolean; reason?: string }> {
  const MIN_CONFIDENCE = 0.75

  if (confidence < MIN_CONFIDENCE) {
    const event: GuardrailEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'confidence_threshold',
      action,
      blocked: true,
      reason: `Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(MIN_CONFIDENCE * 100).toFixed(0)}%`,
      data: context,
      resolution: 'pending',
    }

    await storeGuardrailEvent(event)

    return {
      allowed: false,
      reason: 'Low confidence score - requires human review',
    }
  }

  return { allowed: true }
}

// Content safety guardrail
export async function checkContentGuardrail(content: string): Promise<{
  safe: boolean
  violations: string[]
  sanitized?: string
}> {
  const BLOCKED_KEYWORDS = [
    'scam', 'fraud', 'guaranteed profit', '100% success',
    'get rich quick', 'no risk', 'make money fast',
    'urgent wire transfer', 'send bitcoin', 'gift card payment'
  ]

  const violations: string[] = []
  const lowerContent = content.toLowerCase()

  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      violations.push(keyword)
    }
  }

  return {
    safe: violations.length === 0,
    violations,
    sanitized: violations.length > 0 ? '[CONTENT BLOCKED - POLICY VIOLATION]' : content,
  }
}

// Create human fallback request
export async function createHumanFallbackRequest(
  params: Omit<HumanFallbackRequest, 'id' | 'createdAt' | 'status' | 'requestedBy'>
): Promise<HumanFallbackRequest> {
  const request: HumanFallbackRequest = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    requestedBy: 'ai_agent',
    ...params,
  }

  // Store in database (mock implementation)
  await storeHumanFallbackRequest(request)

  // Send notification to human reviewers
  await notifyHumanReviewers(request)

  return request
}

// Mock storage functions (replace with Supabase in production)
async function storeGuardrailEvent(event: GuardrailEvent): Promise<void> {
  // In production: await supabase.from('guardrail_events').insert(event)
  console.log('Guardrail Event:', event)
}

async function storeHumanFallbackRequest(request: HumanFallbackRequest): Promise<void> {
  // In production: await supabase.from('human_fallback_requests').insert(request)
  console.log('Human Fallback Request:', request)
}

async function notifyHumanReviewers(request: HumanFallbackRequest): Promise<void> {
  // In production: Send Slack/Email notification
  console.log('Notifying reviewers about:', request.id)
}

// Export singleton rate limiter
export const globalRateLimiter = new RateLimiter({
  requestsPerMinute: 60,
  requestsPerHour: 500,
  requestsPerDay: 3000,
})
