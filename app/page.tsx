import Link from 'next/link';
import { MessageSquare, Notebook } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Your <span className="text-gradient">private notes</span> & a{' '}
          <span className="text-gradient">public wall</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Sign up to save your own todos. Anyone can drop a message on the public wall —
          in realtime.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/todos"
          className="card group transition hover:border-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border p-2">
              <Notebook className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">My Notes</div>
              <div className="text-sm text-muted-foreground">
                Private todo list — login required
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/wall"
          className="card group transition hover:border-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border p-2">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Public Wall</div>
              <div className="text-sm text-muted-foreground">
                Realtime guestbook — no login needed to read
              </div>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
