import { AIActionLog, GuardrailEvent, HumanFallbackRequest } from './types'

// In-memory logs (use Supabase in production)
const actionLogs: AIActionLog[] = []
const guardrailEvents: GuardrailEvent[] = []
const fallbackRequests: HumanFallbackRequest[] = []

// Log AI action
export async function logAIAction(log: AIActionLog): Promise<AIActionLog> {
  // Add to local storage
  actionLogs.push(log)

  // In production, store in Supabase:
  // const { data, error } = await supabase
  //   .from('ai_action_logs')
  //   .insert(log)
  //   .select()
  //   .single()

  // Keep only last 1000 logs in memory
  if (actionLogs.length > 1000) {
    actionLogs.shift()
  }

  // Real-time analytics tracking
  await trackAnalytics(log)

  return log
}

// Get recent action logs
export async function getActionLogs(
  filters?: {
    agentType?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
  }
): Promise<AIActionLog[]> {
  let filtered = [...actionLogs]

  if (filters?.agentType) {
    filtered = filtered.filter(log => log.agentType === filters.agentType)
  }

  if (filters?.status) {
    filtered = filtered.filter(log => log.status === filters.status)
  }

  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!)
  }

  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!)
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return filtered.slice(0, filters?.limit || 100)
}

// Get analytics summary
export async function getAnalyticsSummary(
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
): Promise<{
  totalActions: number
  successRate: number
  avgDuration: number
  totalCost: number
  topAgents: { agentType: string; count: number; successRate: number }[]
  guardrailTriggers: { type: string; count: number }[]
}> {
  const now = new Date()
  const ranges: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }

  const cutoff = new Date(now.getTime() - ranges[timeRange])
  const recentLogs = actionLogs.filter(log => new Date(log.timestamp) >= cutoff)

  const totalActions = recentLogs.length
  const successfulActions = recentLogs.filter(log => log.status === 'completed').length
  const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0

  const avgDuration = totalActions > 0
    ? recentLogs.reduce((sum, log) => sum + log.duration, 0) / totalActions
    : 0

  const totalCost = recentLogs.reduce((sum, log) => sum + (log.cost || 0), 0)

  // Aggregate by agent type
  const agentStats = new Map<string, { count: number; success: number }>()
  for (const log of recentLogs) {
    const stats = agentStats.get(log.agentType) || { count: 0, success: 0 }
    stats.count++
    if (log.status === 'completed') stats.success++
    agentStats.set(log.agentType, stats)
  }

  const topAgents = Array.from(agentStats.entries())
    .map(([agentType, stats]) => ({
      agentType,
      count: stats.count,
      successRate: (stats.success / stats.count) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  // Guardrail triggers
  const recentGuardrails = guardrailEvents.filter(e => new Date(e.timestamp) >= cutoff)
  const guardrailMap = new Map<string, number>()
  for (const event of recentGuardrails) {
    guardrailMap.set(event.type, (guardrailMap.get(event.type) || 0) + 1)
  }
  const guardrailTriggers = Array.from(guardrailMap.entries())
    .map(([type, count]) => ({ type, count }))

  return {
    totalActions,
    successRate,
    avgDuration,
    totalCost,
    topAgents,
    guardrailTriggers,
  }
}

// Get human fallback requests
export async function getHumanFallbackRequests(
  status?: 'pending' | 'approved' | 'rejected' | 'escalated'
): Promise<HumanFallbackRequest[]> {
  let filtered = [...fallbackRequests]
  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Update human fallback request status
export async function updateHumanFallbackRequest(
  id: string,
  updates: Partial<HumanFallbackRequest>
): Promise<HumanFallbackRequest | null> {
  const index = fallbackRequests.findIndex(r => r.id === id)
  if (index === -1) return null

  fallbackRequests[index] = { ...fallbackRequests[index], ...updates }
  return fallbackRequests[index]
}

// Internal: Track analytics
async function trackAnalytics(log: AIActionLog): Promise<void> {
  // In production: Send to analytics platform (Segment, Amplitude, etc.)
  // This enables real-time monitoring and alerting

  if (log.status === 'failed' || log.guardrailTriggered) {
    // Send alert for anomalies
    console.warn('AI Action Alert:', {
      id: log.id,
      agentType: log.agentType,
      status: log.status,
      error: log.error,
      guardrail: log.guardrailTriggered,
    })
  }
}

// Export for use in other modules
export { actionLogs, guardrailEvents, fallbackRequests }
