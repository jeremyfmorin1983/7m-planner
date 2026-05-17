'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS, ASSET_TYPES, getDepts, getPhases, getCategories } from '@/lib/dropdowns'
import { MONTHS, Month, MONTH_LABELS } from '@/lib/types'
import { fmt } from '@/lib/utils'

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'phase' | 'category'
  options?: string[]
}

// Parse "YYYY-MM-DD" as local date (avoids UTC-offset shifting the day)
function parseLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function distributeContract(amount: number, startDate: string, endDate: string): Record<string, number> | null {
  if (!amount || !startDate || !endDate) return null
  const start = parseLocal(startDate)
  const end = parseLocal(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null

  const year = start.getFullYear()
  const activeMonths: number[] = []
  const cur = new Date(year, start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
  while (cur <= endMonth) {
    if (cur.getFullYear() === year) activeMonths.push(cur.getMonth() + 1)
    cur.setMonth(cur.getMonth() + 1)
  }
  if (activeMonths.length === 0) return null

  const monthly = Math.round((amount / activeMonths.length) * 100) / 100
  const dist: Record<string, number> = Object.fromEntries(MONTHS.map(m => [m, 0]))
  activeMonths.forEach(mn => { dist[MONTHS[mn - 1]] = monthly })
  return dist
}

interface Props {
  table: string
  row: Record<string, unknown> | null
  fields: FieldDef[]
  onClose: () => void
  onSaved: (updated: Record<string, unknown>) => void
  onDeleted?: (id: string) => void
  isNew?: boolean
}

export default function RowEditPanel({ table, row, fields, onClose, onSaved, onDeleted, isNew = false }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState<'delete' | 'clear' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!row) return
    const init: Record<string, string> = {}
    fields.forEach(f => {
      const v = row[f.key]
      init[f.key] = v != null ? String(v) : ''
    })
    setValues(init)
  }, [row, fields])

  if (!row) return null

  function set(key: string, val: string) {
    setValues(prev => {
      const next = { ...prev, [key]: val }
      // Reset downstream cascades when dept or phase changes
      if (key === 'department') {
        next.phase = ''
        next.category = ''
      }
      if (key === 'phase') {
        next.category = ''
      }
      return next
    })
  }

  // Live distribution preview for contracts
  const distribution = table === 'contracts'
    ? distributeContract(
        parseFloat(values['contract_amount']) || 0,
        values['start_date'] ?? '',
        values['end_date'] ?? ''
      )
    : null

  async function handleSave() {
    if (!row) return
    setSaving(true)
    setError('')
    const updates: Record<string, unknown> = {}
    fields.forEach(f => {
      const v = values[f.key]
      if (f.type === 'number') updates[f.key] = v === '' ? null : parseFloat(v)
      else updates[f.key] = v === '' ? null : v
    })
    if (distribution) Object.assign(updates, distribution)
    const supabase = createClient()
    if (isNew) {
      const { data, error } = await supabase.from(table).insert(updates).select().single()
      if (error) {
        setError(error.message.includes('row-level security')
          ? "You don't have permission to add rows."
          : error.message)
        setSaving(false)
      } else {
        onSaved(data as Record<string, unknown>)
        onClose()
      }
    } else {
      const { error } = await supabase.from(table).update(updates).eq('id', row.id)
      if (error) {
        setError(error.message.includes('row-level security')
          ? "You don't have permission to edit this row."
          : error.message)
        setSaving(false)
      } else {
        onSaved({ ...row, ...updates })
        onClose()
      }
    }
  }

  async function handleClear() {
    if (!row) return
    setSaving(true)
    setError('')
    const cleared = Object.fromEntries(MONTHS.map(m => [m, 0]))
    const supabase = createClient()
    const { error } = await supabase.from(table).update(cleared).eq('id', row.id)
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onSaved({ ...row, ...cleared })
      onClose()
    }
  }

  async function handleDelete() {
    if (!row) return
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', row.id)
    if (error) {
      setError(error.message.includes('row-level security')
        ? "You don't have permission to delete this row."
        : error.message)
      setSaving(false)
    } else {
      onDeleted?.(row.id as string)
      onClose()
    }
  }

  function renderField(f: FieldDef) {
    const val = values[f.key] ?? ''
    const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

    if (f.type === 'select') {
      const opts = f.options ?? []
      return (
        <select value={val} onChange={e => set(f.key, e.target.value)} className={cls}>
          <option value="">— select —</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    if (f.type === 'phase') {
      const dept = values['department'] ?? ''
      const phases = dept ? getPhases(table, dept) : []
      return (
        <select value={val} onChange={e => set(f.key, e.target.value)} className={cls} disabled={!dept}>
          <option value="">— {dept ? 'select phase' : 'select department first'} —</option>
          {phases.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )
    }

    if (f.type === 'category') {
      const dept = values['department'] ?? ''
      const phase = values['phase'] ?? ''
      const cats = dept && phase ? getCategories(table, dept, phase) : []
      return (
        <select value={val} onChange={e => set(f.key, e.target.value)} className={cls} disabled={!phase}>
          <option value="">— {phase ? 'select category' : 'select phase first'} —</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )
    }

    if (f.type === 'number') {
      return <input type="number" value={val} onChange={e => set(f.key, e.target.value)} className={cls} />
    }

    if (f.type === 'date') {
      return <input type="date" value={val} onChange={e => set(f.key, e.target.value)} className={cls} />
    }

    return <input type="text" value={val} onChange={e => set(f.key, e.target.value)} className={cls} />
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-96 bg-white shadow-xl flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{isNew ? 'Add Row' : 'Edit Row'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              {renderField(f)}
            </div>
          ))}

          {distribution && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-3 text-xs">
              <div className="font-semibold text-blue-800 mb-2">Monthly distribution preview</div>
              <div className="grid grid-cols-3 gap-1">
                {MONTHS.map(m => distribution[m] > 0 && (
                  <div key={m} className="flex justify-between text-blue-700">
                    <span>{MONTH_LABELS[m as Month]}</span>
                    <span className="font-medium">{fmt(distribution[m])}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between text-blue-800 font-semibold">
                <span>Total</span>
                <span>{fmt(Object.values(distribution).reduce((s, v) => s + v, 0))}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 space-y-2">
          {/* Confirm clear */}
          {confirming === 'clear' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 flex items-center justify-between">
              <span>Clear all monthly amounts?</span>
              <div className="flex gap-2">
                <button onClick={handleClear} className="font-semibold text-yellow-900 hover:underline">Yes</button>
                <button onClick={() => setConfirming(null)} className="text-yellow-700 hover:underline">No</button>
              </div>
            </div>
          )}
          {/* Confirm delete */}
          {confirming === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-800 flex items-center justify-between">
              <span>Permanently delete this row?</span>
              <div className="flex gap-2">
                <button onClick={handleDelete} className="font-semibold text-red-900 hover:underline">Yes, delete</button>
                <button onClick={() => setConfirming(null)} className="text-red-700 hover:underline">No</button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
          {!isNew && (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming('clear')}
                disabled={saving}
                className="flex-1 border border-yellow-300 text-yellow-700 hover:bg-yellow-50 rounded-lg py-1.5 text-xs transition-colors disabled:opacity-50"
              >
                Clear amounts
              </button>
              <button
                onClick={() => setConfirming('delete')}
                disabled={saving}
                className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg py-1.5 text-xs transition-colors disabled:opacity-50"
              >
                Delete row
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
