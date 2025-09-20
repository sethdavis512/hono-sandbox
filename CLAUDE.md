# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hono web application with Better Auth authentication, using JSX for server-side rendering on Node.js. Features single-file architecture with integrated authentication, database persistence via Prisma, and comprehensive user management.

## Essential Commands

**Development**:
```bash
npm run dev    # Development with hot reload (tsx watch src/index.tsx)
npm run build  # TypeScript compilation - ALWAYS run before commits
npm start      # Run compiled production build from dist/
```

**Database**:
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma migrate dev # Apply database migrations
npx prisma studio     # Visual database browser
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

## TypeScript Configuration

- **JSX Source**: Uses `"hono/jsx"` NOT React
- **Module System**: ESNext with bundler resolution for relative imports
- **Custom Prisma Import**: `../src/generated/prisma` due to custom output path
- **Context Types**: Hono app includes Variables type for `user`/`session`

## Critical Development Notes

- Port 3000 is hardcoded in `src/index.tsx` (serve function)
- SQLite database file: `dev.db` in project root
- All components must receive and pass `user` prop to Layout
- Auth middleware must run before routes that access user context
- Prisma client regeneration required after schema changes
- CORS configured specifically for Better Auth with credentials support