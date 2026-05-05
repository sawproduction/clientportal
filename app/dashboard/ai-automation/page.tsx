'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, Users, MessageSquare, Shield, Activity, 
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Zap, BarChart3, RefreshCw, Download
} from 'lucide-react'

interface AnalyticsData {
  totalActions: number
  successRate: number
  avgDuration: number
  totalCost: number
  topAgents: { agentType: string; count: number; successRate: number }[]
  guardrailTriggers: { type: string; count: number }[]
}

export default function AIAutomationPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentLogs, setRecentLogs] = useState<Array<{
    id: string
    timestamp: string
    agentType: string
    action: string
    status: string
    confidence?: number
  }>>([])

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    try {
      setLoading(true)
      const response = await fetch(`/api/ai/analytics?range=${timeRange}`)
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.summary)
        setRecentLogs(data.logs.slice(0, 10))
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateMockLeads() {
    try {
      const response = await fetch('/api/ai/leads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5, source: 'mock' }),
      })
      const data = await response.json()
      if (data.success) {
        alert(`Generated ${data.count} leads!`)
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Failed to generate leads:', error)
    }
  }

  const statusColors: Record<string, string> = {
    completed: 'var(--color-success)',
    failed: 'var(--color-error)',
    blocked_by_guardrail: 'var(--color-warning)',
    started: 'var(--color-info)',
  }

  const agentIcons: Record<string, typeof Bot> = {
    lead_gen: Users,
    outreach: MessageSquare,
    retention: RefreshCw,
    support: Shield,
    refund_review: AlertTriangle,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            AI Automation
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Monitor and manage AI agents for marketing, outreach, and retention
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={generateMockLeads}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            <Zap className="w-4 h-4" />
            Generate Leads
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Actions"
          value={analytics?.totalActions || 0}
          icon={Activity}
          color="var(--color-primary)"
          loading={loading}
        />
        <StatCard
          title="Success Rate"
          value={`${(analytics?.successRate || 0).toFixed(1)}%`}
          icon={CheckCircle}
          color="var(--color-success)"
          loading={loading}
        />
        <StatCard
          title="Avg Duration"
          value={`${(analytics?.avgDuration || 0).toFixed(0)}ms`}
          icon={Clock}
          color="var(--color-info)"
          loading={loading}
        />
        <StatCard
          title="AI Cost"
          value={`$${(analytics?.totalCost || 0).toFixed(3)}`}
          icon={BarChart3}
          color="var(--color-warning)"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Agent Performance
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-background)' }} />
              ))}
            </div>
          ) : analytics?.topAgents.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No data available</p>
          ) : (
            <div className="space-y-3">
              {analytics?.topAgents.map((agent) => {
                const Icon = agentIcons[agent.agentType] || Bot
                return (
                  <div
                    key={agent.agentType}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-surface-hover)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize" style={{ color: 'var(--color-text)' }}>
                        {agent.agentType.replace('_', ' ')}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {agent.count} actions · {(agent.successRate).toFixed(1)}% success
                      </p>
                    </div>
                    <div
                      className="h-2 w-24 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${agent.successRate}%`,
                          backgroundColor: agent.successRate > 80 ? 'var(--color-success)' : 'var(--color-warning)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Guardrail Events */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Guardrail Triggers
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-background)' }} />
              ))}
            </div>
          ) : analytics?.guardrailTriggers.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'var(--color-success)' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>No guardrails triggered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics?.guardrailTriggers.map((trigger) => (
                <div
                  key={trigger.type}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
                  <div className="flex-1">
                    <p className="font-medium capitalize" style={{ color: 'var(--color-text)' }}>
                      {trigger.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {trigger.count} triggers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Recent AI Activity
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-background)' }} />
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No recent activity</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const Icon = agentIcons[log.agentType] || Bot
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[log.status] || 'var(--color-text-muted)' }}
                  />
                  <Icon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {log.action.replace('_', ' ')}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {log.agentType} · {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {log.confidence && (
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: log.confidence > 0.8 ? 'var(--color-success)' : 'var(--color-warning)',
                        color: 'white',
                      }}
                    >
                      {(log.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string
  value: string | number
  icon: typeof Bot
  color: string
  loading: boolean
}) {
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
          {loading ? (
            <div className="h-8 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--color-background)' }} />
          ) : (
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {value}
            </p>
          )}
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {title}
          </p>
        </div>
      </div>
    </div>
  )
}
