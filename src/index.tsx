import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import type { PropsWithChildren } from 'hono/jsx';

const app = new Hono();

function Layout(props: PropsWithChildren) {
    return (
        <html>
            <body>
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
                <main>{props.children}</main>
                <footer>
                    <p>© 2023 My Website</p>
                </footer>
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
