import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { PropsWithChildren } from 'hono/jsx';

import { auth } from '../utils/auth';

// Zod validation schemas
const signUpSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be less than 100 characters')
});

const signInSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
});

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
                                <form
                                    action="/signout"
                                    method="post"
                                    style="display: inline;"
                                >
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
            {user ? (
                <p>Welcome back, {user.name || user.email}!</p>
            ) : (
                <p>Please sign in to get started.</p>
            )}
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

// Sign-up routes
app.get('/signup', (c) => {
    const user = c.get('user');
    const error = c.req.query('error');

    return c.html(
        <Layout user={user}>
            <h1>Sign Up</h1>
            {error && (
                <div style="color: red; margin-bottom: 1rem;">
                    {decodeURIComponent(error)}
                </div>
            )}
            <form action="/signup" method="post">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required />

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Sign Up</button>
            </form>
            <p>
                <a href="/signin">Already have an account? Sign in</a>
            </p>
        </Layout>
    );
});

app.post('/signup', async (c) => {
    const formData = await c.req.formData();
    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string
    };

    try {
        const validatedData = signUpSchema.parse(data);

        // Forward to Better Auth
        const authResponse = await fetch(
            `http://localhost:3000/api/auth/sign-up/email`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(validatedData)
            }
        );

        if (authResponse.ok) {
            return c.redirect('/signin?success=Account created successfully');
        } else {
            const errorText = await authResponse.text();
            return c.redirect(
                `/signup?error=${encodeURIComponent(
                    'Failed to create account: ' + errorText
                )}`
            );
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues
                .map((issue) => issue.message)
                .join(', ');
            return c.redirect(
                `/signup?error=${encodeURIComponent(errorMessage)}`
            );
        }
        return c.redirect(
            `/signup?error=${encodeURIComponent(
                'An unexpected error occurred'
            )}`
        );
    }
});

// Sign-in routes
app.get('/signin', (c) => {
    const user = c.get('user');
    const error = c.req.query('error');
    const success = c.req.query('success');
    return c.html(
        <Layout user={user}>
            <h1>Sign In</h1>
            {error && (
                <div style="color: red; margin-bottom: 1rem;">
                    {decodeURIComponent(error)}
                </div>
            )}
            {success && (
                <div style="color: green; margin-bottom: 1rem;">
                    {decodeURIComponent(success)}
                </div>
            )}
            <form action="/signin" method="post">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Sign In</button>
            </form>
            <p>
                <a href="/signup">Don't have an account? Sign up</a>
            </p>
        </Layout>
    );
});

app.post('/signin', async (c) => {
    const formData = await c.req.formData();
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string
    };

    try {
        const validatedData = signInSchema.parse(data);

        // Forward to Better Auth
        const authResponse = await fetch(
            `http://localhost:3000/api/auth/sign-in/email`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: c.req.header('Cookie') || ''
                },
                body: JSON.stringify(validatedData)
            }
        );

        if (authResponse.ok) {
            // Extract cookies from auth response and set them
            const setCookieHeaders = authResponse.headers.getSetCookie();
            const response = c.redirect('/');

            for (const cookie of setCookieHeaders) {
                response.headers.append('Set-Cookie', cookie);
            }

            return response;
        } else {
            const errorText = await authResponse.text();
            return c.redirect(
                `/signin?error=${encodeURIComponent(
                    'Invalid email or password'
                )}`
            );
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues
                .map((issue) => issue.message)
                .join(', ');
            return c.redirect(
                `/signin?error=${encodeURIComponent(errorMessage)}`
            );
        }
        return c.redirect(
            `/signin?error=${encodeURIComponent(
                'An unexpected error occurred'
            )}`
        );
    }
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
