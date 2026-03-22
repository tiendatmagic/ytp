const { execSync } = require('child_process');

try {
  console.log('Installing YouTube and UI dependencies...');
  execSync('npm install yt-search @distube/ytdl-core lucide-react', { stdio: 'inherit' });
  console.log('Installation complete.');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}
