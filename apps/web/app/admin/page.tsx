import { auth } from '@clerk/nextjs/server';
import AdminManageClient from './admin-manage-client';

export default async function AdminPage() {
  const { sessionClaims } = await auth();
  const meta = sessionClaims?.publicMetadata as
    | { role?: string; userId?: string }
    | undefined;
  const role = meta?.role ?? null;
  const currentUserId = meta?.userId ?? null;

  if (role !== 'MANAGER') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Manager permissions are required to access admin settings.
        </p>
      </main>
    );
  }

  return <AdminManageClient currentUserId={currentUserId} />;
}
