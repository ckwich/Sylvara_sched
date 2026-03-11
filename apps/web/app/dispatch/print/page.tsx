'use client';

import { Suspense } from 'react';
import PrintScheduleContent from './print-content';

export default function PrintSchedulePage() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <p className="text-sm text-slate-500">Loading print preview…</p>
        </main>
      }
    >
      <PrintScheduleContent />
    </Suspense>
  );
}
