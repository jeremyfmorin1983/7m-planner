'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { MONTHS, MONTH_LABELS, Month } from '@/lib/types'

interface Props {
  budgetByMonth: Record<string, number>
  actualsByMonth: Record<string, number>
  givingByMonth: Record<string, number>
}

export default function BudgetVsActualChart({ budgetByMonth, actualsByMonth, givingByMonth }: Props) {
  const data = MONTHS.map(m => ({
    month: MONTH_LABELS[m as Month],
    Budget: budgetByMonth[m] || 0,
    Actual: actualsByMonth[m] || 0,
    Giving: givingByMonth[m] || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={52} />
        <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Budget" fill="#93c5fd" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Actual" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Giving" fill="#16a34a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
