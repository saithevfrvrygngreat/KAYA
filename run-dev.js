import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const children = [];

function findPython() {
  const candidates = [
    'C:\\Users\\hp\\AppData\\Local\\Programs\\Python\\Python314\\python.exe',
    'python3',
    'python',
    'py',
  ];
  for (const c of candidates) {
    if (c.includes('\\') && fs.existsSync(c)) {
      return c;
    }
    try {
      execSync(`${c} --version`, { stdio: 'ignore' });
      return c;
    } catch {}
  }
  return 'python';
}

async function start() {
  console.log('\x1b[35m===================================================\x1b[0m');
  console.log('\x1b[35m  🏺 Starting KAYA Stack (Django + SQLite + React) \x1b[0m');
  console.log('\x1b[35m===================================================\x1b[0m\n');

  const pythonCmd = findPython();
  console.log(`\x1b[32m[PYTHON]\x1b[0m Using Python executable: ${pythonCmd}`);

  // 1. Run migrations
  console.log('\x1b[34m[DJANGO]\x1b[0m Verifying SQLite database migrations...');
  try {
    execSync(`"${pythonCmd}" Backend/manage.py migrate --noinput`, { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    console.warn(`\x1b[33m[DJANGO]\x1b[0m Migrate notice: ${err.message}`);
  }

  // 2. Start Django Backend Server on port 5000
  console.log('\x1b[34m[SERVER]\x1b[0m Launching Django Backend on port 5000...');
  const serverProc = spawn(pythonCmd, ['Backend/manage.py', 'runserver', '0.0.0.0:5000'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });
  children.push(serverProc);

  serverProc.stdout.on('data', (d) => process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${d}`));
  serverProc.stderr.on('data', (d) => process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${d}`));

  // 3. Start Vite React Frontend on port 5173
  console.log('\x1b[36m[CLIENT]\x1b[0m Launching React Vite Frontend on port 5173...');
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
  console.log('\x1b[90m  ➜ Django API Backend:      http://localhost:5000/api/\x1b[0m\n');
}

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
