# Imagine Scholar Library — Setup

## What was added
- `supabase-config.js` — one shared file holding your Supabase URL/key.
- `schema.sql` — the database table + security rules, run once in Supabase.
- `Cover page.html` — the "Librarian Login" form now actually logs in.
- `Check out Book.html` — submitting the form writes a row to the `loans` table.
- `Check in.html` — submitting the form finds the matching loan and marks it returned.
- `Dashboard.html` — **new** page, only reachable once logged in, listing every loan with filters and a "Mark Returned" button.

Your original CSS/HTML was left as-is — I only added `id`s to a couple of elements I needed to hook into with JS, a couple of `<script>` tags, and one tiny "status message" line under each form for success/error feedback.

Note: `borrrow_form.html` looks like an earlier, broken duplicate of the cover page (it has a whole nested `<html>` document inside its `<body>`, and nothing else links to it) — I left it untouched. Let me know if you actually need it and I'll fold it in.

## 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's ready, go to **Project Settings → API**.
3. Copy the **Project URL** and the **anon public key**.
4. Paste them into `supabase-config.js`:
   ```js
   const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```

## 2. Create the database table
1. In Supabase, go to **SQL Editor → New query**.
2. Paste in the contents of `schema.sql` and run it.
3. This creates a `loans` table with Row Level Security so that:
   - Anyone can check a book out (insert a row) — no login needed.
   - Anyone can check a book back in — but only if they know the exact email + title of an active loan, and it can't touch already-returned rows.
   - Only a **logged-in librarian** can see the full list (the dashboard).

## 3. Create your librarian account(s)
There's no public sign-up form on purpose — only you should be able to create librarian logins.
1. In Supabase, go to **Authentication → Users → Add user**.
2. Enter an email and password for the librarian.
3. They can now log in from the cover page and land on `Dashboard.html`.

(If you ever want librarians to reset their own password, that's a Supabase Auth setting under **Authentication → Providers/Email**, but it's optional.)

## 4. Host the files
Because these are plain HTML/CSS/JS files with no build step, you can host them almost anywhere:
- Drag-and-drop the whole folder onto [Netlify Drop](https://app.netlify.com/drop)
- Or GitHub Pages, Vercel, Cloudflare Pages, etc.
- Or just open `Cover page.html` locally in a browser for testing (Supabase calls work fine from `file://`, but some browsers are stricter — a quick local static server, e.g. `npx serve`, avoids surprises).

Keep all the files in the same folder — the pages link to each other by relative filename (including the spaces in names like `Check out Book.html`), and every page loads `supabase-config.js` for its database connection.

## How it works, in short
- **Auth**: Supabase Auth (email/password). The dashboard checks `supabaseClient.auth.getSession()` on load and bounces you back to the cover page if you're not logged in. The cover page does the reverse — if you're already logged in, it skips straight to the dashboard.
- **Database**: one `loans` table. Checking out a book = insert a row. Checking in = update that row's `status` and `return_date`. The dashboard just reads all rows and renders them as a table, with a button to mark a loan returned directly from there too.
- **Security**: Row Level Security policies (in `schema.sql`) are what actually enforce all of this at the database level — even if someone bypassed the UI entirely and called the API directly, they still couldn't read the full borrower list without being logged in as a librarian.
