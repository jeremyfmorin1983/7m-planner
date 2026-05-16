import { MONTHS, Month } from './types'

export function fmt(n: number | null | undefined) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function rowTotal(row: Record<string, unknown>) {
  return MONTHS.reduce((sum, m) => sum + ((row[m] as number) || 0), 0)
}

export function clsx(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
