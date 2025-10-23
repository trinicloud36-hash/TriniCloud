import { Hono } from 'https://esm.sh/hono';
import { problemHandler, TriniError } from './error-guard.js';

const app = new Hono();

app.onError(problemHandler);

// root health
app.get('/', (c) => c.text('TriniCloud proxy alive 🇹🇹'));

// bill endpoint: count threats
app.get('/bill', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT COUNT(*) as n FROM threats').all();
    const n = results?.[0]?.n ?? 0;
    return c.json({ threats: n, bill: '$0.00' });
  } catch (err) {
    throw new TriniError('DatabaseError', 503, 'D1 temporarily unavailable; retry later', 0.05);
  }
});

// price endpoint (mock OPAL) — circuit-safe
app.get('/price', async (c) => {
  try {
    // mocked price; if integrating OPAL, use fetchWithBreaker pattern
    const mock = { price: 0.0042 };
    return c.json({
      region: 'us-east-1',
      price: mock.price,
      trini_price: (mock.price * 1.07).toFixed(4),
      saved: (mock.price * 0.07).toFixed(4)
    });
  } catch (err) {
    throw new TriniError('PriceFetchError', 502, 'Price provider unreachable', 0.02);
  }
});

// message listener for queued payloads from SW (if used)
self.addEventListener('message', (e) => {
  // In Workers, message handling is limited; this is a placeholder.
  // For Cloudflare Workers, prefer endpoints to receive queued payloads.
});

/* Minimal endpoints to accept queued batches (POST) */
// accept batch threats
app.post('/api/threats', async (c) => {
  try {
    const batch = await c.req.json();
    if (!Array.isArray(batch)) return c.json({ error: 'bad payload' }, 400);
    for (const item of batch) {
      await c.env.DB.prepare('INSERT INTO threats (ip,timestamp,vector) VALUES (?, ?, ?)')
        .bind(item.ip || '0.0.0.0', item.ts || Math.floor(Date.now()/1000), item.vector || 'offline')
        .run();
    }
    return c.json({ ok: true, count: batch.length });
  } catch (err) {
    throw new TriniError('BatchInsertError', 500, 'Failed to insert batch', 0.05);
  }
});

// accept leads
app.post('/api/leads', async (c) => {
  try {
    const batch = await c.req.json();
    if (!Array.isArray(batch)) return c.json({ error: 'bad payload' }, 400);
    for (const item of batch) {
      await c.env.DB.prepare('INSERT INTO leads (email, source, ts) VALUES (?, ?, ?)')
        .bind(item.email, item.source || 'unknown', item.ts || Math.floor(Date.now()/1000))
        .run();
    }
    return c.json({ ok: true, count: batch.length });
  } catch (err) {
    throw new TriniError('LeadsInsertError', 500, 'Failed to insert leads', 0.02);
  }
});

export default app;
