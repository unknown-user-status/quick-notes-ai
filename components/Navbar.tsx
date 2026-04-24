'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LogOut, Notebook, MessageSquare, LogIn } from 'lucide-react';

import { useAuth } from '@/lib/auth';

const links = [
  { href: '/todos', label: 'My Notes', Icon: Notebook, protected: true },
  { href: '/wall', label: 'Wall', Icon: MessageSquare, protected: false }
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-border">
      <div className="container-pad flex items-center justify-between py-3">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-gradient">quick-notes-ai</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, Icon, protected: needsAuth }) => {
            if (needsAuth && !user) return null;
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition',
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}

          {loading ? null : user ? (
            <button
              type="button"
              onClick={logout}
              className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-sm transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-sm transition hover:bg-muted"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
