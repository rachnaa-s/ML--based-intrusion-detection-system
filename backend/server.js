import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedDefaultsIfNeeded } from './services/store.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/health' && req.originalUrl !== '/api/health') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Root welcome & API catalog
app.get('/', (req, res, next) => {
  const distIndex = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  const wantsOnlyJson = req.headers.accept && req.headers.accept === 'application/json';

  if (!wantsOnlyJson && fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }

  return res.json({
    system: "Machine Learning-Based Intrusion Detection System (IDS)",
    stack: "MERN Stack (MongoDB, Express, React, Node.js)",
    status: "online",
    endpoints: {
      "GET /health": "Backend, Model, & MongoDB health status",
      "GET /schema": "41 NSL-KDD Feature schema & options",
      "GET /presets": "Pre-configured attack & normal traffic presets",
      "POST /predict": "Submit traffic packet for real-time intrusion classification",
      "GET /history": "Retrieve prediction audit log from MongoDB",
      "GET /blocked-ips": "Firewall blacklist rules from MongoDB",
      "GET /stats": "Aggregated cybersecurity metrics"
    }
  });
});

app.get('/api', (req, res) => {
  return res.json({
    system: "Machine Learning-Based Intrusion Detection System (IDS)",
    stack: "MERN Stack (MongoDB, Express, React, Node.js)",
    status: "online",
    endpoints: {
      "GET /health": "Backend, Model, & MongoDB health status",
      "GET /schema": "41 NSL-KDD Feature schema & options",
      "GET /presets": "Pre-configured attack & normal traffic presets",
      "POST /predict": "Submit traffic packet for real-time intrusion classification",
      "GET /history": "Retrieve prediction audit log from MongoDB",
      "GET /blocked-ips": "Firewall blacklist rules from MongoDB",
      "GET /stats": "Aggregated cybersecurity metrics"
    }
  });
});

// Mount routes at both root and /api for maximum compatibility
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Serve frontend production build if present in frontend/dist
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health' || req.originalUrl === '/schema') {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requested_url: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server & Connect Database
export async function startServer(port = DEFAULT_PORT) {
  await connectDB();
  await seedDefaultsIfNeeded();

  return new Promise((resolve) => {
    const server = app.listen(port, '0.0.0.0', () => {
      const actualPort = server.address().port;
      console.log(`====================================================`);
      console.log(`🛡️  IDS MERN BACKEND SERVER RUNNING ON PORT ${actualPort}`);
      console.log(`   Local URL:    http://localhost:${actualPort}`);
      console.log(`   Health Check: http://localhost:${actualPort}/health`);
      console.log(`   Prediction:   POST http://localhost:${actualPort}/predict`);
      console.log(`====================================================`);
      resolve(server);
    });
  });
}

// Auto-start if run directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMainModule) {
  startServer();
}

export default app;
