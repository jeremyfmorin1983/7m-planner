'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/labor',     label: 'Labor' },
  { href: '/contracts', label: 'Contracts' },
  { href: '/assets',    label: 'Assets' },
  { href: '/other',     label: 'Other' },
  { href: '/actuals',   label: 'Actuals' },
  { href: '/bonus',     label: 'Bonus Calculator' },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 flex flex-col bg-blue-900 text-white">
      <div className="px-5 py-5 border-b border-blue-800">
        <div className="font-bold text-lg leading-tight">7M Planner</div>
        <div className="text-blue-300 text-xs mt-0.5 truncate">
          {profile?.full_name || profile?.email || 'User'}
        </div>
        {profile?.department && (
          <div className="mt-1 text-xs bg-blue-700 rounded px-2 py-0.5 inline-block">
            {profile.department}
          </div>
        )}
        {profile?.is_admin && (
          <div className="mt-1 text-xs bg-yellow-500 text-yellow-900 rounded px-2 py-0.5 inline-block ml-1">
            Admin
          </div>
        )}
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
