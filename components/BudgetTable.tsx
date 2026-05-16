'use client'

import { MONTHS, MONTH_LABELS, Month } from '@/lib/types'
import { fmt, rowTotal } from '@/lib/utils'

interface Column {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: Column[]
  rows: Record<string, unknown>[]
  showMonths?: boolean
  emptyMessage?: string
}

export default function BudgetTable({ columns, rows, showMonths = true, emptyMessage = 'No data yet.' }: Props) {
  if (rows.length === 0) {
    return <div className="text-sm text-gray-400 py-8 text-center">{emptyMessage}</div>
  }

  const totals = showMonths
    ? MONTHS.reduce((acc, m) => {
        acc[m] = rows.reduce((s, r) => s + ((r[m] as number) || 0), 0)
        return acc
      }, {} as Record<string, number>)
    : {}

  const grandTotal = showMonths ? Object.values(totals).reduce((s, v) => s + v, 0) : 0

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map(c => (
              <th
                key={c.key}
                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
            {showMonths && MONTHS.map(m => (
              <th key={m} className="px-2 py-2.5 text-right text-xs font-semibold text-gray-600 w-20">
                {MONTH_LABELS[m as Month]}
              </th>
            ))}
            {showMonths && (
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 w-28 bg-gray-100">
                Full Year
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-xs truncate">
                  {String(row[c.key] ?? '—')}
                </td>
              ))}
              {showMonths && MONTHS.map(m => (
                <td key={m} className="px-2 py-2 text-right text-gray-600 tabular-nums">
                  {row[m] ? fmt(row[m] as number) : '—'}
                </td>
              ))}
              {showMonths && (
                <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums bg-gray-50">
                  {fmt(rowTotal(row))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {showMonths && (
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold">
              <td className="px-3 py-2.5 text-xs text-blue-700" colSpan={columns.length}>
                Total
              </td>
              {MONTHS.map(m => (
                <td key={m} className="px-2 py-2.5 text-right text-xs text-blue-700 tabular-nums">
                  {totals[m] ? fmt(totals[m]) : '—'}
                </td>
              ))}
              <td className="px-3 py-2.5 text-right text-sm text-blue-900 tabular-nums bg-blue-100">
                {fmt(grandTotal)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
