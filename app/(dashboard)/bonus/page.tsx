import { createClient } from '@/lib/supabase/server'
import BonusCalculator from './BonusCalculator'

export default async function BonusPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('bonus_config').select('*').single()
  const { data: labor } = await supabase
    .from('labor')
    .select('name, role, functional_dept, total_comp')
    .neq('role', 'Bonus')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonus Calculator</h1>
        <p className="text-sm text-gray-500 mt-1">Enter actual revenue to see bonus tier and funded amounts</p>
      </div>
      <BonusCalculator config={config} staffRows={labor || []} />
    </div>
  )
}
