'use client';

import Link from 'next/link';
import { SignOutButton, useUser, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dispatch', label: 'Dispatch' },
  { href: '/backlog', label: 'Backlog' },
  { href: '/reports/summ', label: 'Reports' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role ?? null;

  if (!isSignedIn) return null;

  const navItems =
    role === 'MANAGER'
      ? [...NAV_ITEMS, { href: '/admin', label: 'Admin' }, { href: '/admin/import', label: 'Admin Import' }]
      : NAV_ITEMS;

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/dispatch" className="text-base font-semibold text-slate-900">
          Iron Tree Scheduling
        </Link>
        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </nav>
  );
}
