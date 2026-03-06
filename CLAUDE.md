# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hono API boilerplate with Better Auth authentication and Polar payment integration, using JSX for server-side rendering on Bun. Features single-file architecture with integrated authentication, PostgreSQL persistence via Prisma, subscription billing via Polar, and API route gating. Designed to deploy on Railway.

## Essential Commands

**Development**:

```bash
bun run dev    # Development with hot reload (bun run --watch src/index.tsx)
bun run build  # TypeScript compilation - ALWAYS run before commits
bun run start  # Run production build (bun run src/index.tsx)
bun run db:migrate  # Run Prisma migrations
bun run db:push     # Push schema without migration files
bun run db:studio   # Visual database browser
```

**Database**:

```bash
bunx prisma generate    # Generate Prisma client after schema changes
bunx prisma migrate dev # Apply database migrations
bunx prisma studio     # Visual database browser
```

## Architecture Overview

### Single-File Authentication-First Design

All components, routes, and server setup live in `src/index.tsx` with authentication context available to every route via middleware:

- **Auth Middleware**: Sets `user` and `session` on Hono context for all requests
- **Protected Routes**: Access user via `c.get('user')` in route handlers
- **Auth-Aware UI**: Components receive `user` prop for conditional rendering

### Better Auth Integration

- **Auth Handler**: Mounted at `/api/auth/*` with CORS configuration for credentials
- **Auth Config**: `utils/auth.ts` uses Prisma adapter with SQLite and email/password provider
- **Database Schema**: Prisma schema in `prisma/schema.prisma` with Better Auth models
- **Custom Client Path**: Prisma generates to `src/generated/prisma` (not default location)

### Polar Payment Integration

- **Plugin**: `@polar-sh/better-auth` integrates Polar into Better Auth's plugin system
- **Checkout**: Form POST to `/api/auth/checkout` with product slug triggers Polar checkout
- **Portal**: `/api/auth/customer/portal` redirects to Polar customer portal for subscription management
- **Customer State**: `/api/auth/customer/state` returns subscription/benefit status
- **Webhooks**: Auto-registered at `/api/auth/polar/webhooks` with signature verification
- **Auto Customer Creation**: New users get a Polar customer record on signup
- **Subscription Middleware**: `requireSubscription` checks active subscription before granting route access
- **Environment**: Uses `POLAR_SERVER=sandbox` for development, `production` for live

## Critical Patterns

### Authentication Context Pattern

```tsx
// Every route follows this pattern
app.get('/route', (c) => {
    const user = c.get('user');
    return c.html(<Layout user={user}>Content</Layout>);
});
```

### Auth Forms Pattern

Forms POST directly to Better Auth endpoints:

- Sign up: `action="/api/auth/sign-up/email"`
- Sign in: `action="/api/auth/sign-in/email"`
- Sign out: Custom `/signout` route calls `auth.api.signOut()`

### Protected Route Pattern

```tsx
app.get('/protected', (c) => {
    const user = c.get('user');
    if (!user) return c.redirect('/signin');
    return c.html(<Layout user={user}>Protected content</Layout>);
});
```

### Subscription-Gated Route Pattern

```tsx
// requireSubscription checks for active Polar subscription, redirects to /pricing if none
app.get('/premium', requireSubscription, (c) => {
    const user = c.get('user');
    return c.html(<Layout user={user}>Premium content</Layout>);
});
```

### Polar Checkout Pattern

```tsx
// Form POST with product slug triggers Polar checkout redirect
<form action="/api/auth/checkout" method="post">
    <input type="hidden" name="slug" value="pro" />
    <button type="submit">Subscribe</button>
</form>
```

## TypeScript Configuration

- **JSX Source**: Uses `"hono/jsx"` NOT React
- **Module System**: ESNext with bundler resolution for relative imports
- **Custom Prisma Import**: `../src/generated/prisma` due to custom output path
- **Context Types**: Hono app includes Variables type for `user`/`session`

## Critical Development Notes

- Port defaults to 3000 but is configurable via `PORT` env var (Railway sets this automatically)
- Uses Bun's native server via `export default { port, fetch }` pattern — no `@hono/node-server` needed
- PostgreSQL database via `DATABASE_URL` env var (Railway provides this)
- All components must receive and pass `user` prop to Layout
- Auth middleware must run before routes that access user context
- Prisma client regeneration required after schema changes
- CORS configured specifically for Better Auth with credentials support
- Polar webhook handlers must be `async` functions (return `Promise<void>`)
- Polar product IDs come from the Polar dashboard, stored in `POLAR_PRODUCT_ID` env var
- `requireSubscription` middleware fetches customer state from `/api/auth/customer/state` to check subscription status
- `BASE_URL` is derived from `BETTER_AUTH_URL` env var — no hardcoded localhost URLs
- `.env.example` documents all required environment variables
