import { Lead, LeadSearchParams } from './types'
import { logAIAction } from './logging'
import { checkConfidenceGuardrail } from './guardrails'

// Mock lead database - replace with Supabase in production
const leadsStore: Lead[] = []

// Generate mock leads for testing
export async function generateMockLeads(count: number = 10): Promise<Lead[]> {
  const industries = ['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'AI/ML', 'Consulting', 'Manufacturing']
  const sizes = ['startup', 'smb', 'enterprise'] as const
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
  const domains = ['techcorp.com', 'innovate.io', 'solutions.co', 'digital.ai', 'cloudsys.net']

  const mockLeads: Lead[] = []

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const industry = industries[Math.floor(Math.random() * industries.length)]
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]

    const lead: Lead = {
      id: crypto.randomUUID(),
      source: 'mock',
      status: 'new',
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      confidence: 0.7 + Math.random() * 0.25,
      company: `${firstName} ${industry} Solutions`,
      contactName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      industry,
      size,
      budget: size === 'enterprise' ? 50000 + Math.random() * 150000 :
        size === 'smb' ? 10000 + Math.random() * 40000 :
          2000 + Math.random() * 8000,
      notes: `Generated lead from ${industry} sector. Company shows interest in digital transformation.`,
      metadata: {
        generatedAt: new Date().toISOString(),
        leadScore: Math.floor(Math.random() * 100),
        sourceCampaign: 'ai_auto_gen',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockLeads.push(lead)
    leadsStore.push(lead)
  }

  // Log the action
  await logAIAction({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    agentType: 'lead_gen',
    action: 'generate_mock_leads',
    status: 'completed',
    input: { count },
    output: { generated: count },
    duration: 100,
    metadata: { source: 'mock' },
  })

  return mockLeads
}

// Search for leads via external APIs (mock implementation)
export async function searchLeads(params: LeadSearchParams): Promise<Lead[]> {
  const startTime = Date.now()
  const actionId = crypto.randomUUID()

  try {
    // In production, this would call external APIs like Clearbit, Apollo, etc.
    // For now, we'll simulate API results

    const simulatedResults = await simulateExternalAPISearch(params)

    // Run guardrail check on confidence
    for (const lead of simulatedResults) {
      const guardrailCheck = await checkConfidenceGuardrail(
        lead.confidence,
        'lead_search',
        { leadId: lead.id, source: params.source }
      )

      if (!guardrailCheck.allowed) {
        lead.status = 'rejected'
        lead.notes = `${lead.notes || ''} [Rejected: ${guardrailCheck.reason}]`
      }
    }

    // Store qualified leads
    const qualifiedLeads = simulatedResults.filter(l => l.status !== 'rejected')
    leadsStore.push(...qualifiedLeads)

    // Log the action
    await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'lead_gen',
      action: 'search_leads',
      status: 'completed',
      input: params as unknown as Record<string, unknown>,
      output: { found: simulatedResults.length, qualified: qualifiedLeads.length },
      duration: Date.now() - startTime,
      metadata: { apiSource: params.source },
    })

    return simulatedResults

  } catch (error) {
    await logAIAction({
      id: actionId,
      timestamp: new Date().toISOString(),
      agentType: 'lead_gen',
      action: 'search_leads',
      status: 'failed',
      input: params as unknown as Record<string, unknown>,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      metadata: {},
    })

    throw error
  }
}

// Simulate external API search (replace with real API calls)
async function simulateExternalAPISearch(params: LeadSearchParams): Promise<Lead[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

  const industries = params.industry ? [params.industry] : ['SaaS', 'Fintech', 'Healthcare']
  const baseLeads = await generateMockLeads(params.limit || 5)

  return baseLeads.map(lead => ({
    ...lead,
    source: 'api',
    industry: industries[Math.floor(Math.random() * industries.length)],
    confidence: 0.6 + Math.random() * 0.35, // API leads have varied confidence
    metadata: {
      ...lead.metadata,
      apiSource: params.source,
      searchParams: params,
    },
  }))
}

// Get all leads with filtering
export async function getLeads(filters?: {
  status?: Lead['status']
  priority?: Lead['priority']
  source?: Lead['source']
  industry?: string
  assignedTo?: string
  limit?: number
}): Promise<Lead[]> {
  let filtered = [...leadsStore]

  if (filters?.status) {
    filtered = filtered.filter(l => l.status === filters.status)
  }

  if (filters?.priority) {
    filtered = filtered.filter(l => l.priority === filters.priority)
  }

  if (filters?.source) {
    filtered = filtered.filter(l => l.source === filters.source)
  }

  if (filters?.industry) {
    filtered = filtered.filter(l => l.industry === filters.industry)
  }

  if (filters?.assignedTo) {
    filtered = filtered.filter(l => l.assignedTo === filters.assignedTo)
  }

  // Sort by priority and created date
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  filtered.sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return filtered.slice(0, filters?.limit || 50)
}

// Get lead by ID
export async function getLeadById(id: string): Promise<Lead | null> {
  return leadsStore.find(l => l.id === id) || null
}

// Update lead
export async function updateLead(
  id: string,
  updates: Partial<Omit<Lead, 'id' | 'createdAt'>>
): Promise<Lead | null> {
  const index = leadsStore.findIndex(l => l.id === id)
  if (index === -1) return null

  leadsStore[index] = {
    ...leadsStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return leadsStore[index]
}

// Delete lead
export async function deleteLead(id: string): Promise<boolean> {
  const index = leadsStore.findIndex(l => l.id === id)
  if (index === -1) return false

  leadsStore.splice(index, 1)
  return true
}

// Get lead statistics
export async function getLeadStats(): Promise<{
  total: number
  byStatus: Record<Lead['status'], number>
  bySource: Record<Lead['source'], number>
  byPriority: Record<Lead['priority'], number>
  recentCount: number
}> {
  const total = leadsStore.length

  const byStatus = leadsStore.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<Lead['status'], number>)

  const bySource = leadsStore.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1
    return acc
  }, {} as Record<Lead['source'], number>)

  const byPriority = leadsStore.reduce((acc, lead) => {
    acc[lead.priority] = (acc[lead.priority] || 0) + 1
    return acc
  }, {} as Record<Lead['priority'], number>)

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentCount = leadsStore.filter(l => new Date(l.createdAt) > oneDayAgo).length

  return { total, byStatus, bySource, byPriority, recentCount }
}

// Export leads store for other modules
export { leadsStore }
