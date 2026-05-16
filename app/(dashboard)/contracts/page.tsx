import { createClient } from '@/lib/supabase/server'
import EditableBudgetTable from '@/components/EditableBudgetTable'

const COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
]

const EDIT_FIELDS = [
  { key: 'department', label: 'Department', type: 'select' as const, options: ['Admin','Business','Care & Assimilation','College','Communications','Facility','Groups','IT','Kids','Missions','Pastoral','Preteen','Production','Students','Worship'] },
  { key: 'phase', label: 'Phase', type: 'phase' as const },
  { key: 'category', label: 'Category', type: 'category' as const },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'start_date', label: 'Start Date', type: 'date' as const },
  { key: 'end_date', label: 'End Date', type: 'date' as const },
  { key: 'contract_amount', label: 'Contract Amount', type: 'number' as const },
]

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('contracts').select('*').order('department')

  return (
    <div className="max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vendor contracts and monthly spend. Click ✎ to edit a row, click a monthly cell to edit the amount.
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <EditableBudgetTable
          table="contracts"
          columns={COLUMNS}
          initialRows={rows || []}
          editFields={EDIT_FIELDS}
          deptKey="department"
        />
      </div>
    </div>
  )
}
