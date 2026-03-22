const { execSync } = require('child_process');
try {
  console.log('Installing @types/yt-search...');
  execSync('npm install -D @types/yt-search', { stdio: 'inherit' });
  console.log('Complete.');
} catch (error) {
  process.exit(1);
}
