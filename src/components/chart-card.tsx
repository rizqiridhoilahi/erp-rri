import type { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  icon: LucideIcon
  iconVariant?: 'primary' | 'success' | 'warning' | 'destructive' | 'info'
  children: ReactNode
  subtitle?: string
}

const variantStyles: Record<string, { container: string; icon: string }> = {
  primary:     { container: 'bg-primary/20',     icon: 'text-primary' },
  success:     { container: 'bg-success/20',      icon: 'text-success' },
  warning:     { container: 'bg-warning/20',       icon: 'text-warning' },
  destructive: { container: 'bg-destructive/20',   icon: 'text-destructive' },
  info:        { container: 'bg-sky-500/20',       icon: 'text-sky-500' },
}

export function ChartCard({ title, icon: Icon, iconVariant = 'primary', children, subtitle }: ChartCardProps) {
  const colors = variantStyles[iconVariant]
  return (
    <div className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20 hover:shadow-[0_4px_20px_rgba(0,0,255,0.08)] dark:hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between px-6 pt-6 pb-0">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={`${colors.container} p-3 rounded-lg`}>
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </div>
      <div className="p-6 pt-4">
        {children}
      </div>
    </div>
  )
}
