'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEPARTMENTS, ASSET_TYPES, getDepts, getPhases, getCategories } from '@/lib/dropdowns'

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'phase' | 'category'
  options?: string[]
}

interface Props {
  table: string
  row: Record<string, unknown> | null
  fields: FieldDef[]
  onClose: () => void
  onSaved: (updated: Record<string, unknown>) => void
}

export default function RowEditPanel({ table, row, fields, onClose, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
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
    const supabase = createClient()
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
          <h2 className="font-semibold text-gray-900">Edit Row</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              {renderField(f)}
            </div>
          ))}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
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
      </div>
    </div>
  )
}
