import { NextRequest, NextResponse } from 'next/server'
import { getLeads } from '@/lib/ai-automation/lead-generation'
import { logAIAction } from '@/lib/ai-automation/logging'

function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'cron-secret-token'}`
  return authHeader === expectedToken
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Check for inactive leads (haven't been contacted in 7+ days)
    const allLeads = await getLeads({ status: 'qualified' })
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const inactiveLeads = allLeads.filter(lead => {
      if (!lead.lastContactedAt) return true
      return new Date(lead.lastContactedAt) < sevenDaysAgo
    })

    // Log retention check
    await logAIAction({
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      agentType: 'retention',
      action: 'retention_check',
      status: 'completed',
      output: {
        totalLeads: allLeads.length,
        inactiveLeads: inactiveLeads.length,
      },
      duration: 0,
      metadata: {},
    })

    // In production: Trigger nurture campaigns for inactive leads

    return NextResponse.json({
      success: true,
      message: 'Retention check completed',
      totalLeads: allLeads.length,
      inactiveLeads: inactiveLeads.length,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('Retention check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
