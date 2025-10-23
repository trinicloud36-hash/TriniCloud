import { Hono } from 'hono';
import type { Env } from '../../types/env';

export const userRoutes = new Hono<{ Bindings: Env }>();

userRoutes.get('/', async (c) => {
  const users = await c.env.DB.prepare(
    'SELECT * FROM users ORDER BY created_at DESC'
  ).all();
  return c.json(users);
});
