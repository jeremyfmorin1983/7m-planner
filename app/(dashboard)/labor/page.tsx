import { createClient } from '@/lib/supabase/server'
import EditableBudgetTable from '@/components/EditableBudgetTable'

const COLUMNS = [
  { key: 'functional_dept', label: 'Department' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
]

const EDIT_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'functional_dept', label: 'Department', type: 'select' as const, options: ['Admin','Business','Care & Assimilation','College','Communications','Facility','Groups','IT','Kids','Missions','Pastoral','Preteen','Production','Students','Worship'] },
  { key: 'start_date', label: 'Start Date', type: 'date' as const },
  { key: 'total_comp', label: 'Total Comp', type: 'number' as const },
  { key: 'base', label: 'Base Salary', type: 'number' as const },
  { key: 'match_403b', label: '403B Match', type: 'number' as const },
  { key: 'cell_phone', label: 'Cell Phone', type: 'number' as const },
  { key: 'insurance_fica', label: 'Insurance & FICA', type: 'number' as const },
  { key: 'housing', label: 'Housing', type: 'number' as const },
]

export default async function LaborPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('labor').select('*').order('functional_dept')

  return (
    <div className="max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Labor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Staff compensation and monthly payroll. Click ✎ to edit a row, click a monthly cell to edit the amount.
        </p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <EditableBudgetTable
          table="labor"
          columns={COLUMNS}
          initialRows={rows || []}
          editFields={EDIT_FIELDS}
          deptKey="functional_dept"
        />
      </div>
    </div>
  )
}
