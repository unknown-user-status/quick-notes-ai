'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ID } from 'appwrite';

import { account } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) {
        await account.create(ID.unique(), email, password, name || email.split('@')[0]);
      }
      await account.createEmailPasswordSession(email, password);
      await refresh();
      router.push('/todos');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-center text-2xl font-semibold tracking-tight">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        {isSignup
          ? 'Sign up to save your private notes.'
          : 'Log in to access your private notes.'}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        {isSignup ? (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Display name</label>
            <input
              type="text"
              className="input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>
        ) : null}

        <div>
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            required
            className="input mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting
            ? isSignup
              ? 'Creating account…'
              : 'Logging in…'
            : isSignup
              ? 'Sign up'
              : 'Log in'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            No account yet?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
