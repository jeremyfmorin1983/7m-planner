import { createClient } from '@/lib/supabase/server'
import BudgetTable from '@/components/BudgetTable'

const COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'phase', label: 'Phase' },
  { key: 'category', label: 'Category' },
  { key: 'item', label: 'Item' },
]

export default async function OtherPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('other_items').select('*').order('department')

  return (
    <div className="max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Other</h1>
        <p className="text-sm text-gray-500 mt-1">Miscellaneous budget items</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <BudgetTable
          columns={COLUMNS}
          rows={rows || []}
          showMonths={true}
          emptyMessage="No other items yet."
        />
      </div>
    </div>
  )
}
