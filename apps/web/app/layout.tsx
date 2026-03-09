import { ClerkProvider } from '@clerk/nextjs';
import NavBar from './nav-bar';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}