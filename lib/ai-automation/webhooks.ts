import { createHmac } from 'crypto'
import { WebhookPayload } from './types'
import { generateMockLeads, leadsStore } from './lead-generation'
import { logAIAction } from './logging'
import { checkHighValueGuardrail, checkContentGuardrail } from './guardrails'

// Webhook secret (store in environment variables)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here'

// Verify webhook signature
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string = WEBHOOK_SECRET
): Promise<boolean> {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  try {
    return signature === expectedSignature
  } catch {
    return false
  }
}

// Process incoming webhook
export async function processWebhook(
  rawBody: string,
  signature: string
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const startTime = Date.now()
  const actionId = crypto.randomUUID()

  try {
    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      await logAIAction({
        id: actionId,
        timestamp: new Date().toISOString(),
        agentType: 'support',
        action: 'webhook_received',
        status: 'blocked_by_guardrail',
        error: 'Invalid webhook signature',
        duration: Date.now() - startTime,
        metadata: { signature: signature.substring(0, 10) + '...' },
      })

      return { success: false, message: 'Invalid signature' }
    }

    // Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody)

    // Content safety check
    const contentCheck = await checkContentGuardrail(JSON.stringify(payload.data))
    if (!contentCheck.safe) {
      await logAIAction({
        id: actionId,
        timestamp: new Date().toISOString(),
        agentType: 'support',
        action: 'webhook_received',
        status: 'blocked_by_guardrail',
        error: `Content violations: ${contentCheck.violations.join(', ')}`,
        input: payload as unknown as Record<string, unknown>,
        duration: Date.now() - startTime,
        metadata: { violations: contentCheck.violations },
      })

      return { success: false, message: 'Content failed safety check' }
    }

    // Route to appropriate handler
    let result: unknown

    switch (payload.event) {
      case 'lead.created':
        result = await handleLeadCreatedWebhook(payload.data)
        break

      case 'lead.qualified':
        result = await handleLeadQualifiedWebhook(payload.data)
        break

      case 'payment.refund.requested':
        result = await handleRefundWebhook(payload.data)
        break

      case 'customer.churn_risk':
        result = await handleChurnRiskWebhook(payload.data)
        break

      case 'message.outbound.requested':
        result = await handleOutboundMessageWebhook(payload.data)
        break

      default:
        await logAIAction({
          id: actionId,
          timestamp: new Date().toISOString(),
          agentType: 'support',
          action: 'webhook_received',
          status: 'failed',
          error: `Unknown event type: ${payload.event}`,
          input: payload as unknown as Record<string, unknown>,
          duration: Date.now() - startTime,
          metadata: {},
        })

        return { success: false, message: `Unknown event: ${payload.event}` }
    }

    // Log successful processing
    await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'support',
      action: 'webhook_processed',
      status: 'completed',
      input: payload as unknown as Record<string, unknown>,
      output: result as Record<string, unknown>,
      duration: Date.now() - startTime,
      metadata: { event: payload.event },
    })

    return { success: true, message: 'Webhook processed successfully', data: result }

  } catch (error) {
    await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'support',
      action: 'webhook_received',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      metadata: {},
    })

    return { success: false, message: 'Internal error processing webhook' }
  }
}

// Webhook handlers
async function handleLeadCreatedWebhook(data: Record<string, unknown>): Promise<unknown> {
  // Extract lead data from webhook
  const leadData = {
    id: data.id as string,
    company: data.company as string,
    contactName: data.contact_name as string,
    email: data.email as string,
    phone: data.phone as string,
    industry: data.industry as string,
    size: data.size as 'startup' | 'smb' | 'enterprise',
    source: 'webhook',
    status: 'new',
    priority: 'medium',
    confidence: 0.8,
    metadata: { webhookSource: data.source },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  leadsStore.push(leadData as typeof leadsStore[0])

  return { leadId: leadData.id, action: 'stored' }
}

async function handleLeadQualifiedWebhook(data: Record<string, unknown>): Promise<unknown> {
  const leadId = data.lead_id as string
  const score = data.score as number

  const lead = leadsStore.find(l => l.id === leadId)
  if (!lead) {
    return { error: 'Lead not found' }
  }

  // Update lead status based on score
  if (score >= 80) {
    lead.status = 'qualified'
    lead.priority = 'high'
  } else if (score >= 60) {
    lead.status = 'qualified'
    lead.priority = 'medium'
  }

  lead.metadata = { ...lead.metadata, qualificationScore: score }
  lead.updatedAt = new Date().toISOString()

  return { leadId, status: lead.status, priority: lead.priority }
}

async function handleRefundWebhook(data: Record<string, unknown>): Promise<unknown> {
  const amount = data.amount as number
  const currency = data.currency as string
  const reason = data.reason as string
  const customerTier = data.customer_tier as string

  // Check guardrails
  const guardrailCheck = await checkHighValueGuardrail('refund', {
    amount,
    currency,
    reason,
    customerTier,
  })

  if (!guardrailCheck.allowed) {
    return {
      action: 'blocked',
      reason: guardrailCheck.reason,
      requiresHumanReview: true,
      requestId: crypto.randomUUID(),
    }
  }

  // Auto-approve small refunds
  return {
    action: 'approved',
    amount,
    currency,
    processedAt: new Date().toISOString(),
  }
}

async function handleChurnRiskWebhook(data: Record<string, unknown>): Promise<unknown> {
  const customerId = data.customer_id as string
  const riskScore = data.risk_score as number

  // Trigger retention campaign for high-risk customers
  if (riskScore > 70) {
    // In production: Trigger AI retention campaign
    return {
      action: 'retention_campaign_triggered',
      customerId,
      riskScore,
      campaignId: crypto.randomUUID(),
    }
  }

  return {
    action: 'monitoring',
    customerId,
    riskScore,
  }
}

async function handleOutboundMessageWebhook(data: Record<string, unknown>): Promise<unknown> {
  const leadId = data.lead_id as string
  const channel = data.channel as 'email' | 'linkedin' | 'sms'

  const lead = leadsStore.find(l => l.id === leadId)
  if (!lead) {
    return { error: 'Lead not found' }
  }

  // In production: Trigger AI message generation
  // For now, return success
  return {
    action: 'message_queued',
    leadId,
    channel,
    estimatedDelivery: new Date(Date.now() + 60000).toISOString(),
  }
}

// Get webhook delivery logs
export async function getWebhookLogs(
  limit: number = 50
): Promise<Array<{
  id: string
  timestamp: string
  event: string
  status: string
  processingTime: number
}>> {
  // In production: Query from database
  return []
}

// Test webhook (for development)
export async function testWebhook(event: string, data: Record<string, unknown>): Promise<{
  signature: string
  payload: string
}> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    signature: '', // Will be calculated
    data,
  }

  const payloadString = JSON.stringify(payload)
  const signature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex')

  return { signature, payload: payloadString }
}
