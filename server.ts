import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio Nginx reverse proxy routes Cloud Run (8080) to port 3000
const port = 3000;

app.use(express.json());

// Health check endpoint for Cloud Run and load balancers
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'StudySOS', timestamp: new Date().toISOString() });
});

const distPath = path.resolve(__dirname, 'dist');

// Serve static assets from the production build directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: deliver index.html for all client routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req: Request, res: Response) => {
    res.status(200).send('StudySOS server is active. Build files are generating.');
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`StudySOS production server listening on http://0.0.0.0:${port}`);
});
