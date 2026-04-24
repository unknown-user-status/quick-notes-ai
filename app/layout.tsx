import type { Metadata } from 'next';

import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'quick-notes-ai',
  description: 'Private notes + public wall, powered by Appwrite.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <Navbar />
          <main className="container-pad py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
