import { Badge } from '@/components/ui/badge'

type StatusVariant = 'active' | 'inactive' | 'pending' | 'draft' | 'success' | 'warning' | 'error' | 'info'

interface StatusBadgeProps {
  status: StatusVariant | string
  label?: string
  className?: string
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  active: { variant: 'default', label: 'Active' },
  inactive: { variant: 'destructive', label: 'Non-Active' },
  pending: { variant: 'secondary', label: 'Pending' },
  draft: { variant: 'outline', label: 'Draft' },
  success: { variant: 'default', label: 'Sukses' },
  warning: { variant: 'secondary', label: 'Warning' },
  error: { variant: 'destructive', label: 'Error' },
  info: { variant: 'secondary', label: 'Info' },
  true: { variant: 'default', label: 'Ya' },
  false: { variant: 'destructive', label: 'Tidak' },
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalized = status?.toString().toLowerCase()
  const config = statusConfig[normalized] ?? { variant: 'outline' as const, label: status ?? '' }

  return (
    <Badge variant={config.variant} className={className}>
      {label ?? config.label}
    </Badge>
  )
}
