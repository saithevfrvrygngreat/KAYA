require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const designRoutes = require('./src/routes/designs');
const aiRoutes = require('./src/routes/ai');
const adminRoutes = require('./src/routes/admin');

const app = express();

// ==========================================
// 1. CORS Configuration
// ==========================================
const allowedOrigins = [
  'https://kaya-9wta.onrender.com',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin requests in production)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In production on Render, the React frontend is served from the same origin, so same-origin is allowed
    return callback(null, true);
  },
  credentials: true,
}));

// ==========================================
// 2. Request Parsers
// ==========================================
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ==========================================
// 3. Static Uploads
// ==========================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch {}
}
app.use('/uploads', express.static(uploadsDir));

// ==========================================
// 4. API Endpoints
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Any unmatched /api/* requests return proper JSON 404 (not HTML)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    message: `API endpoint '${req.method} ${req.originalUrl}' not found`,
  });
});

// ==========================================
// 5. Serve Compiled React Frontend (SPA)
// ==========================================
const candidateDistDirs = [
  path.join(__dirname, '../Frontend/dist'),
  path.join(__dirname, 'public'),
  path.join(process.cwd(), 'Frontend/dist'),
  path.join(process.cwd(), 'dist'),
];
const clientDistPath = candidateDistDirs.find((dir) => fs.existsSync(dir));

if (clientDistPath) {
  console.log(`🌐 Serving compiled frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA client-side routing fallback (all non-API and non-uploads routes go to index.html)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).send('KaYa Luxury Furniture & Spatial Architecture API is running. (Frontend build not detected)');
  });
}

// ==========================================
// 6. Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==========================================
// 7. Server Initialization & Database Connect
// ==========================================
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

const startListening = () => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`✅ KaYa Server listening on http://${HOST}:${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${PORT} is in use.`);
      if (process.env.NODE_ENV !== 'production' && process.platform === 'win32') {
        const { execSync } = require('child_process');
        try {
          console.log(`🧹 Attempting local port cleanup on Windows...`);
          const netstatOutput = execSync(`netstat -ano | findstr :${PORT}`).toString();
          const lines = netstatOutput.trim().split('\n');
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== String(process.pid) && pid !== '0') {
              try {
                execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                console.log(`   Stopped conflicting process PID ${pid}`);
              } catch {}
            }
          }
          setTimeout(() => {
            app.listen(PORT, HOST, () => {
              console.log(`✅ KaYa Server listening on http://${HOST}:${PORT}`);
            });
          }, 1000);
          return;
        } catch (cleanupErr) {
          console.warn('   Could not auto-clear port:', cleanupErr.message);
        }
      }
    } else {
      console.error('❌ Server startup error:', err);
    }
  });

  return server;
};

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Auto-seed if database is completely empty
    try {
      const Product = require('./src/models/Product');
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('📦 Database is empty. Auto-seeding initial luxury catalog into MongoDB...');
        const seedAll = require('./src/utils/seed_master');
        await seedAll();
      }
    } catch (seedErr) {
      console.warn('Auto-seed check note:', seedErr.message);
    }

    // 3. Start Express HTTP Server
    startListening();
  } catch (err) {
    console.error('❌ FATAL: Application failed to initialize:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      // In development, start server anyway so developer can access error/health
      console.warn('⚠️ Starting server in degraded mode for development inspection...');
      startListening();
    }
  }
};

startServer();

module.exports = app;
