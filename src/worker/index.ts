import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/security';
import { jwt } from 'hono/jwt';
import type { Env } from '../types/env';

const app = new Hono<{ Bindings: Env }>();

// Security middleware
app.use('*', cors({
  origin: ['https://trinicloud.pages.dev', 'http://localhost:5173'],
  credentials: true,
}));
app.use('*', secureHeaders());
app.use('/api/*', jwt({ secret: (c) => c.env.JWT_SECRET }));

// Error handling
app.onError((err, c) => {
  console.error(err);
  const status = err.status || 500;
  return c.json({
    type: `https://trinicloud.pages.dev/errors/${err.name}`,
    title: err.name,
    status,
    detail: err.message,
    instance: c.req.path
  }, status);
});

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Gemini 2.0 Flash route
app.get('/api/gemini', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'OPENAI_API_KEY not set' }, 500);
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: {
          text: 'Write a short poem about the cloud.'
        }
      })
    });

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('Gemini API error:', error);
    return c.json({ error: 'Gemini API error' }, 500);
  }
});

// Import and use route modules
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';

app.route('/api/users', userRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/projects', projectRoutes);

export default app;
