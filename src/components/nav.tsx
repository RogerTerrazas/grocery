'use client'

import { CalendarDays, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/groceries',
    label: 'Groceries',
    icon: ShoppingCart,
  },
  {
    href: '/recipes',
    label: 'Recipes',
    icon: UtensilsCrossed,
  },
  {
    href: '/planning',
    label: 'Planning',
    icon: CalendarDays,
  },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:static md:border-t-0 md:border-r md:h-full">
      {/* Mobile bottom nav */}
      <div className="flex md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn('h-5 w-5', isActive && 'text-primary')}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:gap-1 md:p-4">
        <div className="mb-4 px-2 py-3">
          <h1 className="text-xl font-bold tracking-tight">🛒 Grocery</h1>
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
