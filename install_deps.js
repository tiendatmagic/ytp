const { execSync } = require('child_process');

try {
  console.log('Installing dependencies...');
  execSync('npm install @capacitor/core @capacitor/android @capgo/capacitor-video-player @capacitor/filesystem', { stdio: 'inherit' });
  console.log('Installing dev dependencies...');
  execSync('npm install -D @capacitor/cli', { stdio: 'inherit' });
  console.log('Installation complete.');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}
