'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, Loader2 } from 'lucide-react'

interface FileUploadProps {
  projectId: string
}

export function FileUpload({ projectId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return

    setUploading(true)

    // Simulate upload progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      for (let progress = 0; progress <= 100; progress += 20) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }))
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // In a real implementation, you would upload to Supabase Storage here:
    // const { data, error } = await supabase.storage
    //   .from('project-files')
    //   .upload(`${projectId}/${file.name}`, file)

    setUploading(false)
    setFiles([])
    setUploadProgress({})
    alert('Files uploaded successfully!')
  }, [files, projectId])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div
      className="p-6 rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        Upload Files
      </h2>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-solid' : ''
        }`}
        style={{
          borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border)',
          backgroundColor: isDragging ? 'var(--color-surface-hover)' : 'transparent',
        }}
      >
        <Upload
          className="w-12 h-12 mx-auto mb-4"
          style={{ color: isDragging ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        />
        <p className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Drop files here or click to upload
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Support for PDF, images, documents up to 50MB
        </p>
        <label
          className="inline-block px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          Select Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <File className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatFileSize(file.size)}
                </p>
                {uploading && uploadProgress[file.name] !== undefined && (
                  <div className="mt-2">
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${uploadProgress[file.name]}%`,
                          backgroundColor: 'var(--color-primary)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}
