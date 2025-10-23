import { Hono } from 'hono';
import type { Env } from '../../types/env';

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.get('/github/callback', async (c) => {
  // Implement GitHub OAuth callback
  return c.json({ status: 'ok' });
});
