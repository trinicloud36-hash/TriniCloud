import { Hono } from 'hono';
import type { Env } from '../../types/env';

export const projectRoutes = new Hono<{ Bindings: Env }>();

projectRoutes.get('/', async (c) => {
  const projects = await c.env.DB.prepare(
    'SELECT * FROM projects ORDER BY created_at DESC'
  ).all();
  return c.json(projects);
});
