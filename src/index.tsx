import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { raw } from 'hono/html';
import type { PropsWithChildren } from 'hono/jsx';

import { auth, polarClient } from '../utils/auth';

const PORT = parseInt(process.env.PORT || '3000', 10);
const BASE_URL = process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`;

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
        origin: BASE_URL,
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

// Mount BetterAuth handler (also serves Polar checkout, portal, and webhook endpoints)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

// Middleware: require active subscription
async function requireSubscription(c: any, next: any) {
    const user = c.get('user');
    if (!user) return c.redirect('/signin');

    try {
        const response = await fetch(`${BASE_URL}/api/auth/customer/state`, {
            headers: c.req.raw.headers
        });
        if (response.ok) {
            const customerState = await response.json();
            const hasActiveSubscription = customerState?.subscriptions?.some(
                (sub: any) => sub.status === 'active'
            );
            if (hasActiveSubscription) {
                return next();
            }
        }
    } catch (error) {
        console.error('Failed to check subscription status:', error);
    }

    return c.redirect('/#pricing');
}

// Middleware: require authentication
async function requireAuth(c: any, next: any) {
    const user = c.get('user');
    if (!user) return c.redirect('/signin');
    return next();
}

// --- Components ---

function Head() {
    const fontUrl =
        'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';

    return (
        <head>
            <meta charset="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <title>Hono API Starter</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
            />
            <link href={fontUrl} rel="stylesheet" />
            <style>
                {raw(`
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
    --color-bg: #fafafa;
    --color-surface: #ffffff;
    --color-border: #e5e5e5;
    --color-text: #171717;
    --color-text-muted: #525252;
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-success: #16a34a;
    --color-error: #dc2626;
    --radius: 8px;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

html { font-family: 'Space Grotesk', sans-serif; line-height: 1.6; color: var(--color-text); background: var(--color-bg); scroll-behavior: smooth; }

body { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; }

a { color: var(--color-primary); text-decoration: none; }
a:hover { text-decoration: underline; }

h1 { font-size: 2rem; font-weight: 700; line-height: 1.2; margin-bottom: 0.5rem; }
h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.25rem; }
h4 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
p { color: var(--color-text-muted); }
small { color: var(--color-text-muted); font-size: 0.85rem; }

/* Nav */
.site-header { padding: 1rem 0; border-bottom: 1px solid var(--color-border); margin-bottom: 2rem; }
.site-header nav { display: flex; justify-content: space-between; align-items: center; }
.site-header .brand { font-weight: 700; font-size: 1.125rem; color: var(--color-text); }
.nav-links { display: flex; gap: 1.25rem; list-style: none; align-items: center; }
.nav-links a { color: var(--color-text-muted); font-size: 0.9rem; font-weight: 500; }
.nav-links a:hover { color: var(--color-text); text-decoration: none; }

/* Buttons */
.btn { display: inline-block; padding: 0.5rem 1.25rem; border-radius: var(--radius); font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: none; transition: background 0.15s; text-decoration: none; }
a.btn-primary, .btn-primary { background: var(--color-primary); color: #fff; }
a.btn-primary:hover, .btn-primary:hover { background: var(--color-primary-hover); text-decoration: none; color: #fff; }
a.btn-outline, .btn-outline { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }
a.btn-outline:hover, .btn-outline:hover { border-color: var(--color-text-muted); text-decoration: none; }
.btn-sm { padding: 0.35rem 0.85rem; font-size: 0.8rem; }

/* Grid */
.grid { display: grid; gap: 1.25rem; }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 640px) {
    .grid-3, .grid-2 { grid-template-columns: 1fr; }
}

/* Cards */
.card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }

/* Hero */
.hero { text-align: center; padding: 3rem 0 2rem; }
.hero h1 { font-size: 2.5rem; }
.hero p { max-width: 540px; margin: 0.5rem auto 1.5rem; font-size: 1.05rem; }

/* Sections */
.section { padding: 2rem 0; }
.section-title { text-align: center; margin-bottom: 1.25rem; }

/* Pricing */
.price { font-size: 2.25rem; font-weight: 700; color: var(--color-text); margin: 0.75rem 0; }
.price small { font-size: 1rem; font-weight: 400; color: var(--color-text-muted); }
.pricing-card { text-align: center; }
.pricing-card ul { list-style: none; margin: 1rem 0; text-align: left; }
.pricing-card li { padding: 0.3rem 0; font-size: 0.9rem; }

/* Forms */
.form-card { max-width: 400px; margin: 0 auto; }
label { display: block; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500; color: var(--color-text); }
input[type="text"], input[type="email"], input[type="password"] {
    display: block; width: 100%; margin-top: 0.25rem; padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border); border-radius: var(--radius);
    font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.15s;
}
input:focus { border-color: var(--color-primary); }
button[type="submit"] { width: 100%; }

/* Alerts */
.alert { padding: 0.75rem 1rem; border-radius: var(--radius); font-size: 0.9rem; margin-bottom: 1rem; }
.alert-error { background: #fef2f2; color: var(--color-error); border: 1px solid #fecaca; }
.alert-success { background: #f0fdf4; color: var(--color-success); border: 1px solid #bbf7d0; }

/* Code */
pre { background: #1e1e1e; color: #d4d4d4; padding: 1.25rem; border-radius: var(--radius); overflow-x: auto; font-size: 0.85rem; line-height: 1.7; }
code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.85em; }
p code, li code { background: #f3f4f6; padding: 0.15rem 0.4rem; border-radius: 4px; color: var(--color-text); }

/* Footer */
.site-footer { border-top: 1px solid var(--color-border); padding: 1.5rem 0; margin-top: 3rem; text-align: center; }
            `)}
            </style>
        </head>
    );
}

function Header({ user }: { user: any }) {
    return (
        <header class="site-header">
            <nav>
                <a href="/" class="brand">
                    🔥 Hono API
                </a>
                <ul class="nav-links">
                    <li>
                        <a href="/#pricing">Pricing</a>
                    </li>
                    <li>
                        <a href="/#docs">Docs</a>
                    </li>
                    {user ? (
                        <>
                            <li>
                                <a href="/dashboard">Dashboard</a>
                            </li>
                            <li>
                                <form action="/signout" method="post">
                                    <button
                                        type="submit"
                                        class="btn btn-outline btn-sm"
                                    >
                                        Sign Out
                                    </button>
                                </form>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <a href="/signin">Sign In</a>
                            </li>
                            <li>
                                <a
                                    href="/signup"
                                    class="btn btn-primary btn-sm"
                                >
                                    Get Started
                                </a>
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
        <footer class="site-footer">
            <small>
                © {new Date().getFullYear()} Hono API Starter. Built with Hono,
                Better Auth &amp; Polar.
            </small>
        </footer>
    );
}

function Layout(props: PropsWithChildren & { user?: any }) {
    return (
        <html>
            <Head />
            <body>
                <Header user={props.user} />
                <main>{props.children}</main>
                <Footer />
            </body>
        </html>
    );
}

// --- Routes ---

// Landing page
app.get('/', (c) => {
    const user = c.get('user');

    return c.html(
        <Layout user={user}>
            <section class="hero">
                <h1>Ship Your API. Start Earning.</h1>
                <p>
                    A production-ready API boilerplate with authentication,
                    subscription billing, and Postgres persistence — all wired
                    up and ready to deploy on Railway.
                </p>
                {user ? (
                    <a href="/dashboard" class="btn btn-primary">
                        Go to Dashboard
                    </a>
                ) : (
                    <a href="/signup" class="btn btn-primary">
                        Get Started Free
                    </a>
                )}
            </section>

            <section class="section">
                <div class="grid grid-3">
                    <article class="card">
                        <h3>🔐 Auth Built-In</h3>
                        <p>
                            Email/password authentication powered by Better Auth
                            with session management, ready to extend with social
                            providers.
                        </p>
                    </article>
                    <article class="card">
                        <h3>💳 Monetize with Polar</h3>
                        <p>
                            Subscription billing and checkout handled by Polar.
                            Gate premium endpoints behind an active subscription
                            automatically.
                        </p>
                    </article>
                    <article class="card">
                        <h3>🚀 Deploy Instantly</h3>
                        <p>
                            Postgres via Prisma, Bun runtime, and zero-config
                            Railway deployment. Push to main and you're live.
                        </p>
                    </article>
                </div>
            </section>

            <section class="section">
                <h2 class="section-title">How It Works</h2>
                <div class="grid grid-3">
                    <div class="card">
                        <h4>1. Sign Up</h4>
                        <p>Create an account with email and password.</p>
                    </div>
                    <div class="card">
                        <h4>2. Subscribe</h4>
                        <p>Choose a plan and check out via Polar.</p>
                    </div>
                    <div class="card">
                        <h4>3. Use the API</h4>
                        <p>
                            Access gated endpoints with your session token.
                            Build anything.
                        </p>
                    </div>
                </div>
            </section>

            <section class="section">
                <h2 class="section-title">Quick Start</h2>
                <pre>
                    <code>{`# Clone & install
git clone <your-repo>
cd hono-sandbox
bun install

# Set up env vars
cp .env.example .env

# Run migrations & start
bunx prisma migrate dev
bun run dev`}</code>
                </pre>
            </section>

            <section class="section" id="pricing">
                <h2 class="section-title">Pricing</h2>
                <p class="section-title">
                    Simple, transparent pricing for your API access.
                </p>
                <div class="grid grid-2">
                    <article class="card pricing-card">
                        <h3>Free</h3>
                        <p class="price">$0</p>
                        <ul>
                            <li>✓ Create an account</li>
                            <li>✓ View documentation</li>
                            <li>✗ API access</li>
                        </ul>
                        {user ? (
                            <p>
                                <small>Current plan</small>
                            </p>
                        ) : (
                            <a href="/signup" class="btn btn-outline">
                                Sign Up
                            </a>
                        )}
                    </article>
                    <article class="card pricing-card">
                        <h3>Pro</h3>
                        <p class="price">
                            $XX<small>/mo</small>
                        </p>
                        <ul>
                            <li>✓ Everything in Free</li>
                            <li>✓ Full API access</li>
                            <li>✓ Priority support</li>
                        </ul>
                        {user ? (
                            <form action="/checkout" method="post">
                                <input type="hidden" name="slug" value="pro" />
                                <button type="submit" class="btn btn-primary">
                                    Subscribe
                                </button>
                            </form>
                        ) : (
                            <a href="/signup" class="btn btn-primary">
                                Get Started
                            </a>
                        )}
                    </article>
                </div>
            </section>

            <section class="section" id="docs">
                <h2 class="section-title">API Documentation</h2>
                <p class="section-title">
                    Authenticate with your session cookie, then call the API
                    endpoints below.
                </p>
                <div class="grid">
                    <article class="card">
                        <h3>Authentication</h3>
                        <p>
                            Sign in via the web UI or{' '}
                            <code>POST /api/auth/sign-in/email</code> with{' '}
                            <code>{'{ email, password }'}</code>. The session
                            cookie is set automatically.
                        </p>
                    </article>
                    <article class="card">
                        <h3>
                            <code>GET /api/health</code>
                        </h3>
                        <p>Public health check. No auth required.</p>
                        <pre>
                            <code>{`// Response
{ "status": "ok", "timestamp": "2026-03-06T..." }`}</code>
                        </pre>
                    </article>
                    <article class="card">
                        <h3>
                            <code>GET /api/me</code>
                        </h3>
                        <p>
                            Returns your profile and subscription status.
                            Requires authentication.
                        </p>
                        <pre>
                            <code>{`// Response
{ "id": "...", "name": "...", "email": "...",
  "subscription": { "status": "active", "plan": "pro" } }`}</code>
                        </pre>
                    </article>
                    <article class="card">
                        <h3>
                            <code>GET /api/generate?prompt=...</code>
                        </h3>
                        <p>
                            Generate content from a prompt. Requires Pro
                            subscription.
                        </p>
                        <pre>
                            <code>{`// Response
{ "result": "Generated content for: ...",
  "model": "demo-v1", "usage": { "tokens": 11 } }`}</code>
                        </pre>
                    </article>
                    <article class="card">
                        <h3>
                            <code>GET /api/keys</code>
                        </h3>
                        <p>
                            List your API keys and usage. Requires Pro
                            subscription.
                        </p>
                        <pre>
                            <code>{`// Response
{ "keys": [{ "id": "key_live_demo", "prefix": "sk_live_" }],
  "usage": { "requests": 0, "limit": 10000 } }`}</code>
                        </pre>
                    </article>
                </div>
            </section>
        </Layout>
    );
});

// --- Auth Routes ---

app.get('/signup', (c) => {
    const user = c.get('user');
    if (user) return c.redirect('/dashboard');
    const error = c.req.query('error');

    return c.html(
        <Layout user={user}>
            <div class="form-card">
                <h1>Sign Up</h1>
                {error && (
                    <div class="alert alert-error">
                        {decodeURIComponent(error)}
                    </div>
                )}
                <form action="/signup" method="post">
                    <label>
                        Name
                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            required
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            placeholder="Min 8 characters"
                            required
                        />
                    </label>
                    <button type="submit" class="btn btn-primary">
                        Create Account
                    </button>
                </form>
                <p>
                    <a href="/signin">Already have an account? Sign in</a>
                </p>
            </div>
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

        const authResponse = await auth.api.signUpEmail({
            body: validatedData,
            asResponse: true,
            headers: c.req.raw.headers
        });

        if (authResponse.ok) {
            // Auto-login: forward session cookies from sign-up response
            const response = c.redirect('/dashboard');
            const setCookieHeaders = authResponse.headers.getSetCookie();
            for (const cookie of setCookieHeaders) {
                response.headers.append('Set-Cookie', cookie);
            }
            return response;
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

app.get('/signin', (c) => {
    const user = c.get('user');
    if (user) return c.redirect('/dashboard');
    const error = c.req.query('error');
    const success = c.req.query('success');

    return c.html(
        <Layout user={user}>
            <div class="form-card">
                <h1>Sign In</h1>
                {error && (
                    <div class="alert alert-error">
                        {decodeURIComponent(error)}
                    </div>
                )}
                {success && (
                    <div class="alert alert-success">
                        {decodeURIComponent(success)}
                    </div>
                )}
                <form action="/signin" method="post">
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            placeholder="Your password"
                            required
                        />
                    </label>
                    <button type="submit" class="btn btn-primary">
                        Sign In
                    </button>
                </form>
                <p>
                    <a href="/signup">Don't have an account? Sign up</a>
                </p>
            </div>
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

        const authResponse = await auth.api.signInEmail({
            body: validatedData,
            asResponse: true,
            headers: c.req.raw.headers
        });

        if (authResponse.ok) {
            const setCookieHeaders = authResponse.headers.getSetCookie();
            const response = c.redirect('/dashboard');

            for (const cookie of setCookieHeaders) {
                response.headers.append('Set-Cookie', cookie);
            }

            return response;
        } else {
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

app.post('/signout', async (c) => {
    const authResponse = await auth.api.signOut({
        headers: c.req.raw.headers,
        asResponse: true
    });
    const response = c.redirect('/', 302);
    const setCookieHeaders = authResponse.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
        response.headers.append('Set-Cookie', cookie);
    }
    return response;
});

// --- Protected Routes ---

// Dashboard (requires authentication, shows subscription status)
app.get('/dashboard', requireAuth, async (c) => {
    const user = c.get('user');
    const checkoutSuccess = c.req.query('checkout') === 'success';

    // Check subscription status
    let hasSubscription = false;
    try {
        const response = await fetch(`${BASE_URL}/api/auth/customer/state`, {
            headers: c.req.raw.headers
        });
        if (response.ok) {
            const customerState = await response.json();
            hasSubscription = customerState?.subscriptions?.some(
                (sub: any) => sub.status === 'active'
            );
        }
    } catch {
        // Subscription check failed — show unsubscribed state
    }

    return c.html(
        <Layout user={user}>
            <section class="section">
                <h1>Dashboard</h1>
                <p>Welcome back, {user!.name || user!.email}!</p>
                {checkoutSuccess && (
                    <div class="alert alert-success">
                        Subscription activated! You now have full API access.
                    </div>
                )}
            </section>
            <div class="grid grid-2">
                <article class="card">
                    <h3>Subscription</h3>
                    {hasSubscription ? (
                        <>
                            <p>You have an active Pro subscription.</p>
                            <a
                                href="/api/auth/customer/portal"
                                class="btn btn-outline"
                            >
                                Manage Subscription
                            </a>
                        </>
                    ) : (
                        <>
                            <p>
                                You're on the Free plan. Upgrade to Pro to
                                unlock API access.
                            </p>
                            <form action="/checkout" method="post">
                                <input type="hidden" name="slug" value="pro" />
                                <button type="submit" class="btn btn-primary">
                                    Upgrade to Pro
                                </button>
                            </form>
                        </>
                    )}
                </article>
                <article class="card">
                    <h3>API Access</h3>
                    {hasSubscription ? (
                        <p>
                            Your API is ready. Try <code>GET /api/hello</code>{' '}
                            with your session cookie.
                        </p>
                    ) : (
                        <p>API access requires an active Pro subscription.</p>
                    )}
                </article>
            </div>
        </Layout>
    );
});

// Checkout: creates a Polar checkout session and redirects to it
app.post('/checkout', async (c) => {
    const user = c.get('user');
    if (!user) return c.redirect('/signin');

    try {
        const checkout = await polarClient.checkouts.create({
            products: [process.env.POLAR_PRODUCT_ID!],
            externalCustomerId: user.id,
            successUrl: `${BASE_URL}/dashboard?checkout=success`
        });

        return c.redirect(checkout.url);
    } catch (error) {
        console.error('Checkout failed:', error);
    }

    return c.redirect('/#pricing');
});

// --- API Routes ---

// Public: health check
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth required: current user profile and subscription status
app.get('/api/me', requireAuth, async (c) => {
    const user = c.get('user');

    let subscription: { status: string; plan: string } | null = null;
    try {
        const response = await fetch(`${BASE_URL}/api/auth/customer/state`, {
            headers: c.req.raw.headers
        });
        if (response.ok) {
            const state = await response.json();
            const activeSub = state?.subscriptions?.find(
                (sub: any) => sub.status === 'active'
            );
            if (activeSub) {
                subscription = { status: 'active', plan: 'pro' };
            }
        }
    } catch {
        // Polar unavailable — return profile without subscription info
    }

    return c.json({
        id: user!.id,
        name: user!.name,
        email: user!.email,
        subscription
    });
});

export default {
    port: PORT,
    fetch: app.fetch
};
