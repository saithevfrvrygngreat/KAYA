const mongoose = require('mongoose');
const net = require('net');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

function isPortListening(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function findMongodBinary() {
  const candidates = [
    'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'mongod',
  ];
  for (const c of candidates) {
    if (c === 'mongod') {
      try {
        execSync('mongod --version', { stdio: 'ignore' });
        return 'mongod';
      } catch {}
    } else if (fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

async function ensureLocalMongoRunning() {
  const isUp = await isPortListening(27017);
  if (isUp) {
    return true;
  }

  const mongodPath = findMongodBinary();
  if (!mongodPath) {
    return false;
  }

  const dbPath = path.resolve(__dirname, '../../../.mongodb_data/db');
  const logPath = path.resolve(__dirname, '../../../.mongodb_data/mongod.log');
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

  // Clean stale lock if previous process crashed
  const lockFile = path.join(dbPath, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    try {
      fs.writeFileSync(lockFile, '');
    } catch {}
  }

  console.log(`\x1b[32m[MONGO]\x1b[0m Starting local MongoDB daemon (${mongodPath})...`);
  try {
    const proc = spawn(mongodPath, [
      '--port', '27017',
      '--dbpath', dbPath,
      '--logpath', logPath,
      '--logappend',
      '--bind_ip', '127.0.0.1',
      '--setParameter', 'diagnosticDataCollectionEnabled=false'
    ], { stdio: 'ignore', detached: true });
    proc.unref();

    // Wait up to 5s for port to open
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await isPortListening(27017)) {
        console.log(`\x1b[32m[MONGO]\x1b[0m Local MongoDB started successfully on 127.0.0.1:27017`);
        return true;
      }
    }
  } catch (err) {
    console.warn('Could not auto-start mongod:', err.message);
  }
  return false;
}

const connectDB = async (retries = 5, delay = 2000) => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaya';
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  // If local mongo uri, verify/start local mongod
  if (isLocal) {
    await ensureLocalMongoRunning();
  }

  // Handle Mongoose connection events
  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error:`, err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(`⚠️ MongoDB connection disconnected.`);
  });

  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
  };
  if (isLocal) {
    connectOptions.family = 4; // Enforce IPv4 for local mongod only
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, connectOptions);
      return mongoose.connection;
    } catch (error) {
      console.warn(`⚠️ MongoDB connection attempt ${attempt}/${retries} failed (${error.message}).`);
      if (attempt < retries) {
        console.log(`   Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.warn('⚠️ Could not establish immediate connection to MongoDB.');
        console.warn('   The KaYa Express server will stay alive and retry in the background.');
        console.warn('   To run MongoDB manually: npm run mongo');
        // Do not call process.exit(1) so the backend server stays running!
      }
    }
  }
};

module.exports = connectDB;
