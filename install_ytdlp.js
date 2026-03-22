const { execSync } = require('child_process');
try {
  console.log('Installing youtube-dl-exec without python...');
  execSync('set YOUTUBE_DL_SKIP_PYTHON_CHECK=1 && npm install youtube-dl-exec', { stdio: 'inherit' });
  console.log('Complete.');
} catch (error) {
  process.exit(1);
}
