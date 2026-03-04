import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-slate-200 bg-white px-4 py-3">
          <Link href="/admin" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Admin
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
