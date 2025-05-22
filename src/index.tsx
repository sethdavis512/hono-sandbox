import { Hono } from 'hono';
import { serve } from '@hono/node-server';

import type { PropsWithChildren } from 'hono/jsx';

const app = new Hono();

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

function Header() {
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

app.get('/', (c) =>
    c.html(
        <Layout>
            <h1>Honooo!</h1>
        </Layout>
    )
);

app.get('/about', (c) =>
    c.html(
        <Layout>
            <h1>About and stuff</h1>
        </Layout>
    )
);

serve({
    fetch: app.fetch,
    port: 3000
});
