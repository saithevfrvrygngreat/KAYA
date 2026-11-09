require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const designRoutes = require('./src/routes/designs');
const aiRoutes = require('./src/routes/ai');
const adminRoutes = require('./src/routes/admin');

const app = express();

// Connect to MongoDB and auto-seed if empty
connectDB().then(async () => {
  try {
    const Product = require('./src/models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Database is empty. Auto-seeding initial SQLite data into MongoDB...');
      const seedAll = require('./src/utils/seed_master');
      await seedAll();
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }
}).catch(() => {});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve React frontend static build
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../Frontend/dist');
const legacyDistPath = path.join(__dirname, '../client/dist');
const clientDistPath = fs.existsSync(frontendDistPath) ? frontendDistPath : legacyDistPath;
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const { execSync } = require('child_process');

const startListening = () => {
  const server = app.listen(PORT, () => {
    console.log(`✅ KaYa API Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${PORT} is already in use by a background process.`);
      try {
        if (process.platform === 'win32') {
          console.log(`🧹 Clearing port ${PORT}...`);
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
            app.listen(PORT, () => {
              console.log(`✅ KaYa API Server successfully started on http://localhost:${PORT}`);
            });
          }, 1000);
          return;
        }
      } catch (killErr) {
        console.warn(`   Could not auto-release port ${PORT}:`, killErr.message);
      }
      console.error(`❌ Port ${PORT} is in use. Run 'taskkill /F /IM node.exe' to free it.`);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });

  return server;
};

startListening();

module.exports = app;

