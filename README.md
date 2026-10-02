# The Mountain Chapters

A Himalayan travel agency website built with **Next.js 16** (App Router, Turbopack) and **Supabase** (Auth, Postgres, Storage). Features curated destinations, stays, road trips, travel stories, a photo gallery, newsletter, contact form, and a full admin dashboard.

---

## Architecture

```
the-mountain-chapters/
├── app/
│   ├── (site)/              # Public-facing pages (route group, no URL prefix)
│   │   ├── about/           # About page
│   │   ├── contact/         # Contact form page
│   │   ├── destinations/    # Destinations list + [slug] detail
│   │   ├── experiences/     # Experiences list
│   │   ├── gallery/         # Photo gallery with lightbox
│   │   ├── login/           # User sign-in
│   │   ├── road-trips/      # Road trip chapters + [slug] detail
│   │   ├── signup/          # User registration
│   │   ├── stays/           # Stays list + [slug] detail
│   │   ├── stories/         # Travel stories + [slug] detail + new/
│   │   └── layout.tsx       # Navbar + Footer wrapper
│   ├── admin/               # Admin dashboard (auth-guarded)
│   │   ├── (dashboard)/     # All admin pages (wrapped by auth guard)
│   │   ├── login/           # Admin login page
│   │   └── layout.tsx       # Pass-through (login not guarded)
│   ├── error.tsx            # Global error boundary
│   ├── loading.tsx          # Home page loading skeleton
│   ├── not-found.tsx        # Custom 404 page
│   ├── robots.ts            # robots.txt
│   ├── sitemap.ts           # sitemap.xml
│   ├── globals.css          # Tailwind v4 + theme tokens
│   ├── layout.tsx           # Root layout (fonts, metadata)
│   └── page.tsx             # Home page
├── components/
│   ├── admin/               # Admin forms, nav, delete button
│   └── site/                # Navbar, footer, cards, forms, lightbox
├── lib/
│   ├── actions/             # Server Actions (auth, CRUD, forms)
│   ├── data/                # Data fetchers (server-side Supabase queries)
│   ├── storage/             # Image upload to Supabase Storage
│   ├── supabase/            # Supabase clients (browser, server, admin, proxy)
│   └── types/               # TypeScript types matching DB schema
├── supabase/
│   ├── schema.sql           # Tables, RLS, triggers, storage buckets
│   └── seed.sql             # Sample data
├── proxy.ts                 # Middleware (session refresh + admin guard)
├── next.config.ts           # Image optimization config
└── .env.local               # Environment variables (gitignored)
```

### Data flow

1. **Request** → `proxy.ts` (middleware) refreshes the Supabase session and guards `/admin/*` routes
2. **Server Component** → calls `lib/data/content.ts` fetchers → `lib/supabase/server.ts` client → Supabase Postgres (RLS-enforced)
3. **User action** (form submit) → Server Action in `lib/actions/` → Supabase insert/update/delete → `revalidatePath()` → page re-renders
4. **Admin action** → same flow, but RLS policies check `public.is_admin()` (which checks `profiles.role = 'admin'`)

### Auth flow

1. User signs up at `/signup` → Supabase Auth creates account → DB trigger `handle_new_user` creates a `profiles` row with `role = 'user'`
2. User signs in at `/login` → Supabase Auth sets session cookies
3. Admin promotion: manually set `profiles.role = 'admin'` in SQL Editor
4. Admin signs in at `/admin/login` → checks role is `admin` → redirects to `/admin`
5. Every `/admin/*` request is guarded by both the proxy and the dashboard layout (double check)

### Supabase clients

| Client | File | Use case |
|--------|------|----------|
| Browser | `lib/supabase/client.ts` | Client Components (not currently used) |
| Server | `lib/supabase/server.ts` | Server Components & Server Actions (RLS-enforced) |
| Admin | `lib/supabase/admin.ts` | Service-role key, bypasses RLS (server-only, user deletion) |
| Proxy | `lib/supabase/proxy.ts` | Middleware session refresh + admin guard |

---

## Production Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/schema.sql` (creates tables, RLS, triggers, storage buckets)
3. Run `supabase/seed.sql` (sample destinations, stays, experiences, road trips, gallery, routes)
4. Copy your project URL and keys from **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SECRET_KEY`

### 2. Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

### 3. Create an admin account

1. Go to `http://localhost:3000/signup`
2. Fill in your name, phone, email, and password
3. If email confirmation is enabled, check your email and confirm
4. In the Supabase **SQL Editor**, run:
   ```sql
   update public.profiles set role = 'admin' where id = (
     select id from auth.users where email = 'your-email@example.com'
   );
   ```
5. Go to `http://localhost:3000/admin/login` and sign in

### 4. Image hosts

`next.config.ts` allow-lists `images.unsplash.com` and your Supabase storage domain. If you use image URLs from another host in admin forms, add the hostname to `images.remotePatterns`:

```ts
{ protocol: "https", hostname: "your-other-host.com" },
```

### 5. Deploy

```bash
npm run build   # verify production build
```

Deploy to Vercel:
1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the 3 environment variables in Vercel project settings
4. Deploy

---

## Admin Dashboard Guide

The admin dashboard is at `/admin` (requires an admin account). Here's how to use every section:

### Dashboard (`/admin`)

Shows a count overview of all content. Click any card to jump to that section.

---

### Destinations (`/admin/destinations`)

**What it does:** Manage the places you offer (Narkanda, Spiti, etc.)

1. Click **+ New Destination**
2. Fill in:
   - **Name** — e.g. "Narkanda"
   - **Slug** — URL-friendly version, e.g. "narkanda" (no spaces, lowercase)
   - **State** — defaults to "Himachal Pradesh"
   - **Tagline** — short one-liner shown on cards
   - **Description** — full description shown on the detail page
   - **Cover Image** — upload a file (max 3MB) OR paste a URL
   - **Sort Order** — lower numbers appear first
   - **Show in Popular Destinations** — checkbox; if checked, appears on the home page
3. Click **Create Destination**
4. To edit: click **Edit** on any row
5. To delete: click **Delete** (confirms before deleting)

> Deleting a destination does NOT delete its stays — it sets their `destination_id` to null.

---

### Stays (`/admin/stays`)

**What it does:** Manage homestays, cottages, and boutique properties.

1. Click **+ New Stay**
2. Fill in:
   - **Name** — e.g. "The Morel House"
   - **Slug** — e.g. "the-morel-house"
   - **Destination** — select from dropdown (links stay to a destination)
   - **Address** — physical location
   - **Description** — full description
   - **Cover Image** — upload or URL (shown as the main image)
   - **Gallery Images** — upload multiple files OR paste comma-separated URLs
   - **Amenities** — comma-separated, e.g. "WiFi, Bonfire, Mountain View"
   - **Price / night** — in INR (e.g. 4500)
   - **Rating** — 0 to 5 (e.g. 4.9)
   - **Review Count** — number of reviews (e.g. 120)
   - **Show in Featured Stays** — checkbox; if checked, appears on the home page
3. Click **Create Stay**

> The gallery images appear on the stay detail page with a lightbox (click to enlarge).

---

### Experiences (`/admin/experiences`)

**What it does:** Manage things to do (trekking, camping, etc.)

1. Click **+ New Experience**
2. Fill in:
   - **Title** — e.g. "Trekking & Hiking"
   - **Slug** — e.g. "trekking-hiking"
   - **Icon** — an emoji, e.g. "🥾"
   - **Description** — what the experience involves
   - **Cover Image** — upload or URL
   - **Sort Order** — lower numbers appear first
3. Click **Create Experience**

---

### Road Trips (`/admin/road-trips`)

**What it does:** Manage road trip chapters (sequential scenic routes).

1. Click **+ New Chapter**
2. Fill in:
   - **Title** — e.g. "Weekend Escape"
   - **Slug** — e.g. "weekend-escape"
   - **Step Number** — order in the series (1, 2, 3...)
   - **Description** — what this leg of the journey involves
   - **Cover Image** — upload or URL
   - **Distance (km)** — total distance
   - **Duration (days)** — how many days
   - **Route Stops** — comma-separated, e.g. "Chandigarh, Shimla, Narkanda"
3. Click **Create Chapter**

> Route stops appear as a vertical timeline on the detail page.

---

### Stories (`/admin/stories`)

**What it does:** Moderate travel stories submitted by users.

- **Approve** — makes the story public on `/stories` (green button)
- **Reject** — hides the story (amber button)
- **Delete** — permanently removes the story

> Stories are submitted by signed-in users at `/stories/new` with status "pending". They only appear publicly after you approve them.

---

### Gallery (`/admin/gallery`)

**What it does:** Manage the photo gallery.

1. Click **+ New Image**
2. Fill in:
   - **Image** — upload a file (max 3MB) OR paste a URL
   - **Caption** — short description shown on hover
   - **Category** — e.g. "Landscapes", "Villages", "Stays"
   - **Sort Order** — lower numbers appear first
3. Click **Add Image**

> Gallery images appear in a masonry layout with a lightbox (click to enlarge).

---

### Map Routes (`/admin/routes`)

**What it does:** Manage the "Map Your Chapter" routes shown on the home page.

1. Click **+ New Route**
2. Fill in:
   - **Route Name** — e.g. "Classic Kinnaur-Spiti Circuit"
   - **Description** — what the route covers
   - **Stops** — comma-separated, e.g. "Chandigarh, Shimla, Narkanda, Sangla, Kaza"
   - **Sort Order** — lower numbers appear first
3. Click **Create Route**

> Route stops appear as a styled path with arrows on the home page.

---

### Messages (`/admin/messages`)

**What it does:** View contact form submissions from the website.

- **Mark as Read** — changes status from "new" to "read"
- **Archive** — moves to archived (keeps the message, hides from default view)
- **Delete** — permanently removes the message

> Messages are submitted by visitors at `/contact`.

---

### Subscribers (`/admin/subscribers`)

**What it does:** View and manage newsletter subscribers.

- **Delete** — removes a subscriber

> Subscribers sign up via the newsletter form on the home page.

---

### Users (`/admin/users`)

**What it does:** Manage registered users and admin roles.

- **Role dropdown** — change a user between "User" and "Admin", then click **Save**
- **Delete** — permanently deletes the user account (cascades to their profile)

> Deleting a user also deletes their auth account and profile. This cannot be undone.

---

## Development

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint
```

## Tech stack

- **Next.js 16** (App Router, Turbopack, Server Components, Server Actions)
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Tailwind CSS v4** (theme tokens, no config file)
- **TypeScript** (strict types matching DB schema)
