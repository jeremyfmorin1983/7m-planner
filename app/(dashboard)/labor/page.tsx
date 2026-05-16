import { createClient } from '@/lib/supabase/server'
import BudgetTable from '@/components/BudgetTable'
import { fmt } from '@/lib/utils'

const COLUMNS = [
  { key: 'functional_dept', label: 'Department' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'total_comp', label: 'Total Comp' },
  { key: 'base', label: 'Base' },
]

export default async function LaborPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('labor').select('*').order('functional_dept')

  const formatted = (rows || []).map(r => ({
    ...r,
    total_comp: r.total_comp != null ? fmt(r.total_comp) : '—',
    base: r.base != null ? fmt(r.base) : '—',
  }))

  return (
    <div className="max-w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labor</h1>
          <p className="text-sm text-gray-500 mt-1">Staff compensation and monthly payroll</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <BudgetTable
          columns={COLUMNS}
          rows={formatted}
          showMonths={true}
          emptyMessage="No labor records. Add staff in your Supabase dashboard or import from Excel."
        />
      </div>
    </div>
  )
}
