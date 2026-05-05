'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Lock, Bell, Palette, Building2, Loader2, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'branding', name: 'White-Label', icon: Building2 },
  ]

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Settings
        </h1>
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Manage your account and portal preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--color-surface-hover)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  Profile Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                      <input
                        type="email"
                        defaultValue="john@company.com"
                        className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Change Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-4 py-2 rounded-lg outline-none"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    { id: 'project_updates', label: 'Project updates', description: 'Get notified when projects are updated' },
                    { id: 'file_uploads', label: 'File uploads', description: 'Get notified when new files are uploaded' },
                    { id: 'approvals', label: 'Approval requests', description: 'Get notified when approval is needed' },
                    { id: 'mentions', label: 'Mentions', description: 'Get notified when someone mentions you' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={item.id}
                        defaultChecked
                        className="mt-1 w-4 h-4 rounded"
                      />
                      <div>
                        <label htmlFor={item.id} className="font-medium" style={{ color: 'var(--color-text)' }}>
                          {item.label}
                        </label>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  Appearance Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        className="p-4 rounded-lg text-center capitalize transition-colors"
                        style={{
                          backgroundColor: theme === 'light' ? 'var(--color-primary)' : 'var(--color-background)',
                          color: theme === 'light' ? 'white' : 'var(--color-text)',
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                  White-Label Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Brand Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Client Portal"
                      className="w-full px-4 py-2 rounded-lg outline-none"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        defaultValue="#0f172a"
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        defaultValue="#0f172a"
                        className="flex-1 px-4 py-2 rounded-lg outline-none"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Logo Upload
                    </label>
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <p style={{ color: 'var(--color-text-muted)' }}>
                        Drop your logo here or click to upload
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Recommended: 200x50px, PNG or SVG
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Custom CSS
                    </label>
                    <textarea
                      rows={4}
                      placeholder="/* Add your custom CSS here */"
                      className="w-full px-4 py-2 rounded-lg outline-none font-mono text-sm"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
