# Hono Sandbox - AI Coding Agent Instructions

## Project Overview

This is a Hono web application with Better Auth authentication, using JSX for server-side rendering on Node.js. Features single-file architecture with integrated authentication, database persistence via Prisma, and comprehensive user management.

## Essential Patterns

### 1. Authentication-First Architecture

All routes include authentication context via middleware in `src/index.tsx`:

-   **Context Variables**: `user` and `session` set by auth middleware on every request
-   **Protected Routes**: Access user via `c.get('user')` in route handlers
-   **Auth State**: Pass user to Layout component for conditional UI rendering

```tsx
// Authentication middleware sets context
app.use('*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    c.set('user', session?.user || null);
    c.set('session', session?.session || null);
    return next();
});

// Routes access auth state
app.get('/', (c) => {
    const user = c.get('user');
    return c.html(<Layout user={user}>...</Layout>);
});
```

### 2. Better Auth Integration Pattern

-   **Auth Handler**: Mounted at `/api/auth/*` with CORS configuration
-   **Auth Config**: Located in `utils/auth.ts` with Prisma adapter and email/password provider
-   **Database**: SQLite via Prisma with Better Auth schema in `prisma/schema.prisma`
-   **Client Output**: Prisma client generated to `src/generated/prisma`

### 3. Single-File Component Architecture

All components, routes, and server setup remain in `src/index.tsx`:

-   Components pass `user` prop for authentication-aware UI
-   Header component shows conditional sign-in/sign-out based on auth state
-   Layout component accepts `user` prop alongside `PropsWithChildren`

## Development Workflow

**Critical**: Use these exact commands for proper development flow:

```bash
npm run dev    # Development with hot reload (tsx watch src/index.tsx)
npm run build  # TypeScript compilation - ALWAYS run before commits
npm start      # Run compiled production build from dist/
```

**Database Commands**:

```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma migrate dev # Apply database migrations
npx prisma studio     # Visual database browser
```

**Key Points**:

-   Development server auto-reloads on file changes via `tsx watch`
-   Port 3000 is hardcoded in `src/index.tsx` (line ~207)
-   Prisma client generates to `src/generated/prisma` (not default location)
-   SQLite database file: `prisma/dev.db`

## Critical TypeScript & Auth Setup

-   **JSX**: `"jsxImportSource": "hono/jsx"` (NOT React)
-   **Auth Types**: Hono app includes Variables type for user/session context
-   **Prisma Client**: Custom output path in schema.prisma affects imports
-   **CORS**: Required for Better Auth API routes with credentials support

## Authentication Patterns

### Adding Protected Routes

```tsx
app.get('/protected', (c) => {
    const user = c.get('user');
    if (!user) return c.redirect('/signin');

    return c.html(<Layout user={user}>Protected content</Layout>);
});
```

### Auth Forms Pattern

Forms POST directly to Better Auth endpoints:

-   Sign up: `action="/api/auth/sign-up/email"`
-   Sign in: `action="/api/auth/sign-in/email"`
-   Sign out: Custom route at `/signout` calls `auth.api.signOut()`

## Critical Instructions

### Before Any Commits

1. **ALWAYS run `npm run build`** to verify TypeScript compilation
2. **Run `npx prisma generate`** after any schema changes
3. Test auth flows manually at `http://localhost:3000`
4. Verify JSX import source is `"hono/jsx"` not React

### Common Pitfalls

-   Don't use React patterns - this is Hono JSX (server-side only)
-   Remember to pass `user` prop to Layout component in all routes
-   Prisma client import path is custom: `../src/generated/prisma`
-   Auth middleware must run before routes that access user context

### Common Pitfalls

-   Don't use React patterns - this is Hono JSX (server-side only)
-   Don't separate components into files unless absolutely necessary
-   Don't forget to wrap route content in `<Layout>` component
-   Port 3000 is hardcoded - change in `src/index.tsx` if needed
