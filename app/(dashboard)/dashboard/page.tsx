import { createClient } from '@/lib/supabase/server'
import { MONTHS } from '@/lib/types'
import { fmt, rowTotal } from '@/lib/utils'
import MonthlyChart from '@/components/MonthlyChart'

function sumRows(rows: Record<string, unknown>[]) {
  return MONTHS.reduce((acc, m) => {
    acc[m] = rows.reduce((s, r) => s + ((r[m] as number) || 0), 0)
    return acc
  }, {} as Record<string, number>)
}

function grandTotal(rows: Record<string, unknown>[]) {
  return rows.reduce((s, r) => s + rowTotal(r), 0)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: labor },
    { data: contracts },
    { data: assets },
    { data: other },
    { data: bonus },
  ] = await Promise.all([
    supabase.from('labor').select('*'),
    supabase.from('contracts').select('*'),
    supabase.from('assets').select('*'),
    supabase.from('other_items').select('*'),
    supabase.from('bonus_config').select('*').single(),
  ])

  const all = [
    ...(labor || []),
    ...(contracts || []),
    ...(assets || []),
    ...(other || []),
  ] as Record<string, unknown>[]

  const totalBudget = grandTotal(all)
  const laborTotal = grandTotal((labor || []) as Record<string, unknown>[])
  const contractsTotal = grandTotal((contracts || []) as Record<string, unknown>[])
  const assetsTotal = grandTotal((assets || []) as Record<string, unknown>[])
  const otherTotal = grandTotal((other || []) as Record<string, unknown>[])

  const allMonthly = sumRows(all)

  const SUMMARY = [
    { label: 'Labor', value: laborTotal, color: 'bg-blue-100 text-blue-800' },
    { label: 'Contracts', value: contractsTotal, color: 'bg-purple-100 text-purple-800' },
    { label: 'Assets', value: assetsTotal, color: 'bg-green-100 text-green-800' },
    { label: 'Other', value: otherTotal, color: 'bg-orange-100 text-orange-800' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Full-year budget overview</p>
      </div>

      {/* Total + breakdown cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="col-span-2 sm:col-span-1 bg-blue-700 text-white rounded-xl p-5 flex flex-col justify-between">
          <div className="text-xs font-medium text-blue-200 uppercase tracking-wide">Total Budget</div>
          <div className="text-2xl font-bold mt-2">{fmt(totalBudget)}</div>
        </div>
        {SUMMARY.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-semibold text-gray-900">{fmt(value)}</div>
            <div className={`mt-2 text-xs font-medium rounded-full px-2 py-0.5 inline-block ${color}`}>
              {totalBudget > 0 ? ((value / totalBudget) * 100).toFixed(1) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* Monthly spend chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Spend</h2>
        <MonthlyChart data={Object.entries(allMonthly).map(([k, v]) => ({ [k]: v }))} />
      </div>

      {/* Bonus funding status */}
      {bonus && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Bonus Funding</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Revenue Target</div>
              <div className="font-semibold">{fmt(bonus.annual_revenue_target)}</div>
            </div>
            <div>
              <div className="text-gray-500">Total Bonus Pool</div>
              <div className="font-semibold">{fmt(bonus.total_bonus_pool)}</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Go to Bonus Calculator to see tier funding based on actual revenue.
          </p>
        </div>
      )}
    </div>
  )
}
