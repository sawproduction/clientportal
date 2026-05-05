import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileUpload } from '@/components/file-upload'
import { ApprovalButtons } from '@/components/approval-buttons'
import { FileList } from '@/components/file-list'
import { ArrowLeft, FolderKanban, Clock, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Mock project data - replace with Supabase query
  const project = {
    id,
    name: 'Website Redesign',
    status: 'in_progress',
    progress: 65,
    dueDate: '2026-05-15',
    client: 'Acme Corp',
    description: 'Complete redesign of the corporate website with modern UI/UX, improved performance, and mobile-first approach.',
    manager: 'Jane Smith',
  }

  const files = [
    { id: '1', name: 'Design_Mockup_v2.fig', size: '12.5 MB', uploadedAt: '2026-04-20', uploadedBy: 'John Doe' },
    { id: '2', name: 'Project_Requirements.pdf', size: '2.3 MB', uploadedAt: '2026-04-15', uploadedBy: 'Jane Smith' },
    { id: '3', name: 'Brand_Assets.zip', size: '45.8 MB', uploadedAt: '2026-04-10', uploadedBy: 'Mike Johnson' },
  ]

  const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    pending_approval: 'Pending Approval',
    completed: 'Completed',
    on_hold: 'On Hold',
  }

  const statusColors: Record<string, string> = {
    in_progress: 'var(--color-info)',
    pending_approval: 'var(--color-warning)',
    completed: 'var(--color-success)',
    on_hold: 'var(--color-text-muted)',
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {project.name}
            </h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${statusColors[project.status]}20`,
                color: statusColors[project.status],
              }}
            >
              {statusLabels[project.status]}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Client: {project.client}
          </p>
        </div>

        <ApprovalButtons projectId={id} currentStatus={project.status} />
      </div>

      {/* Project Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Description
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {project.description}
            </p>
          </div>

          {/* Progress */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Progress
              </h2>
              <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                {project.progress}%
              </span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: 'var(--color-primary)',
                }}
              />
            </div>
          </div>

          {/* Files */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Files
            </h2>
            <FileList files={files} projectId={id} />
          </div>

          {/* File Upload */}
          <FileUpload projectId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Project Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <Clock className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Due Date
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {project.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <User className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Project Manager
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {project.manager}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <FolderKanban className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Client
                  </p>
                  <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {project.client}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Quick Actions
            </h2>

            <div className="space-y-2">
              <button
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                }}
              >
                Request Review
              </button>
              <button
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                }}
              >
                Send Message
              </button>
              <button
                className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                }}
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
