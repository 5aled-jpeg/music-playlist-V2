const fs = require('fs');
const path = require('path');

console.log('Building production distribution for Vercel...');

const distDir = path.join(__dirname, 'dist');

// Ensure dist and subdirectories exist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'css'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'js'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'songs'), { recursive: true });

// Copy root files
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'favicon.svg'), path.join(distDir, 'favicon.svg'));

// Copy CSS
fs.cpSync(path.join(__dirname, 'css'), path.join(distDir, 'css'), { recursive: true });

// Copy JS
fs.cpSync(path.join(__dirname, 'js'), path.join(distDir, 'js'), { recursive: true });

// Copy Songs & Artwork
fs.cpSync(path.join(__dirname, 'songs'), path.join(distDir, 'songs'), { recursive: true });

console.log('Production build successfully generated in ./dist!');
