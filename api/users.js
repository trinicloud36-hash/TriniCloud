export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const sp = url.searchParams;

    // list users with filtering, sorting, pagination
    if (request.method === 'GET' && pathname === '/api/users') {
      const page = Math.max(1, parseInt(sp.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '10')));
      const offset = (page - 1) * limit;
      const sortField = ['name','email','created_at','role'].includes(sp.get('sort')) ? sp.get('sort') : 'created_at';
      const sortDir = sp.get('dir') === 'asc' ? 'ASC' : 'DESC';
      const role = sp.get('role');
      const q = sp.get('q');

      // build where
      let where = 'WHERE 1=1';
      const params = [];
      if (role) { where += ' AND role = ?'; params.push(role); }
      if (q) { where += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }

      // total count
      const countStmt = `SELECT COUNT(*) as total FROM users ${where}`;
      const countRes = await env.DB.prepare(countStmt).bind(...params).all();
      const total = countRes.results?.[0]?.total || 0;

      const stmt = `SELECT id,email,name,role,created_at,updated_at FROM users ${where} ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`;
      const results = await env.DB.prepare(stmt).bind(...params, limit, offset).all();

      return new Response(JSON.stringify({
        users: results.results || [],
        pagination: { total, page, limit, pages: Math.ceil(total/limit) }
      }), { headers: { 'Content-Type': 'application/json' }});
    }

    // create user
    if (request.method === 'POST' && pathname === '/api/users') {
      const payload = await request.json();
      const { email, name, password, role = 'user' } = payload;
      if (!email || !name || !password) return new Response(JSON.stringify({error:'missing fields'}), {status:400, headers:{'Content-Type':'application/json'}});
      // NOTE: in production hash passwords properly
      try {
        const id = crypto.randomUUID();
        await env.DB.prepare('INSERT INTO users (id,email,name,password_hash,role,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, email, name, password, role, Math.floor(Date.now()/1000), Math.floor(Date.now()/1000))
          .run();
        const r = { id, email, name, role };
        return new Response(JSON.stringify(r), { status: 201, headers: { 'Content-Type': 'application/json' }});
      } catch (err) {
        const msg = err && err.message || '';
        if (msg.includes('UNIQUE') || msg.includes('constraint')) {
          return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 409, headers: { 'Content-Type': 'application/json' }});
        }
        return new Response(JSON.stringify({ error: 'db error' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
