'use client';

import Link from 'next/link';

export default function GlobalError(props: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">
        An unexpected error occurred while loading this page.
      </p>
      <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-700">{props.error.message}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={props.reset}
          className="rounded-md bg-brand-green px-3 py-2 text-sm font-medium text-white hover:bg-brand-green-dark"
        >
          Retry
        </button>
        <Link href="/dispatch" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
          Go Home
        </Link>
      </div>
    </main>
  );
}
