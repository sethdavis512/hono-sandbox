import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { auth } from '../utils/auth';

import type { PropsWithChildren } from 'hono/jsx';

const app = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
    };
}>();

// CORS configuration for BetterAuth
app.use(
    '/api/auth/*',
    cors({
        origin: 'http://localhost:3000',
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
        credentials: true
    })
);

// Authentication middleware
app.use('*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
        c.set('user', null);
        c.set('session', null);
        return next();
    }

    c.set('user', session.user);
    c.set('session', session.session);
    return next();
});

// Mount BetterAuth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

function Head() {
    return (
        <head>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.jade.min.css"
            ></link>
        </head>
    );
}

function Header({ user }: { user: any }) {
    return (
        <header>
            <nav>
                <ul>
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li>
                        <a href="/about">About</a>
                    </li>
                </ul>
                <ul>
                    {user ? (
                        <>
                            <li>Welcome, {user.name || user.email}!</li>
                            <li>
                                <form action="/signout" method="post" style="display: inline;">
                                    <button type="submit">Sign Out</button>
                                </form>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <a href="/signin">Sign In</a>
                            </li>
                            <li>
                                <a href="/signup">Sign Up</a>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

function Footer() {
    return (
        <footer>
            <p>© 2025 My Website</p>
        </footer>
    );
}

function Layout(props: PropsWithChildren & { user?: any }) {
    return (
        <html>
            <Head />
            <body class="container">
                <Header user={props.user} />
                <main>{props.children}</main>
                <Footer />
            </body>
        </html>
    );
}

app.get('/', (c) => {
    const user = c.get('user');
    return c.html(
        <Layout user={user}>
            <h1>Honooo!</h1>
            {user ? <p>Welcome back, {user.name || user.email}!</p> : <p>Please sign in to get started.</p>}
        </Layout>
    );
});

app.get('/about', (c) => {
    const user = c.get('user');
    return c.html(
        <Layout user={user}>
            <h1>About and stuff</h1>
        </Layout>
    );
});

app.get('/session', (c) => {
    const session = c.get('session');
    const user = c.get('user');

    if (!user) return c.body(null, 401);

    return c.json({
        session,
        user
    });
});

// Sign-up route
app.get('/signup', (c) => {
    const user = c.get('user');
    return c.html(
        <Layout user={user}>
            <h1>Sign Up</h1>
            <form action="/api/auth/sign-up/email" method="post">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required />

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Sign Up</button>
            </form>
            <p><a href="/signin">Already have an account? Sign in</a></p>
        </Layout>
    );
});

// Sign-in route
app.get('/signin', (c) => {
    const user = c.get('user');
    return c.html(
        <Layout user={user}>
            <h1>Sign In</h1>
            <form action="/api/auth/sign-in/email" method="post">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Sign In</button>
            </form>
            <p><a href="/signup">Don't have an account? Sign up</a></p>
        </Layout>
    );
});

// Sign-out route
app.post('/signout', async (c) => {
    const headers = new Headers();
    headers.set('Location', '/');

    // Call BetterAuth sign-out
    await auth.api.signOut({ headers: c.req.raw.headers });

    return c.redirect('/', 302);
});

serve({
    fetch: app.fetch,
    port: 3000
});
