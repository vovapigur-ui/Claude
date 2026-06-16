'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: 'Today', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Briefcase },
  { href: '/sphere', label: 'Sphere', icon: Users },
  { href: '/profile', label: 'Profile', icon: UserCog },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-[428px] mx-auto flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200 active:scale-95',
                active ? 'text-yellow-400' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span
                className={cn(
                  'text-[10px] uppercase tracking-widest font-mono',
                  active ? 'text-yellow-400' : 'text-zinc-600'
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
