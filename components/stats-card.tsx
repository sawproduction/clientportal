import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  name: string
  value: string
  icon: LucideIcon
  color: string
}

export function StatsCard({ name, value, icon: Icon, color }: StatsCardProps) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {value}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {name}
          </p>
        </div>
      </div>
    </div>
  )
}
