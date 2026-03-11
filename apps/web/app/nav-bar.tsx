'use client';

import Image from 'next/image';
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
    <nav className="border-b border-brand-green/20 bg-brand-charcoal" style={{ minHeight: '64px' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link href="/dispatch" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Iron Tree Service"
            width={160}
            height={48}
            className="rounded"
            style={{ width: '160px', height: 'auto' }}
          />
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-green text-white'
                    : 'text-slate-300 hover:bg-brand-charcoal-light hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="ml-3 rounded-md border border-slate-500 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-brand-charcoal-light hover:text-white"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </nav>
  );
}
