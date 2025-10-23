/// <reference types="@cloudflare/workers-types" />

declare module '@cloudflare/workers-types';

export interface Env {
  // Bindings
  DB: D1Database;
  SESSIONS: KVNamespace;
  STORAGE: R2Bucket;

  // Environment variables
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  ENV: 'development' | 'production';
}
