import { createClient } from '@/lib/supabase/server'
import { MONTHS, Month } from '@/lib/types'
import { fmt, rowTotal } from '@/lib/utils'
import MonthlyChart from '@/components/MonthlyChart'
import BudgetVsActualChart from '@/components/BudgetVsActualChart'

function grandTotal(rows: Record<string, unknown>[]) {
  return rows.reduce((s, r) => s + rowTotal(r), 0)
}

function monthlyTotals(rows: Record<string, unknown>[]) {
  return MONTHS.reduce((acc, m) => {
    acc[m] = rows.reduce((s, r) => s + ((r[m] as number) || 0), 0)
    return acc
  }, {} as Record<string, number>)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const [
    { data: labor },
    { data: contracts },
    { data: assets },
    { data: other },
    { data: bonus },
    { data: giving },
    { data: actuals },
  ] = await Promise.all([
    supabase.from('labor').select('*'),
    supabase.from('contracts').select('*'),
    supabase.from('assets').select('*'),
    supabase.from('other_items').select('*'),
    supabase.from('bonus_config').select('*').single(),
    supabase.from('giving').select('*').eq('year', year),
    supabase.from('actuals_spend').select('*').eq('year', year),
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

  const budgetByMonth = monthlyTotals(all)

  // Actuals by month
  const actualsByMonth = MONTHS.reduce((acc, m, i) => {
    const mn = i + 1
    acc[m] = (actuals || []).filter(r => r.month === mn).reduce((s, r) => s + (r.amount || 0), 0)
    return acc
  }, {} as Record<string, number>)

  // Giving by month
  const givingByMonth = MONTHS.reduce((acc, m, i) => {
    const mn = i + 1
    const row = (giving || []).find(r => r.month === mn)
    acc[m] = row?.amount || 0
    return acc
  }, {} as Record<string, number>)

  const totalActuals = Object.values(actualsByMonth).reduce((s, v) => s + v, 0)
  const totalGiving = Object.values(givingByMonth).reduce((s, v) => s + v, 0)
  const hasActuals = totalActuals > 0 || totalGiving > 0

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
        <p className="text-sm text-gray-500 mt-1">Full-year budget overview — {year}</p>
      </div>

      {/* Budget summary cards */}
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

      {/* Actuals summary cards — only show if actuals exist */}
      {hasActuals && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">YTD Giving</div>
            <div className="text-lg font-semibold text-green-700">{fmt(totalGiving)}</div>
            {bonus && (
              <div className="mt-1 text-xs text-gray-400">
                {((totalGiving / bonus.annual_revenue_target) * 100).toFixed(1)}% of {fmt(bonus.annual_revenue_target)} target
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 mb-1">YTD Actual Spend</div>
            <div className="text-lg font-semibold text-blue-700">{fmt(totalActuals)}</div>
            <div className="mt-1 text-xs text-gray-400">
              {totalBudget > 0 ? ((totalActuals / totalBudget) * 100).toFixed(1) : 0}% of budget
            </div>
          </div>
          <div className={`rounded-xl border p-5 ${totalGiving >= totalActuals ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-xs text-gray-500 mb-1">Net (Giving − Spend)</div>
            <div className={`text-lg font-semibold ${totalGiving >= totalActuals ? 'text-green-700' : 'text-red-700'}`}>
              {fmt(totalGiving - totalActuals)}
            </div>
            <div className="mt-1 text-xs text-gray-400">YTD</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {hasActuals ? 'Budget vs Actual Spend vs Giving' : 'Monthly Budget Spend'}
        </h2>
        {hasActuals ? (
          <BudgetVsActualChart
            budgetByMonth={budgetByMonth}
            actualsByMonth={actualsByMonth}
            givingByMonth={givingByMonth}
          />
        ) : (
          <MonthlyChart data={Object.entries(budgetByMonth).map(([k, v]) => ({ [k]: v }))} />
        )}
        {!hasActuals && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            Enter actuals in the Actuals page to see budget vs actual comparison.
          </p>
        )}
      </div>

      {/* Bonus */}
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
          {hasActuals && totalGiving > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
              <div className="text-gray-500">YTD Giving vs Target</div>
              <div className="mt-1 w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totalGiving / bonus.annual_revenue_target) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {fmt(totalGiving)} of {fmt(bonus.annual_revenue_target)} ({((totalGiving / bonus.annual_revenue_target) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
