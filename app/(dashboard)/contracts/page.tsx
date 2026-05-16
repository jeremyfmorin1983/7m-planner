import { createClient } from '@/lib/supabase/server'
import BudgetTable from '@/components/BudgetTable'
import { fmt } from '@/lib/utils'

const COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'phase', label: 'Phase' },
  { key: 'category', label: 'Category' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'description', label: 'Description' },
  { key: 'contract_amount', label: 'Amount' },
  { key: 'start_date', label: 'Start' },
  { key: 'end_date', label: 'End' },
]

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('contracts').select('*').order('department')

  const formatted = (rows || []).map(r => ({
    ...r,
    contract_amount: r.contract_amount != null ? fmt(r.contract_amount) : '—',
    start_date: r.start_date ? new Date(r.start_date).toLocaleDateString() : '—',
    end_date: r.end_date ? new Date(r.end_date).toLocaleDateString() : '—',
  }))

  return (
    <div className="max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
        <p className="text-sm text-gray-500 mt-1">Vendor contracts and monthly spend</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <BudgetTable
          columns={COLUMNS}
          rows={formatted}
          showMonths={true}
          emptyMessage="No contracts yet. Import from Excel or add via Supabase."
        />
      </div>
    </div>
  )
}
