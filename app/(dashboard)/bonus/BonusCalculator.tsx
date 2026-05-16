'use client'

import { useState } from 'react'
import { fmt } from '@/lib/utils'

interface BonusConfig {
  annual_revenue_target: number
  total_bonus_pool: number
}

interface StaffRow {
  name: string | null
  role: string | null
  functional_dept: string | null
  total_comp: number | null
}

interface Props {
  config: BonusConfig | null
  staffRows: StaffRow[]
}

const TIERS = [
  { label: 'Maximum Funding', threshold: 1.05, pct: 1.1 },
  { label: 'Fourth Quartile', threshold: 1.00, pct: 1.0 },
  { label: 'Third Quartile',  threshold: 0.975, pct: 0.75 },
  { label: 'Second Quartile', threshold: 0.95,  pct: 0.5 },
  { label: 'First Quartile',  threshold: 0.90,  pct: 0.25 },
  { label: 'Not Funded',      threshold: 0,     pct: 0 },
]

function getTier(pctOfTarget: number) {
  for (const tier of TIERS) {
    if (pctOfTarget >= tier.threshold) return tier
  }
  return TIERS[TIERS.length - 1]
}

export default function BonusCalculator({ config, staffRows }: Props) {
  const target = config?.annual_revenue_target ?? 2000000
  const pool = config?.total_bonus_pool ?? 85552

  const [revenue, setRevenue] = useState('')

  const actualRevenue = parseFloat(revenue.replace(/,/g, '')) || 0
  const pctOfTarget = actualRevenue > 0 ? actualRevenue / target : 0
  const tier = pctOfTarget > 0 ? getTier(pctOfTarget) : null
  const fundedPool = tier ? pool * tier.pct : 0

  // Each staff member's share is proportional to their comp relative to total comp
  const totalComp = staffRows.reduce((s, r) => s + (r.total_comp || 0), 0)

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Actual Annual Revenue
        </label>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-lg">$</span>
          <input
            type="text"
            value={revenue}
            onChange={e => setRevenue(e.target.value)}
            placeholder="e.g. 1,950,000"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {actualRevenue > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {(pctOfTarget * 100).toFixed(1)}% of {fmt(target)} target
          </p>
        )}
      </div>

      {/* Tier result */}
      {tier && (
        <div className={`rounded-xl border-2 p-6 ${
          tier.pct === 0 ? 'border-red-200 bg-red-50' :
          tier.pct >= 1 ? 'border-green-200 bg-green-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Funding Tier</div>
              <div className="text-xl font-bold text-gray-900">{tier.label}</div>
              <div className="text-sm text-gray-600 mt-1">
                {(tier.pct * 100).toFixed(0)}% of bonus pool funded
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Funded Amount</div>
              <div className="text-2xl font-bold text-gray-900">{fmt(fundedPool)}</div>
            </div>
          </div>
        </div>
      )}

      {/* All tiers reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">All Tiers</h3>
        <div className="space-y-2">
          {TIERS.map(t => {
            const isActive = tier?.label === t.label
            return (
              <div
                key={t.label}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive && <span className="text-blue-600 font-bold">→</span>}
                  <span className={isActive ? 'font-semibold text-blue-900' : 'text-gray-700'}>{t.label}</span>
                  <span className="text-gray-400 text-xs">
                    {t.threshold > 0 ? `≥${(t.threshold * 100).toFixed(1)}%` : '<90%'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{(t.pct * 100).toFixed(0)}% funded</span>
                  <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                    {fmt(pool * t.pct)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-staff breakdown */}
      {tier && tier.pct > 0 && staffRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Individual Bonus Estimates</h3>
          <p className="text-xs text-gray-400 mb-3">
            Proportional to total comp. Actual distribution may differ.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">Name</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">Dept</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Total Comp</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500">Est. Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staffRows
                  .filter(r => r.total_comp && r.total_comp > 0)
                  .sort((a, b) => (b.total_comp || 0) - (a.total_comp || 0))
                  .map((r, i) => {
                    const share = totalComp > 0 ? (r.total_comp! / totalComp) * fundedPool : 0
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2 text-gray-800">{r.name || '—'}</td>
                        <td className="py-2 text-gray-500">{r.functional_dept || '—'}</td>
                        <td className="py-2 text-right tabular-nums text-gray-700">{fmt(r.total_comp)}</td>
                        <td className="py-2 text-right tabular-nums font-medium text-gray-900">{fmt(share)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
