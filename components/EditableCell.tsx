'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt } from '@/lib/utils'

interface Props {
  table: string
  rowId: string
  field: string
  value: number
  canEdit: boolean
}

export default function EditableCell({ table, rowId, field, value, canEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync when parent row state changes (e.g. after a panel save)
  useEffect(() => { setCurrent(value) }, [value])

  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  async function save(raw: string) {
    const num = parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0
    setEditing(false)
    if (num === current) return
    setSaving(true)
    setError(false)
    const supabase = createClient()
    const { error } = await supabase.from(table).update({ [field]: num }).eq('id', rowId)
    if (error) {
      setError(true)
    } else {
      setCurrent(num)
    }
    setSaving(false)
  }

  if (!canEdit) {
    return <span className="tabular-nums text-gray-500">{current ? fmt(current) : '—'}</span>
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={current || ''}
        className="w-20 border border-blue-400 rounded px-1 py-0.5 text-right text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
        onBlur={e => save(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') save((e.target as HTMLInputElement).value)
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title={error ? 'Save failed — click to retry' : undefined}
      className={`tabular-nums text-right w-full rounded px-1 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
        saving ? 'opacity-50' : ''
      } ${error ? 'text-red-500 bg-red-50' : current ? 'text-gray-700' : 'text-gray-300'}`}
    >
      {saving ? '…' : current ? fmt(current) : '—'}
    </button>
  )
}
