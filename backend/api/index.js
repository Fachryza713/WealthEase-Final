
import app from '../server.js';

export default function handler(req, res) {
  // Vercel serverless function handler
  return app(req, res);
}
