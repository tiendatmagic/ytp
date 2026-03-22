const http = require('http');

console.log('Waiting 5s for dev server...');
setTimeout(() => {
  console.log('Sending API request...');
  http.get('http://localhost:3000/api/stream?id=dQw4w9WgXcQ', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Result:', data));
  }).on('error', err => console.error('Fetch error:', err.message));
}, 5000);
