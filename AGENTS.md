# Hono Sandbox AGENTS.md

## Project Overview

This is a Hono API boilerplate with Better Auth authentication, Polar payment integration, and JSX server-side rendering on Bun. Uses PostgreSQL via Prisma, deploys to Railway.

## Dev Environment Tips

- Use `bun run dev` to start development with hot reload
- The app runs on `http://localhost:3000` by default
- All components and routes are defined in `src/index.tsx` for simplicity
- Bun runs TypeScript natively — no separate compilation step for dev
- JSX is configured with `"jsxImportSource": "hono/jsx"` in tsconfig.json

## Development Workflow

- **Development**: `bun run dev` (uses `bun run --watch src/index.tsx` for auto-reload)
- **Build**: `bun run build` (TypeScript type checking via `tsc`)
- **Production**: `bun run start` (runs `bun run src/index.tsx`)
- **Install dependencies**: `bun install` (auto-runs `prisma generate` via postinstall)
- **Migrations**: `bun run db:migrate` or `bun run db:push`
- **DB Browser**: `bun run db:studio`

## Code Patterns

### JSX Components

- Use functional components without props interface for simple components
- Use `PropsWithChildren` type for layout components that wrap children
- Components should be defined before the Hono app instance
- All components currently live in `src/index.tsx`

### Route Structure

```tsx
app.get('/path', (c) =>
    c.html(
        <Layout>
            <ComponentContent />
        </Layout>
    )
);
```

### Layout Pattern

- Wrap all page content in the `<Layout>` component
- Layout includes `<Head>`, `<Header>`, `<Footer>` components
- Use semantic HTML

## Testing Instructions

- No testing framework currently configured
- To add tests, consider using Bun's built-in test runner: `bun test`
- Before committing, always run `bun run build` to ensure TypeScript compilation passes
- Test manually by running `bun run dev` and checking routes at `http://localhost:3000`

## Code Quality Checks

- **TypeScript**: Run `bun run build` to check for type errors
- **Runtime**: Test with `bun run dev` and verify all routes work
- **Production build**: Test with `bun run start`
- No linting currently configured - consider adding Biome or ESLint for code consistency

## Adding New Features

### New Routes

1. Add route definition in `src/index.tsx` after existing routes
2. Use `app.get('/path', (c) => c.html(<Layout>...</Layout>))`
3. Add navigation link in `Header` component if needed

### New Components

1. Define functional component before the Hono app instance
2. Return JSX elements using Hono JSX syntax
3. Use TypeScript types for props if needed

### Styling

- No CSS framework currently included — add your own as needed
- Add custom CSS via `<style>` tags in `Head` component if needed

## Architecture Notes

- **Runtime**: Bun with ES modules (`"type": "module"`)
- **Server**: Uses Bun's native HTTP server via `export default { port, fetch }` — no adapter needed
- **JSX**: Server-side rendering with Hono's JSX implementation
- **Styling**: None (unstyled HTML — bring your own CSS)
- **Build**: TypeScript type checking only, Bun runs TS directly

## Troubleshooting

### Development Issues

- Check TypeScript compilation errors with `bun run build`
- Verify JSX import source in `tsconfig.json` is set to `"hono/jsx"`
- Ensure proper Hono JSX syntax: `c.html(<Component />)`

### Runtime Issues

- Verify Bun is installed: `bun --version`
- Check port 3000 availability
- Validate JSX component syntax and imports
- Check console for server startup messages

## PR Instructions

- Title format: `[hono-polar-starter] <Description>`
- Always run `bun run build` before committing to ensure compilation passes
- Test routes manually at `http://localhost:3000`
- Verify TypeScript types are correct
- Follow JSX patterns established in the codebase
- Keep components in `src/index.tsx` unless project grows significantly
