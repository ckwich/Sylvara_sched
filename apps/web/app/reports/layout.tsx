'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const REPORT_TABS = [
  { href: '/reports/summ', label: 'Backlog in Dollars' },
  { href: '/reports/comparable', label: 'Year-over-Year Comparable' },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="border-b border-slate-200 bg-white px-4 pt-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <nav className="mt-3 flex gap-4">
            {REPORT_TABS.map((tab) => {
              const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-brand-green text-brand-green'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
