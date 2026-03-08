import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist or has moved.</p>
      <Link href="/dispatch" className="mt-4 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
        Back to Dispatch
      </Link>
    </main>
  );
}
