// White-label theme configuration
// Modify these values to customize the portal branding

export interface ThemeConfig {
  brand: {
    name: string
    logo: string | null // path to logo or null for text-only
    favicon: string
  }
  colors: {
    primary: string
    primaryHover: string
    secondary: string
    background: string
    surface: string
    surfaceHover: string
    border: string
    text: string
    textMuted: string
    success: string
    warning: string
    error: string
    info: string
  }
  fonts: {
    heading: string
    body: string
  }
}

// Default theme - customize this for white-labeling
export const defaultTheme: ThemeConfig = {
  brand: {
    name: 'Client Portal',
    logo: null,
    favicon: '/favicon.ico',
  },
  colors: {
    primary: '#0f172a',
    primaryHover: '#1e293b',
    secondary: '#64748b',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
  },
}

// Helper to generate CSS variables from theme
export function generateCSSVariables(theme: ThemeConfig): string {
  return `
    :root {
      --brand-name: '${theme.brand.name}';
      --color-primary: ${theme.colors.primary};
      --color-primary-hover: ${theme.colors.primaryHover};
      --color-secondary: ${theme.colors.secondary};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-surface-hover: ${theme.colors.surfaceHover};
      --color-border: ${theme.colors.border};
      --color-text: ${theme.colors.text};
      --color-text-muted: ${theme.colors.textMuted};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
      --font-heading: ${theme.fonts.heading};
      --font-body: ${theme.fonts.body};
    }
  `
}
