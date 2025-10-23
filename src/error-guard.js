export class TriniError extends Error {
  constructor(name='TriniError', status=500, message='Error', cost=0){
    super(message);
    this.name = name;
    this.status = status;
    this.cost = cost;
  }
}

export async function problemHandler(err, c) {
  const status = err.status || 500;
  const prob = {
    type: `https://trinicloud.workers.dev/errors/${(err.name||'error').toLowerCase().replace(/\s+/g,'-')}`,
    title: err.name || 'InternalError',
    status,
    detail: err.message || 'An unexpected error occurred',
    instance: c.req.path
  };

  // Log cost to D1
  if (c.env.DB && err.cost > 0) {
    c.waitUntil(
      c.env.DB.prepare(
        'INSERT INTO error_costs (name, cost_cents, path, ts) VALUES (?, ?, ?, ?)'
      ).bind(err.name, err.cost, c.req.path, Date.now()).run()
    );
  }

  return c.json(prob, status, { headers: { 'Content-Type': 'application/problem+json' }});
}
