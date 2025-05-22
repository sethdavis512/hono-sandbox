import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello Node.js!'));

app.get('/:myParam', (c) => {
    const { myParam } = c.req.param();

    return c.text(myParam);
});

serve({
    fetch: app.fetch,
    port: 3000
});
