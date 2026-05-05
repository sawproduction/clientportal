import OpenAI from 'openai'
import { z } from 'zod'
import { AIActionLog, AIAgentConfig, OutreachMessage, Lead } from './types'
import { RateLimiter } from './guardrails'
import { logAIAction } from './logging'

// Lazy load OpenAI client
let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openai = new OpenAI({ apiKey })
  }
  return openai
}

// Default AI Agent Configuration
const defaultConfig: AIAgentConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerHour: 500,
    requestsPerDay: 3000,
  },
  guardrails: {
    minConfidenceThreshold: 0.75,
    maxRefundAutoApprove: 5,
    requireHumanReviewFor: ['high_value_refund', 'legal_matter', 'executive_contact'],
    blockedKeywords: ['scam', 'fraud', 'guaranteed', '100% success', 'get rich quick'],
  },
}

// Rate limiter instance
const rateLimiter = new RateLimiter(defaultConfig.rateLimits)

// Generate personalized outreach message
export async function generateOutreachMessage(
  lead: Lead,
  channel: 'email' | 'linkedin' | 'sms' = 'email',
  tone: 'professional' | 'friendly' | 'urgent' | 'casual' = 'professional'
): Promise<{ message: OutreachMessage; log: AIActionLog }> {
  const startTime = Date.now()
  const actionId = crypto.randomUUID()

  try {
    // Check rate limits
    const rateLimitCheck = await rateLimiter.check('outreach_generation')
    if (!rateLimitCheck.allowed) {
      throw new Error(`Rate limit exceeded. Reset at ${new Date(rateLimitCheck.resetAt).toISOString()}`)
    }

    // Build prompt for the AI
    const systemPrompt = `You are an expert B2B sales outreach specialist. 
Create a personalized ${channel} message for a potential client.
Tone: ${tone}
Be concise, authentic, and focused on value. Avoid generic fluff.`

    const userPrompt = `Lead Information:
- Company: ${lead.company || 'Unknown'}
- Contact: ${lead.contactName || 'Unknown'}
- Industry: ${lead.industry || 'Unknown'}
- Size: ${lead.size || 'Unknown'}
- Notes: ${lead.notes || 'None'}

Create a ${channel} message that:
1. References their company/industry specifically
2. Identifies a likely pain point based on their profile
3. Offers a clear value proposition
4. Has a specific, low-friction CTA
5. Is under ${channel === 'sms' ? '160' : '300'} words

Return JSON format:
{
  "subject": "email subject line (if email)",
  "body": "message content",
  "painPoints": ["identified pain points"],
  "valueProps": ["value propositions"],
  "cta": "call to action text",
  "confidence": 0.85
}`

    // Call OpenAI
    const response = await getOpenAI().chat.completions.create({
      model: defaultConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: defaultConfig.temperature,
      max_tokens: defaultConfig.maxTokens,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated from AI')
    }

    // Parse the response
    const parsed = JSON.parse(content)

    // Calculate confidence score
    const confidence = parsed.confidence || 0.7

    // Check confidence threshold guardrail
    const requiresHumanReview = confidence < defaultConfig.guardrails.minConfidenceThreshold

    // Create message object
    const message: OutreachMessage = {
      id: crypto.randomUUID(),
      leadId: lead.id,
      type: channel,
      channel: 'outbound',
      subject: parsed.subject || (channel === 'email' ? `Quick question about ${lead.company}` : undefined),
      body: parsed.body,
      tone,
      personalization: {
        companyMentioned: parsed.body.toLowerCase().includes(lead.company?.toLowerCase() || ''),
        painPoints: parsed.painPoints || [],
        valueProps: parsed.valueProps || [],
        cta: parsed.cta || 'Reply to learn more',
      },
      aiModel: defaultConfig.model,
      confidence,
      tokensUsed: response.usage?.total_tokens || 0,
      generatedAt: new Date().toISOString(),
      status: requiresHumanReview ? 'pending_approval' : 'draft',
      requiresHumanReview,
    }

    // Log the action
    const log = await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'outreach',
      action: 'generate_message',
      status: 'completed',
      leadId: lead.id,
      messageId: message.id,
      input: { lead, channel, tone },
      output: { message: parsed },
      confidence,
      tokensUsed: response.usage?.total_tokens,
      cost: calculateCost(response.usage?.total_tokens || 0, defaultConfig.model),
      duration: Date.now() - startTime,
      metadata: { rateLimitRemaining: rateLimitCheck.remaining },
    })

    return { message, log }

  } catch (error) {
    // Log the failure
    const log = await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'outreach',
      action: 'generate_message',
      status: 'failed',
      leadId: lead.id,
      input: { lead, channel, tone },
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      metadata: {},
    })

    throw error
  }
}

// Generate lead qualification assessment
export async function qualifyLead(lead: Lead): Promise<{
  qualification: {
    score: number
    reasons: string[]
    recommendedActions: string[]
    priority: 'low' | 'medium' | 'high' | 'urgent'
  }
  log: AIActionLog
}> {
  const startTime = Date.now()
  const actionId = crypto.randomUUID()

  try {
    const systemPrompt = `You are a lead qualification expert. Analyze the lead and provide a qualification score.`

    const userPrompt = `Lead Data:
${JSON.stringify(lead, null, 2)}

Provide a qualification analysis in JSON format:
{
  "score": 85,
  "reasons": ["reason 1", "reason 2"],
  "recommendedActions": ["action 1", "action 2"],
  "priority": "high"
}

Score 0-100 based on:
- Company size/budget fit (30 points)
- Industry match (25 points)
- Engagement potential (25 points)
- Timing/urgency signals (20 points)`

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo', // Use cheaper model for qualification
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No content generated')

    const qualification = JSON.parse(content)

    const log = await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'lead_gen',
      action: 'qualify_lead',
      status: 'completed',
      leadId: lead.id,
      input: { lead },
      output: qualification,
      confidence: qualification.score / 100,
      tokensUsed: response.usage?.total_tokens,
      cost: calculateCost(response.usage?.total_tokens || 0, 'gpt-3.5-turbo'),
      duration: Date.now() - startTime,
      metadata: {},
    })

    return { qualification, log }

  } catch (error) {
    const log = await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'lead_gen',
      action: 'qualify_lead',
      status: 'failed',
      leadId: lead.id,
      input: { lead },
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      metadata: {},
    })

    throw error
  }
}

// Analyze message effectiveness (for retention/optimization)
export async function analyzeMessageEffectiveness(
  messageId: string,
  metrics: { opens: number; clicks: number; replies: number; sent: number }
): Promise<{ recommendations: string[]; improvedVersion?: string }> {
  const startTime = Date.now()

  const prompt = `Analyze this outreach message performance and suggest improvements:

Metrics:
- Open Rate: ${((metrics.opens / metrics.sent) * 100).toFixed(1)}%
- Click Rate: ${((metrics.clicks / metrics.sent) * 100).toFixed(1)}%
- Reply Rate: ${((metrics.replies / metrics.sent) * 100).toFixed(1)}%

Provide recommendations in JSON format:
{
  "recommendations": ["suggestion 1", "suggestion 2"],
  "improvedVersion": "optional rewritten message"
}`

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) return { recommendations: [] }

  return JSON.parse(content)
}

// Helper: Calculate OpenAI API cost
function calculateCost(tokens: number, model: string): number {
  const rates: Record<string, number> = {
    'gpt-4': 0.00003, // $0.03 per 1K tokens
    'gpt-3.5-turbo': 0.0000015, // $0.0015 per 1K tokens
    'gemini-pro': 0.000001, // Estimated
  }
  return (tokens / 1000) * (rates[model] || 0.00003)
}

// Export for use in other modules
export { defaultConfig, rateLimiter, openai }
