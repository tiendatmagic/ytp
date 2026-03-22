const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const binDir = path.join(__dirname, '..', 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const isWin = process.platform === 'win32';
const filename = isWin ? 'yt-dlp.exe' : 'yt-dlp';
const downloadUrl = isWin 
  ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
  : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

const distPath = path.join(binDir, filename);

async function download() {
  if (fs.existsSync(distPath)) {
    const stat = fs.statSync(distPath);
    if (stat.size > 1000000) { // must be larger than 1MB
      console.log(`yt-dlp already exists at ${distPath}`);
      process.exit(0);
    } else {
      console.log(`yt-dlp corrupted (${stat.size} bytes). Re-downloading...`);
    }
  }

  console.log(`Downloading yt-dlp from ${downloadUrl}...`);
  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`Failed with status ${res.status} ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(distPath, Buffer.from(arrayBuffer));
    
    if (!isWin) execSync(`chmod +x ${distPath}`);
    console.log('yt-dlp downloaded and ready.');
  } catch (err) {
    if (fs.existsSync(distPath)) fs.unlinkSync(distPath);
    console.error('Error downloading yt-dlp:', err.message);
    process.exit(1);
  }
}

download();
