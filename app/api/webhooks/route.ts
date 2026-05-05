import { NextRequest, NextResponse } from 'next/server'
import { processWebhook } from '@/lib/ai-automation/webhooks'

export async function POST(request: NextRequest) {
  try {
    // Get raw body
    const rawBody = await request.text()

    // Get signature from header
    const signature = request.headers.get('x-webhook-signature') ||
                      request.headers.get('X-Webhook-Signature') ||
                      ''

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature header' },
        { status: 401 }
      )
    }

    // Process webhook
    const result = await processWebhook(rawBody, signature)

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
