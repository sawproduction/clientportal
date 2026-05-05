import { FileText, CheckCircle, Clock, Upload, User } from 'lucide-react'

const activities = [
  {
    id: '1',
    type: 'file_upload',
    message: 'New file uploaded to Website Redesign',
    user: 'John Doe',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'approval',
    message: 'Design mockup approved by client',
    user: 'Jane Smith',
    time: '5 hours ago',
  },
  {
    id: '3',
    type: 'comment',
    message: 'New comment on Mobile App Development',
    user: 'Mike Johnson',
    time: '1 day ago',
  },
  {
    id: '4',
    type: 'milestone',
    message: 'Phase 1 completed for Brand Identity Package',
    user: 'Sarah Wilson',
    time: '2 days ago',
  },
]

const activityIcons = {
  file_upload: Upload,
  approval: CheckCircle,
  comment: User,
  milestone: Clock,
}

const activityColors = {
  file_upload: 'var(--color-info)',
  approval: 'var(--color-success)',
  comment: 'var(--color-text-muted)',
  milestone: 'var(--color-warning)',
}

export function ActivityFeed() {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        Recent Activity
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type as keyof typeof activityIcons]
          const color = activityColors[activity.type as keyof typeof activityColors]

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  {activity.message}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  by {activity.user} · {activity.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
