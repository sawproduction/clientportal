'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ApprovalButtonsProps {
  projectId: string
  currentStatus: string
}

export function ApprovalButtons({ projectId, currentStatus }: ApprovalButtonsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const handleApproval = async (action: 'approve' | 'reject') => {
    setLoading(action)

    // Simulate API call - replace with actual Supabase call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real implementation:
    // const { error } = await supabase
    //   .from('projects')
    //   .update({ status: action === 'approve' ? 'completed' : 'in_progress' })
    //   .eq('id', projectId)

    setLoading(null)
    alert(`Project ${action === 'approve' ? 'approved' : 'rejected'} successfully!`)
  }

  // Only show approval buttons for pending approval status
  if (currentStatus !== 'pending_approval') {
    return null
  }

  return (
    <div
      className="p-4 rounded-xl flex items-center gap-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span className="text-sm font-medium mr-2" style={{ color: 'var(--color-text)' }}>
        Approval Required:
      </span>

      <button
        onClick={() => handleApproval('approve')}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-success)',
          color: 'white',
        }}
      >
        {loading === 'approve' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Approve
      </button>

      <button
        onClick={() => handleApproval('reject')}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-error)',
          color: 'white',
        }}
      >
        {loading === 'reject' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        Reject
      </button>
    </div>
  )
}
