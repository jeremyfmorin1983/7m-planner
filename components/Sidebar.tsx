'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',          icon: '⊞' },
  { href: '/labor',     label: 'Labor',               icon: '👥' },
  { href: '/contracts', label: 'Contracts',           icon: '📄' },
  { href: '/assets',    label: 'Assets',              icon: '📦' },
  { href: '/other',     label: 'Other',               icon: '⋯' },
  { href: '/actuals',   label: 'Actuals',             icon: '✓' },
  { href: '/bonus',     label: 'Bonus Calculator',    icon: '★' },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (collapsed) {
    return (
      <aside className="w-12 flex flex-col bg-blue-900 text-white items-center py-3 gap-1 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="text-blue-300 hover:text-white transition-colors mb-2 text-lg leading-none"
          title="Expand sidebar"
        >
          ›
        </button>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
                active ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {icon}
            </Link>
          )
        })}
      </aside>
    )
  }

  return (
    <aside className="w-56 flex flex-col bg-blue-900 text-white shrink-0">
      <div className="px-5 py-5 border-b border-blue-800 flex items-start justify-between">
        <div>
          <div className="font-bold text-lg leading-tight">7M Planner</div>
          <div className="text-blue-300 text-xs mt-0.5 truncate max-w-[140px]">
            {profile?.full_name || profile?.email || 'User'}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {profile?.department && (
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5">
                {profile.department}
              </span>
            )}
            {profile?.is_admin && (
              <span className="text-xs bg-yellow-500 text-yellow-900 rounded px-2 py-0.5">
                Admin
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-blue-300 hover:text-white transition-colors text-lg leading-none mt-0.5 shrink-0"
          title="Collapse sidebar"
        >
          ‹
        </button>
      </div>
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-blue-800">
        <button
          onClick={signOut}
          className="w-full text-left text-xs text-blue-300 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
