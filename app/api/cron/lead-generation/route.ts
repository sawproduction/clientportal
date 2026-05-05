import { NextRequest, NextResponse } from 'next/server'
import { generateMockLeads } from '@/lib/ai-automation/lead-generation'

// Verify cron secret
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'cron-secret-token'}`
  return authHeader === expectedToken
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Generate new leads every 6 hours
    const leads = await generateMockLeads(5)

    return NextResponse.json({
      success: true,
      message: 'Lead generation completed',
      leadsGenerated: leads.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Cron lead generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
