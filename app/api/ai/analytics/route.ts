import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsSummary, getActionLogs } from '@/lib/ai-automation/logging'
import { z } from 'zod'

const querySchema = z.object({
  range: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
  agentType: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().default(100),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = querySchema.parse({
      range: searchParams.get('range') || '24h',
      agentType: searchParams.get('agentType'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit') || '100',
    })

    const [summary, logs] = await Promise.all([
      getAnalyticsSummary(params.range),
      getActionLogs({
        agentType: params.agentType,
        status: params.status,
        limit: params.limit,
      }),
    ])

    return NextResponse.json({
      success: true,
      summary,
      logs,
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
