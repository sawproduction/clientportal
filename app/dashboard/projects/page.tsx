import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectCard } from '@/components/project-card'
import { Plus, Search } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
    {
      id: '4',
      name: 'E-commerce Platform',
      status: 'in_progress' as const,
      progress: 45,
      dueDate: '2026-07-10',
      client: 'Retail Pro',
    },
    {
      id: '5',
      name: 'Marketing Campaign',
      status: 'on_hold' as const,
      progress: 20,
      dueDate: '2026-05-30',
      client: 'Growth Co',
    },
    {
      id: '6',
      name: 'API Integration',
      status: 'completed' as const,
      progress: 100,
      dueDate: '2026-03-15',
      client: 'Data Systems',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Projects
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage and track all your client projects
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <select
          className="px-4 py-2 rounded-lg outline-none"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          <option value="all">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  )
}
