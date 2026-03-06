import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

type SignInPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SignInPage(props: SignInPageProps) {
  const params = (await props.searchParams) ?? {};

  async function googleSignInAction() {
    'use server';
    try {
      await signIn('google', { redirectTo: '/dispatch' });
    } catch {
      redirect('/sign-in?error=1');
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Iron Tree Service</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to access scheduling tools.</p>
        {params.error ? (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Sign-in failed. Only @irontreeservice.com accounts are permitted.
          </p>
        ) : null}
        <form action={googleSignInAction} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  );
}
