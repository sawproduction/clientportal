import Link from 'next/link'
import { Clock, MoreVertical } from 'lucide-react'

interface ProjectCardProps {
  id: string
  name: string
  status: 'in_progress' | 'pending_approval' | 'completed' | 'on_hold'
  progress: number
  dueDate: string
  client: string
}

const statusLabels = {
  in_progress: 'In Progress',
  pending_approval: 'Pending Approval',
  completed: 'Completed',
  on_hold: 'On Hold',
}

const statusColors = {
  in_progress: 'var(--color-info)',
  pending_approval: 'var(--color-warning)',
  completed: 'var(--color-success)',
  on_hold: 'var(--color-text-muted)',
}

export function ProjectCard({ id, name, status, progress, dueDate, client }: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${id}`}
      className="block p-5 rounded-xl transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {name}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {client}
          </p>
        </div>
        <button
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span style={{ color: 'var(--color-text-muted)' }}>Progress</span>
          <span style={{ color: 'var(--color-text)' }}>{progress}%</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${statusColors[status]}20`,
            color: statusColors[status],
          }}
        >
          {statusLabels[status]}
        </span>

        <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Clock className="w-4 h-4" />
          <span>{dueDate}</span>
        </div>
      </div>
    </Link>
  )
}
