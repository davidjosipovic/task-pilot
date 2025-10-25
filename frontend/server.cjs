#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Check if dist exists
if (!fs.existsSync(distPath)) {
  console.error('ERROR: dist directory not found!');
  console.error('Current directory:', __dirname);
  console.error('Contents:', fs.readdirSync(__dirname));
  process.exit(1);
}

console.log(`Starting server on 0.0.0.0:${PORT}`);
console.log(`Serving directory: ${distPath}`);

// Start serve
const servePath = path.join(__dirname, 'node_modules', '.bin', 'serve');
const command = `"${servePath}" dist --single --no-port-switching --listen tcp://0.0.0.0:${PORT}`;

const child = exec(command, (error) => {
  if (error) {
    console.error('Server error:', error);
    process.exit(1);
  }
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Forward signals
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
