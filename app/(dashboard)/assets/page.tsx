import { createClient } from '@/lib/supabase/server'
import EditableBudgetTable from '@/components/EditableBudgetTable'

const COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'asset_type', label: 'Type' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'location_user', label: 'Location/User' },
  { key: 'quantity', label: 'Qty' },
]

const EDIT_FIELDS = [
  { key: 'department', label: 'Department' },
  { key: 'asset_type', label: 'Asset Type' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'serial_number', label: 'Serial #' },
  { key: 'comments', label: 'Comments' },
  { key: 'location_user', label: 'Location / User' },
  { key: 'purchase_date', label: 'Purchase Date', type: 'date' as const },
  { key: 'life_in_months', label: 'Life (months)', type: 'number' as const },
  { key: 'refresh_date', label: 'Refresh Date', type: 'date' as const },
  { key: 'unit_cost', label: 'Unit Cost', type: 'number' as const },
  { key: 'quantity', label: 'Quantity', type: 'number' as const },
]

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('assets').select('*').order('department')

  const today = new Date()
  const pastDueCount = (rows || []).filter(r => {
    const d = r.refresh_date ? new Date(r.refresh_date) : null
    return d && d < today
  }).length

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Equipment inventory. Click ✎ to edit a row, click a monthly cell to edit the amount.
          </p>
        </div>
        {pastDueCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
            {pastDueCount} asset{pastDueCount !== 1 ? 's' : ''} past refresh date
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <EditableBudgetTable
          table="assets"
          columns={COLUMNS}
          initialRows={rows || []}
          editFields={EDIT_FIELDS}
          deptKey="department"
        />
      </div>
    </div>
  )
}
