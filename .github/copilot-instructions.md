# Hono Sandbox - AI Coding Agent Instructions

## Project Overview

This is a Hono web application using JSX for server-side rendering on Node.js. It demonstrates Hono's JSX capabilities with a single-file architecture where all components and routes live in `src/index.tsx`.

## Essential Patterns

### 1. Single-File Architecture

All components, routes, and server setup are in `src/index.tsx`. This is intentional for simplicity:

-   Components defined before the Hono app instance
-   Routes use `c.html()` with JSX responses wrapped in `<Layout>`
-   No separate component files unless project grows significantly

### 2. JSX Component Pattern

```tsx
function Layout(props: PropsWithChildren) {
    return (
        <html>
            <Head />
            <body class="container">
                <Header />
                <main>{props.children}</main>
                <Footer />
            </body>
        </html>
    );
}

// Routes always wrap content in Layout
app.get('/', (c) =>
    c.html(
        <Layout>
            <h1>Content</h1>
        </Layout>
    )
);
```

### 3. Critical TypeScript Setup

-   **JSX**: `"jsxImportSource": "hono/jsx"` (NOT React)
-   **Modules**: `"type": "module"` in package.json with `"module": "NodeNext"`
-   **Import Pattern**: `import type { PropsWithChildren } from 'hono/jsx'`

## Development Workflow

**Critical**: Use these exact commands for proper development flow:

```bash
npm run dev    # Development with hot reload (tsx watch src/index.tsx)
npm run build  # TypeScript compilation - ALWAYS run before commits
npm start      # Run compiled production build from dist/
```

**Key Points**:

-   Development server auto-reloads on file changes via `tsx watch`
-   Port 3000 is hardcoded in `src/index.tsx` (line ~65)
-   Compilation outputs to `dist/` directory
-   No bundling step - just TypeScript compilation

## Styling System

Uses **Pico CSS** via CDN for automatic semantic HTML styling:

-   No build step required for CSS
-   Use `class="container"` on body for responsive layout
-   Semantic HTML gets automatic styling (nav, header, footer, etc.)
-   Custom styles go in `<Head>` component if needed

## Adding Features

### New Routes

```tsx
app.get('/new-route', (c) =>
    c.html(
        <Layout>
            <h1>New Page</h1>
        </Layout>
    )
);
```

### New Components

Define functional components before the Hono app instance. Use `PropsWithChildren` for wrapper components.

## Critical Instructions

### Before Any Commits

1. **ALWAYS run `npm run build`** to verify TypeScript compilation
2. Test routes manually at `http://localhost:3000`
3. Verify JSX import source is `"hono/jsx"` not React

### Common Pitfalls

-   Don't use React patterns - this is Hono JSX (server-side only)
-   Don't separate components into files unless absolutely necessary
-   Don't forget to wrap route content in `<Layout>` component
-   Port 3000 is hardcoded - change in `src/index.tsx` if needed
