'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dispatch', label: 'Dispatch' },
  { href: '/backlog', label: 'Backlog' },
  { href: '/reports/summ', label: 'Reports' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role ?? null;

  // Clerk middleware protects all non-public routes, so any user rendering this
  // page is authenticated. The nav shell and Sign Out button render unconditionally.
  // Admin links remain gated on role (gracefully undefined during hydration).
  const navItems =
    role === 'MANAGER'
      ? [...NAV_ITEMS, { href: '/admin', label: 'Admin' }]
      : NAV_ITEMS;

  return (
    <nav className="min-h-[64px] border-b border-brand-green/20 bg-brand-charcoal shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <Link href="/dispatch" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Iron Tree Service"
            width={160}
            height={48}
            className="h-auto w-[160px] rounded"
          />
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-brand-green/15 text-white'
                    : 'text-slate-400 hover:bg-brand-charcoal-light hover:text-white'
                }`}
              >
                {item.label}
                {active ? (
                  <span className="absolute inset-x-1 -bottom-2.5 h-0.5 rounded-full bg-brand-green" />
                ) : null}
              </Link>
            );
          })}
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              aria-label="Sign out of your account"
              className="ml-4 rounded-md border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:border-slate-400 hover:text-white"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </nav>
  );
}
