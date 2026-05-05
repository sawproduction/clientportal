'use client'

import { FileText, Download, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface File {
  id: string
  name: string
  size: string
  uploadedAt: string
  uploadedBy: string
}

interface FileListProps {
  files: File[]
  projectId: string
}

export function FileList({ files, projectId }: FileListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (file: File) => {
    setDownloading(file.id)

    // Simulate download - replace with actual Supabase Storage download
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real implementation:
    // const { data, error } = await supabase.storage
    //   .from('project-files')
    //   .download(`${projectId}/${file.name}`)

    setDownloading(null)
    alert(`Downloaded ${file.name}`)
  }

  const handleDelete = async (file: File) => {
    setDeleting(file.id)

    // Simulate delete - replace with actual Supabase Storage delete
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In real implementation:
    // const { error } = await supabase.storage
    //   .from('project-files')
    //   .remove([`${projectId}/${file.name}`])

    setDeleting(null)
    alert(`Deleted ${file.name}`)
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const colors: Record<string, string> = {
      pdf: 'var(--color-error)',
      doc: 'var(--color-info)',
      docx: 'var(--color-info)',
      xls: 'var(--color-success)',
      xlsx: 'var(--color-success)',
      ppt: 'var(--color-warning)',
      pptx: 'var(--color-warning)',
      zip: 'var(--color-text-muted)',
      jpg: 'var(--color-primary)',
      jpeg: 'var(--color-primary)',
      png: 'var(--color-primary)',
    }
    return colors[ext || ''] || 'var(--color-text-muted)'
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-3 rounded-lg group"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${getFileIcon(file.name)}20` }}
          >
            <FileText className="w-5 h-5" style={{ color: getFileIcon(file.name) }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
              {file.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {file.size} · {file.uploadedAt} · by {file.uploadedBy}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDownload(file)}
              disabled={downloading === file.id}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {downloading === file.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => handleDelete(file)}
              disabled={deleting === file.id}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ color: 'var(--color-error)' }}
            >
              {deleting === file.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
