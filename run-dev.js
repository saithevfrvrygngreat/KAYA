import { spawn, execSync } from 'child_process';
import net from 'net';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const children = [];

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Open & listening
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

function findMongod() {
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

async function ensureMongo() {
  const envPath = fs.existsSync(path.join(__dirname, 'Backend', '.env'))
    ? path.join(__dirname, 'Backend', '.env')
    : path.join(__dirname, '.env');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  const isAtlas = envContent.includes('mongodb+srv://') || process.env.MONGODB_URI?.includes('mongodb+srv://');

  if (isAtlas) {
    console.log('\x1b[32m[MONGO]\x1b[0m Configured for cloud MongoDB Atlas (no local mongod.exe daemon needed).');
    return;
  }

  const isRunning = await checkPort(27017);
  if (isRunning) {
    console.log('\x1b[32m[MONGO]\x1b[0m MongoDB is already active on 127.0.0.1:27017');
    return;
  }

  const mongodPath = findMongod();
  if (!mongodPath) {
    console.log('\x1b[33m[MONGO]\x1b[0m mongod.exe not found in standard paths. Please ensure MongoDB is started.');
    return;
  }

  const dbPath = path.join(__dirname, '.mongodb_data', 'db');
  const logPath = path.join(__dirname, '.mongodb_data', 'mongod.log');
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

  // Clean stale lock file if MongoDB was killed abruptly
  const lockFile = path.join(dbPath, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    try {
      fs.writeFileSync(lockFile, '');
    } catch {}
  }

  console.log(`\x1b[32m[MONGO]\x1b[0m Starting local MongoDB daemon (${mongodPath})...`);
  const mongoProc = spawn(mongodPath, [
    '--port', '27017',
    '--dbpath', dbPath,
    '--logpath', logPath,
    '--logappend',
    '--bind_ip', '127.0.0.1',
    '--setParameter', 'diagnosticDataCollectionEnabled=false'
  ], { stdio: 'ignore', detached: false });

  children.push(mongoProc);

  // Wait up to 5 seconds for connection
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await checkPort(27017)) {
      console.log('\x1b[32m[MONGO]\x1b[0m MongoDB is ready on port 27017');
      return;
    }
  }
}

async function start() {
  console.log('\x1b[35m===================================================\x1b[0m');
  console.log('\x1b[35m  🏺 Starting KAYA MERN Stack (Node.js + React)   \x1b[0m');
  console.log('\x1b[35m===================================================\x1b[0m\n');

  // 1. Ensure MongoDB
  await ensureMongo();

  // 2. Start Express Backend
  console.log('\x1b[34m[SERVER]\x1b[0m Launching Express Backend (Port 5000)...');
  const serverProc = spawn(process.execPath, ['Backend/server.js'], {
    cwd: __dirname,
    stdio: 'pipe',
  });
  children.push(serverProc);

  serverProc.stdout.on('data', (d) => process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${d}`));
  serverProc.stderr.on('data', (d) => process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${d}`));

  // 3. Start Vite React Frontend
  console.log('\x1b[36m[CLIENT]\x1b[0m Launching React Vite Frontend (Port 5173)...');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  
  const clientProc = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, 'Frontend'),
    stdio: 'pipe',
    shell: isWindows,
  });
  children.push(clientProc);

  clientProc.stdout.on('data', (d) => process.stdout.write(`\x1b[36m[CLIENT]\x1b[0m ${d}`));
  clientProc.stderr.on('data', (d) => process.stderr.write(`\x1b[31m[CLIENT ERR]\x1b[0m ${d}`));

  console.log('\n\x1b[32m✨ Applications ready:\x1b[0m');
  console.log('\x1b[1m\x1b[32m  ➜ Open Website in Browser:  http://localhost:5173\x1b[0m');
  console.log('\x1b[90m  ➜ API Backend Endpoint:    http://localhost:5000\x1b[0m\n');
}

// Cleanup child processes on exit
function shutdown() {
  console.log('\n\x1b[33mShutting down services...\x1b[0m');
  for (const child of children) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
      } else {
        child.kill('SIGINT');
      }
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
