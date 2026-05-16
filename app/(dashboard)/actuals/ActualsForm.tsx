'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MONTH_LABELS, MONTHS, Month } from '@/lib/types'
import { fmt } from '@/lib/utils'

const BUDGET_TYPES = ['Labor', 'Contracts', 'Assets', 'Other'] as const

interface GivingRow { year: number; month: number; amount: number; notes?: string }
interface ActualRow { year: number; month: number; budget_type: string; amount: number }

interface Props {
  year: number
  givingRows: GivingRow[]
  actualsRows: ActualRow[]
}

export default function ActualsForm({ year, givingRows, actualsRows }: Props) {
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const monthGiving = givingRows.find(r => r.month === activeMonth)
  const monthActuals = Object.fromEntries(
    BUDGET_TYPES.map(bt => [bt, actualsRows.find(r => r.month === activeMonth && r.budget_type === bt)?.amount ?? 0])
  )

  const [givingAmount, setGivingAmount] = useState(String(monthGiving?.amount ?? ''))
  const [givingNotes, setGivingNotes] = useState(monthGiving?.notes ?? '')
  const [spendAmounts, setSpendAmounts] = useState<Record<string, string>>(
    Object.fromEntries(BUDGET_TYPES.map(bt => [bt, String(monthActuals[bt] || '')]))
  )

  function selectMonth(m: number) {
    setActiveMonth(m)
    setSaved(false)
    setError('')
    const g = givingRows.find(r => r.month === m)
    setGivingAmount(String(g?.amount ?? ''))
    setGivingNotes(g?.notes ?? '')
    setSpendAmounts(Object.fromEntries(
      BUDGET_TYPES.map(bt => [bt, String(actualsRows.find(r => r.month === m && r.budget_type === bt)?.amount ?? '')])
    ))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    const supabase = createClient()

    // Upsert giving
    const { error: ge } = await supabase.from('giving').upsert({
      year, month: activeMonth,
      amount: parseFloat(givingAmount) || 0,
      notes: givingNotes || null,
    }, { onConflict: 'year,month' })

    // Upsert each spend type
    const spendUpserts = BUDGET_TYPES.map(bt => ({
      year, month: activeMonth,
      budget_type: bt,
      amount: parseFloat(spendAmounts[bt]) || 0,
    }))
    const { error: se } = await supabase.from('actuals_spend').upsert(spendUpserts, { onConflict: 'year,month,budget_type' })

    if (ge || se) {
      setError((ge || se)!.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  const monthLabel = MONTH_LABELS[MONTHS[activeMonth - 1] as Month]
  const totalSpend = BUDGET_TYPES.reduce((s, bt) => s + (parseFloat(spendAmounts[bt]) || 0), 0)

  return (
    <div className="space-y-5">
      {/* Month selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Select Month</div>
        <div className="grid grid-cols-6 gap-1.5">
          {MONTHS.map((m, i) => {
            const mn = i + 1
            const hasData = givingRows.some(r => r.month === mn) || actualsRows.some(r => r.month === mn)
            return (
              <button
                key={m}
                onClick={() => selectMonth(mn)}
                className={`rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  mn === activeMonth
                    ? 'bg-blue-700 text-white'
                    : hasData
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {MONTH_LABELS[m as Month]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Giving */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Giving — {monthLabel} {year}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">$</span>
              <input
                type="number"
                value={givingAmount}
                onChange={e => setGivingAmount(e.target.value)}
                placeholder="0"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={givingNotes}
              onChange={e => setGivingNotes(e.target.value)}
              placeholder="e.g. Includes special gift"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Actual spend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Actual Spend — {monthLabel} {year}</h2>
        <div className="space-y-3">
          {BUDGET_TYPES.map(bt => (
            <div key={bt} className="flex items-center gap-3">
              <label className="w-28 text-sm text-gray-600">{bt}</label>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-400">$</span>
                <input
                  type="number"
                  value={spendAmounts[bt]}
                  onChange={e => setSpendAmounts(prev => ({ ...prev, [bt]: e.target.value }))}
                  placeholder="0"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <span className="w-28 text-sm font-semibold text-gray-700">Total Spend</span>
            <span className="text-sm font-semibold text-gray-900">{fmt(totalSpend)}</span>
          </div>
        </div>
      </div>

      {/* Save */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          Saved for {monthLabel} {year}
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : `Save ${monthLabel} Actuals`}
      </button>
    </div>
  )
}
