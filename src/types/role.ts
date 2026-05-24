export const ROLES = [
  'owner',
  'admin',
  'manager',
  'sales',
  'procurement',
  'gudang',
  'finance',
  'hr',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  sales: 'Sales',
  procurement: 'Procurement',
  gudang: 'Gudang',
  finance: 'Finance',
  hr: 'HR',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 100,
  admin: 90,
  manager: 70,
  sales: 40,
  procurement: 40,
  gudang: 40,
  finance: 40,
  hr: 40,
}

export const MODULE_PERMISSIONS: Record<string, Role[]> = {
  system: ['owner', 'admin'],
  master: ['owner', 'admin', 'manager'],
  'pre-sales': ['owner', 'admin', 'manager', 'sales'],
  sales: ['owner', 'admin', 'manager', 'sales'],
  procurement: ['owner', 'admin', 'manager', 'procurement'],
  inventory: ['owner', 'admin', 'manager', 'gudang', 'procurement'],
  finance: ['owner', 'admin', 'manager', 'finance'],
  laporan: ['owner', 'admin', 'manager', 'finance', 'sales'],
  ai: ['owner', 'admin', 'manager', 'sales', 'procurement', 'finance'],
  hr: ['owner', 'admin', 'manager', 'hr'],
}
