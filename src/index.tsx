import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import type { PropsWithChildren } from 'hono/jsx';

const app = new Hono();

function Layout(props: PropsWithChildren) {
    return (
        <html>
            <body>{props.children}</body>
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

serve({
    fetch: app.fetch,
    port: 3000
});
