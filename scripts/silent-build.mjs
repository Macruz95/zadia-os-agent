#!/usr/bin/env node
/**
 * Silent Build Script
 * Runs `next build` and filters out baseline-browser-mapping warnings
 */

import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(npmCmd, ['next', 'build'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

const filterLine = (line) => {
  return !line.includes('baseline-browser-mapping');
};

child.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (filterLine(line) && line.trim()) {
      process.stdout.write(line + '\n');
    }
  });
});

child.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (filterLine(line) && line.trim()) {
      process.stderr.write(line + '\n');
    }
  });
});

child.on('close', (code) => {
  process.exit(code);
});
