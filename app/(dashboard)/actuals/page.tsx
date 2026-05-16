import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActualsForm from './ActualsForm'

export default async function ActualsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_admin) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900">Actuals</h1>
        <p className="mt-4 text-sm text-gray-500">Only admins can enter actuals.</p>
      </div>
    )
  }

  const year = new Date().getFullYear()

  const [{ data: giving }, { data: actuals }] = await Promise.all([
    supabase.from('giving').select('*').eq('year', year).order('month'),
    supabase.from('actuals_spend').select('*').eq('year', year).order('month'),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Actuals</h1>
        <p className="text-sm text-gray-500 mt-1">Enter monthly giving and actual spend for {year}</p>
      </div>
      <ActualsForm year={year} givingRows={giving || []} actualsRows={actuals || []} />
    </div>
  )
}
