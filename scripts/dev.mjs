import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const script = process.env.VITE_DATA_BACKEND === 'mongodb' ? 'scripts/mongodb-dev.mjs' : 'scripts/firebase-local.mjs';
const child = spawn(process.execPath, [script], { env: process.env, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', () => { process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 0; });
