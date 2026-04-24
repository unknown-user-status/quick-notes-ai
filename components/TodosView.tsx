'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ID, Permission, Query, Role } from 'appwrite';
import { Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';

import { APPWRITE, databases, isConfigured, type TodoDoc } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';

export function TodosView() {
  const { user, loading: authLoading } = useAuth();

  const [todos, setTodos] = useState<TodoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !isConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const res = await databases.listDocuments(
        APPWRITE.databaseId,
        APPWRITE.todosCollectionId,
        [Query.equal('userId', user.$id), Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      setTodos(res.documents as unknown as TodoDoc[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const value = title.trim();
    if (!value) return;
    setTitle('');
    try {
      const doc = await databases.createDocument(
        APPWRITE.databaseId,
        APPWRITE.todosCollectionId,
        ID.unique(),
        { title: value, done: false, userId: user.$id },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ]
      );
      setTodos((prev) => [doc as unknown as TodoDoc, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  }

  async function toggleTodo(todo: TodoDoc) {
    const next = !todo.done;
    setTodos((prev) => prev.map((t) => (t.$id === todo.$id ? { ...t, done: next } : t)));
    try {
      await databases.updateDocument(
        APPWRITE.databaseId,
        APPWRITE.todosCollectionId,
        todo.$id,
        { done: next }
      );
    } catch {
      setTodos((prev) =>
        prev.map((t) => (t.$id === todo.$id ? { ...t, done: todo.done } : t))
      );
    }
  }

  async function deleteTodo(todo: TodoDoc) {
    setTodos((prev) => prev.filter((t) => t.$id !== todo.$id));
    try {
      await databases.deleteDocument(
        APPWRITE.databaseId,
        APPWRITE.todosCollectionId,
        todo.$id
      );
    } catch {
      load();
    }
  }

  if (authLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="card text-center">
        <div className="text-lg font-semibold">Sign in required</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your notes are private. Log in or create an account to continue.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/login" className="btn-primary">
            Log in
          </Link>
          <Link href="/signup" className="btn-secondary">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (!isConfigured()) {
    return (
      <div className="card">
        <div className="text-lg font-semibold">Appwrite not configured</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Set NEXT_PUBLIC_APPWRITE_* env vars. See README for setup.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Notes</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.name || user.email}</span>
        </p>
      </div>

      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          className="input"
          placeholder="New note…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={!title.trim()}>
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading your notes…</div>
      ) : todos.length === 0 ? (
        <div className="card text-center text-sm text-muted-foreground">
          No notes yet. Add one above.
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.$id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTodo(t)}
                className="h-4 w-4"
              />
              <span
                className={clsx(
                  'flex-1 text-sm',
                  t.done && 'text-muted-foreground line-through'
                )}
              >
                {t.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo(t)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
