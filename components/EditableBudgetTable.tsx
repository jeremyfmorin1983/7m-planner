'use client'

import { useState } from 'react'
import { MONTHS, MONTH_LABELS, Month } from '@/lib/types'
import { fmt, rowTotal } from '@/lib/utils'
import { useProfile } from '@/lib/hooks'
import EditableCell from './EditableCell'
import RowEditPanel, { FieldDef } from './RowEditPanel'

interface Column {
  key: string
  label: string
}

interface Props {
  table: string
  columns: Column[]
  initialRows: Record<string, unknown>[]
  editFields: FieldDef[]
  deptKey: string
}

export default function EditableBudgetTable({ table, columns, initialRows, editFields, deptKey }: Props) {
  const profile = useProfile()
  const [rows, setRows] = useState(initialRows)
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null)

  function canEdit(row: Record<string, unknown>) {
    if (!profile) return false
    if (profile.is_admin) return true
    return profile.department === row[deptKey]
  }

  function handleSaved(updated: Record<string, unknown>) {
    setRows(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  const totals = MONTHS.reduce((acc, m) => {
    acc[m] = rows.reduce((s, r) => s + ((r[m] as number) || 0), 0)
    return acc
  }, {} as Record<string, number>)
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)

  if (rows.length === 0) {
    return <div className="text-sm text-gray-400 py-8 text-center">No data yet.</div>
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-8 px-2" />
              {columns.map(c => (
                <th key={c.key} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
              {MONTHS.map(m => (
                <th key={m} className="px-2 py-2.5 text-right text-xs font-semibold text-gray-600 w-20">
                  {MONTH_LABELS[m as Month]}
                </th>
              ))}
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 w-28 bg-gray-100">
                Full Year
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => {
              const editable = canEdit(row)
              return (
                <tr key={i} className={`transition-colors ${editable ? 'hover:bg-blue-50/30' : 'opacity-60'}`}>
                  <td className="px-2 py-2 text-center">
                    {editable && (
                      <button
                        onClick={() => setEditingRow(row)}
                        className="text-gray-300 hover:text-blue-600 transition-colors text-base leading-none"
                        title="Edit row"
                      >
                        ✎
                      </button>
                    )}
                  </td>
                  {columns.map(c => (
                    <td key={c.key} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-xs truncate">
                      {String(row[c.key] ?? '—')}
                    </td>
                  ))}
                  {MONTHS.map(m => (
                    <td key={m} className="px-2 py-1.5 text-right">
                      <EditableCell
                        table={table}
                        rowId={row.id as string}
                        field={m}
                        value={(row[m] as number) || 0}
                        canEdit={editable}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums bg-gray-50">
                    {fmt(rowTotal(row))}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold">
              <td colSpan={columns.length + 1} className="px-3 py-2.5 text-xs text-blue-700">Total</td>
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
        </table>
      </div>

      <RowEditPanel
        table={table}
        row={editingRow}
        fields={editFields}
        onClose={() => setEditingRow(null)}
        onSaved={handleSaved}
      />
    </>
  )
}
