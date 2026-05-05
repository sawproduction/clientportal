import { NextRequest, NextResponse } from 'next/server'
import { generateOutreachMessage } from '@/lib/ai-automation/ai-service'
import { getLeadById } from '@/lib/ai-automation/lead-generation'
import { z } from 'zod'

const generateSchema = z.object({
  leadId: z.string(),
  channel: z.enum(['email', 'linkedin', 'sms']).default('email'),
  tone: z.enum(['professional', 'friendly', 'urgent', 'casual']).default('professional'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const params = generateSchema.parse(body)

    // Get lead data
    const lead = await getLeadById(params.leadId)
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Generate message
    const { message, log } = await generateOutreachMessage(
      lead,
      params.channel,
      params.tone
    )

    return NextResponse.json({
      success: true,
      message,
      log: {
        id: log.id,
        status: log.status,
        confidence: log.confidence,
        tokensUsed: log.tokensUsed,
        cost: log.cost,
        duration: log.duration,
      },
    })

  } catch (error) {
    console.error('Outreach generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
