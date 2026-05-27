export function castAs<T>(val: unknown): T {
  return val as T
}

export function castArray<T>(val: unknown, fallback: T[] = []): T[] {
  return Array.isArray(val) ? (val as T[]) : fallback
}

export function castAsDate(val: unknown): Date {
  return val as Date
}

export function castAsRef<T>(ref: React.RefObject<unknown>): T {
  return ref.current as T
}
