import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react'

type IconVariant = 'primary' | 'success' | 'warning' | 'destructive' | 'info'

type StatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: number
  trendLabel?: string
  iconVariant?: IconVariant
}

const variantStyles: Record<IconVariant, { container: string; icon: string }> = {
  primary:     { container: 'bg-primary/20',     icon: 'text-primary' },
  success:     { container: 'bg-success/20',      icon: 'text-success' },
  warning:     { container: 'bg-warning/20',       icon: 'text-warning' },
  destructive: { container: 'bg-destructive/20',   icon: 'text-destructive' },
  info:        { container: 'bg-sky-500/20',       icon: 'text-sky-500' },
}

export function StatCard({ label, value, icon: Icon, subtitle, trend, trendLabel, iconVariant = 'primary' }: StatCardProps) {
  const colors = variantStyles[iconVariant]
  return (
    <Card className="rounded-2xl bg-white dark:bg-primary/10 dark:backdrop-blur-sm border border-primary/10 dark:border-primary/20 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,255,0.08)] dark:hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {label}
        </CardTitle>
        <div className={`${colors.container} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-heading tracking-tight text-primary">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </div>
        <div className="flex items-center justify-between mt-1">
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
              {trendLabel && <span className="text-muted-foreground font-normal ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
