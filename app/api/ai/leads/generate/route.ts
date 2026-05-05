import { NextRequest, NextResponse } from 'next/server'
import { generateMockLeads, searchLeads } from '@/lib/ai-automation/lead-generation'
import { z } from 'zod'

const generateSchema = z.object({
  count: z.number().min(1).max(50).default(10),
  source: z.enum(['mock', 'api']).default('mock'),
  industry: z.string().optional(),
  companySize: z.enum(['startup', 'smb', 'enterprise']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const params = generateSchema.parse(body)

    let leads

    if (params.source === 'mock') {
      leads = await generateMockLeads(params.count)
    } else {
      leads = await searchLeads({
        industry: params.industry,
        companySize: params.companySize,
        limit: params.count,
        source: 'apollo',
      })
    }

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length,
    })

  } catch (error) {
    console.error('Lead generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
