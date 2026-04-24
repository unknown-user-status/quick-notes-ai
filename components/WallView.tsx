'use client';

import { useCallback, useEffect, useState } from 'react';
import { ID, Permission, Query, Role } from 'appwrite';

import { APPWRITE, client, databases, isConfigured, type WallDoc } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';

export function WallView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<WallDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const res = await databases.listDocuments(
        APPWRITE.databaseId,
        APPWRITE.wallCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );
      setMessages(res.documents as unknown as WallDoc[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wall');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!isConfigured()) return;
    const channel = `databases.${APPWRITE.databaseId}.collections.${APPWRITE.wallCollectionId}.documents`;
    const unsub = client.subscribe(channel, (event) => {
      const payload = event.payload as WallDoc;
      if (event.events.some((e) => e.endsWith('.create'))) {
        setMessages((prev) => {
          if (prev.some((m) => m.$id === payload.$id)) return prev;
          return [payload, ...prev].slice(0, 50);
        });
      } else if (event.events.some((e) => e.endsWith('.delete'))) {
        setMessages((prev) => prev.filter((m) => m.$id !== payload.$id));
      }
    });
    return () => {
      unsub();
    };
  }, []);

  async function postMessage(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const author = user?.name || user?.email || authorName.trim() || 'Anonymous';
    setText('');
    try {
      await databases.createDocument(
        APPWRITE.databaseId,
        APPWRITE.wallCollectionId,
        ID.unique(),
        { message: value, author },
        [Permission.read(Role.any())]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post');
      setText(value);
    }
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
        <h1 className="text-2xl font-semibold tracking-tight">Public Wall</h1>
        <p className="text-sm text-muted-foreground">
          Realtime guestbook. Last 50 messages shown.
        </p>
      </div>

      <form onSubmit={postMessage} className="space-y-2">
        {!user ? (
          <input
            type="text"
            className="input"
            placeholder="Your name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={40}
          />
        ) : null}
        <div className="flex gap-2">
          <input
            type="text"
            className="input"
            placeholder="Leave a message for the world…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            required
          />
          <button type="submit" className="btn-primary" disabled={!text.trim()}>
            Post
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading messages…</div>
      ) : messages.length === 0 ? (
        <div className="card text-center text-sm text-muted-foreground">
          Nothing here yet. Be the first to post.
        </div>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li key={m.$id} className="card">
              <div className="text-sm">{m.message}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {m.author} · {new Date(m.$createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
