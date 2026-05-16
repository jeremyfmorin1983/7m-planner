import { createClient } from '@/lib/supabase/server'
import BudgetTable from '@/components/BudgetTable'
import { fmt } from '@/lib/utils'

const COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'asset_type', label: 'Type' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'location_user', label: 'Location/User' },
  { key: 'quantity', label: 'Qty' },
  { key: 'unit_cost', label: 'Unit Cost' },
  { key: 'refresh_date', label: 'Refresh Date' },
  { key: 'refresh_status', label: 'Status' },
]

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('assets').select('*').order('department')

  const today = new Date()
  const formatted = (rows || []).map(r => {
    const refresh = r.refresh_date ? new Date(r.refresh_date) : null
    const isPastDue = refresh && refresh < today
    const isDueSoon = refresh && !isPastDue && (refresh.getTime() - today.getTime()) < 365 * 24 * 60 * 60 * 1000

    return {
      ...r,
      unit_cost: r.unit_cost != null ? fmt(r.unit_cost) : '—',
      refresh_date: refresh ? refresh.toLocaleDateString() : '—',
      refresh_status: isPastDue ? '⚠ Past due' : isDueSoon ? '→ Due this year' : refresh ? 'OK' : '—',
    }
  })

  const pastDueCount = formatted.filter(r => r.refresh_status === '⚠ Past due').length

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Equipment inventory with refresh tracking</p>
        </div>
        {pastDueCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
            {pastDueCount} asset{pastDueCount !== 1 ? 's' : ''} past refresh date
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <BudgetTable
          columns={COLUMNS}
          rows={formatted}
          showMonths={true}
          emptyMessage="No assets yet. Import from Excel or add via Supabase."
        />
      </div>
    </div>
  )
}
