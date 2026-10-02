<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project-specific notes

### Commands
- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build (verify before committing)
- `npm run lint` — ESLint (0 errors expected; 6 pre-existing `<img>` warnings in admin forms are acceptable)
- `npx tsc --noEmit` — type check only
- `npm test` — Vitest unit + component tests (`tests/`); `npm run test:watch` while developing

### Supabase
- Project URL: `wyxzrhpbsptpeyhjlvie.supabase.co`
- Migrations live in `supabase/migrations/`; DB/RLS tests in `supabase/tests/stay_builder.test.sql` (single transaction, always rolls back — safe to run against production via SQL Editor or the Supabase MCP `execute_sql`).
- All data fetchers in `lib/data/content.ts` are wrapped in `safeQuery()` to handle network failures gracefully (returns empty data instead of hanging).
- The proxy (`lib/supabase/proxy.ts`) wraps `getUser()` in a 3-second timeout to prevent 25s hangs when Supabase is unreachable.

### Image hosts
- `next.config.ts` allow-lists: `images.unsplash.com`, `wyxzrhpbsptpeyhjlvie.supabase.co`
- Fallback image: `/placeholder-mountain.svg` (branded SVG, exists in `public/`)
- Admin forms use native `<img>` for upload previews (acceptable; lint warnings expected)

### Admin auth
- Double-guarded: proxy checks on every request + dashboard layout checks again
- Admin role is stored in `profiles.role` (not `user_metadata`)
- `public.is_admin()` DB function checks the role

### Stays (Stay Builder)
- Relational model: `stays` → `stay_images`, `stay_amenities`, `stay_sections` (story), `stay_reviews`, `stay_faqs`, `stay_policies`, `stay_nearby_places`, `rooms` → `room_images`, `room_amenities`, `room_rate_plans`.
- Legacy `stays.images` / `amenities` / `price_per_night` / `rating` / `review_count` are kept in sync and used as fallbacks — don't drop them.
- `lib/stays/normalize.ts` turns any stay (legacy or fully built) into one `StayProfile`; `lib/stays/timeline.ts` decides the public page order. Both are unit-tested — change tests first.
- Public page `/stays/[slug]` is ISR (cookie-less `lib/supabase/public.ts`); admin saves call `revalidatePath`. Unpublished stays are admin-only via RLS; preview at `/admin/preview/stays/[id]`.
- No booking engine: "Check availability" is an enquiry to `/contact?stay=&room=`. Never show availability, invented ratings or reviews.
- RLS helper functions live in the non-exposed `private` schema.
