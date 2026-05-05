import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectCard } from '@/components/project-card'
import { StatsCard } from '@/components/stats-card'
import { ActivityFeed } from '@/components/activity-feed'
import { FolderKanban, CheckCircle, Clock, FileText } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mock data - replace with real Supabase queries
  const stats = [
    { name: 'Active Projects', value: '12', icon: FolderKanban, color: 'var(--color-primary)' },
    { name: 'Completed', value: '48', icon: CheckCircle, color: 'var(--color-success)' },
    { name: 'Pending Review', value: '5', icon: Clock, color: 'var(--color-warning)' },
    { name: 'Total Files', value: '127', icon: FileText, color: 'var(--color-info)' },
  ]

  const projects = [
    {
      id: '1',
      name: 'Website Redesign',
      status: 'in_progress' as const,
      progress: 65,
      dueDate: '2026-05-15',
      client: 'Acme Corp',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      status: 'pending_approval' as const,
      progress: 30,
      dueDate: '2026-06-01',
      client: 'TechStart Inc',
    },
    {
      id: '3',
      name: 'Brand Identity Package',
      status: 'completed' as const,
      progress: 100,
      dueDate: '2026-04-20',
      client: 'Design Studio',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
            Recent Projects
          </h2>
          <a
            href="/dashboard/projects"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  )
}
