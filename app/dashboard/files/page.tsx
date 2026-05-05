import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileList } from '@/components/file-list'
import { FileUpload } from '@/components/file-upload'
import { FileText, Search } from 'lucide-react'

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const allFiles = [
    { id: '1', name: 'Design_Mockup_v2.fig', size: '12.5 MB', uploadedAt: '2026-04-20', uploadedBy: 'John Doe' },
    { id: '2', name: 'Project_Requirements.pdf', size: '2.3 MB', uploadedAt: '2026-04-15', uploadedBy: 'Jane Smith' },
    { id: '3', name: 'Brand_Assets.zip', size: '45.8 MB', uploadedAt: '2026-04-10', uploadedBy: 'Mike Johnson' },
    { id: '4', name: 'Q1_Report.xlsx', size: '1.8 MB', uploadedAt: '2026-04-05', uploadedBy: 'Sarah Wilson' },
    { id: '5', name: 'Meeting_Notes.docx', size: '856 KB', uploadedAt: '2026-04-01', uploadedBy: 'John Doe' },
    { id: '6', name: 'Presentation.pptx', size: '15.2 MB', uploadedAt: '2026-03-28', uploadedBy: 'Jane Smith' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            All Files
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage and organize your project files
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search files..."
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
          <option value="all">All Projects</option>
          <option value="website">Website Redesign</option>
          <option value="mobile">Mobile App</option>
          <option value="brand">Brand Identity</option>
        </select>
      </div>

      {/* Files List */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
              All Files
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {allFiles.length} files total
            </p>
          </div>
        </div>

        <FileList files={allFiles} projectId="all" />
      </div>

      {/* Quick Upload */}
      <FileUpload projectId="general" />
    </div>
  )
}
