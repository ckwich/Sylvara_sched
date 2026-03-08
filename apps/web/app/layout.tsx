import NavBar from './nav-bar';
import './globals.css';
import { auth } from '@/auth';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role ?? null;

  return (
    <html lang="en">
      <body>
        <NavBar role={role} />
        {children}
      </body>
    </html>
  );
}
