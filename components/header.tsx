'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, User } from 'lucide-react'

interface UserMetadata {
  full_name?: string
  email?: string
}

export function Header() {
  const [user, setUser] = useState<UserMetadata | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          email: user.email,
        })
      }
    }
    getUser()
  }, [supabase])

  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
        Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
      </h1>

      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Bell className="w-5 h-5" />
        </button>

        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
