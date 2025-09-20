# Hono Sandbox AGENTS.md

## Project Overview

This is a Hono web application demonstrating JSX server-side rendering with Node.js. The app uses component-based layouts and showcases Hono's JSX capabilities with Pico CSS for styling.

## Dev Environment Tips

- Use `npm run dev` to start development with hot reload using `tsx watch`
- The app runs on `http://localhost:3000` by default
- All components and routes are defined in `src/index.tsx` for simplicity
- Uses Pico CSS via CDN for styling - no build step required for CSS
- TypeScript compilation outputs to `dist/` directory
- JSX is configured with `"jsxImportSource": "hono/jsx"` in tsconfig.json

## Development Workflow

- **Development**: `npm run dev` (uses `tsx watch src/index.tsx` for auto-reload)
- **Build**: `npm run build` (compiles TypeScript to `dist/`)
- **Production**: `npm start` (runs compiled JavaScript from `dist/index.js`)
- **Install dependencies**: `npm install`

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
- Use semantic HTML with Pico CSS classes (`class="container"`)

## Testing Instructions

- No testing framework currently configured
- To add tests, consider installing Vitest: `npm install -D vitest @vitest/ui`
- For JSX testing, you may need `@testing-library/react` equivalent for Hono JSX
- Before committing, always run `npm run build` to ensure TypeScript compilation passes
- Test manually by running `npm run dev` and checking routes at `http://localhost:3000`

## Code Quality Checks

- **TypeScript**: Run `npm run build` to check for type errors
- **Runtime**: Test with `npm run dev` and verify all routes work
- **Production build**: Test with `npm run build && npm start`
- No linting currently configured - consider adding ESLint for code consistency

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

- Leverage Pico CSS utility classes and semantic HTML
- Add custom CSS via `<style>` tags in `Head` component if needed
- Pico CSS provides automatic styling for semantic HTML elements

## Architecture Notes

- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Server**: Uses `@hono/node-server` adapter for Node.js compatibility
- **JSX**: Server-side rendering with Hono's JSX implementation
- **Styling**: Pico CSS framework via CDN
- **Build**: TypeScript compilation, no bundling step required

## Troubleshooting

### Development Issues

- Check TypeScript compilation errors with `npm run build`
- Verify JSX import source in `tsconfig.json` is set to `"hono/jsx"`
- Ensure proper Hono JSX syntax: `c.html(<Component />)`

### Runtime Issues

- Verify Node.js compatibility with `@hono/node-server`
- Check port 3000 availability
- Validate JSX component syntax and imports
- Check console for server startup messages

## PR Instructions

- Title format: `[hono-sandbox] <Description>`
- Always run `npm run build` before committing to ensure compilation passes
- Test routes manually at `http://localhost:3000`
- Verify TypeScript types are correct
- Follow JSX patterns established in the codebase
- Keep components in `src/index.tsx` unless project grows significantly
