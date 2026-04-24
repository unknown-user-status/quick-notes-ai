# quick-notes-ai

Private notes + public realtime wall, powered by **Appwrite**.

- **My Notes** — private todo list (login required)
- **Public Wall** — realtime guestbook (no login required to read; login or anonymous to post)

## Setup

### 1. Appwrite Cloud

1. Sign up at https://cloud.appwrite.io (free tier is plenty)
2. Create a **Project** (copy the Project ID)
3. In the project, go to **Databases** → **Create Database** (copy the Database ID)
4. Create two collections inside the database:

#### Collection: `todos`

| Attribute | Type | Size/Length |
|------------|------|-------------|
| `title`    | string | 255 |
| `done`     | boolean | — |
| `userId`   | string | 255 |

Permissions → toggle **Document Security** (or set at collection level):
- `users` — Create, Read, Update, Delete (for the authenticated user's own docs)

#### Collection: `wall`

| Attribute | Type | Size/Length |
|------------|------|-------------|
| `message`  | string | 500 |
| `author`   | string | 255 |

Permissions:
- `Any` — Create, Read (so anyone can post/read)

5. Go to **Auth** → enable **Email/Password** (and optionally OAuth providers)

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in values:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID=your-todos-collection-id
NEXT_PUBLIC_APPWRITE_WALL_COLLECTION_ID=your-wall-collection-id
```

### 3. Deploy

```bash
npm install
npm run build
```

Static export outputs to `out/`, deployed via `wrangler.jsonc` to Cloudflare.

## GitHub + Cloudflare auto-deploy

1. Push this repo to GitHub
2. In Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick this repo
3. Set build command: `npm run build`
4. Set output directory: `out`
5. Add env vars (same as `.env.local`) in dashboard under **Environment variables**
6. Save & Deploy

Every `git push` to `master` auto-deploys.
