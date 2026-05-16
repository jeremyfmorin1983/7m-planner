'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { MONTHS, MONTH_LABELS, Month } from '@/lib/types'

interface Props {
  data: Record<string, unknown>[]
}

export default function MonthlyChart({ data }: Props) {
  const chartData = MONTHS.map(m => ({
    month: MONTH_LABELS[m as Month],
    total: data.reduce((sum, row) => sum + ((row[m] as number) || 0), 0),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={52} />
        <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Total']} />
        <Bar dataKey="total" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
