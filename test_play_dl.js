const play = require('play-dl');

async function test() {
  try {
    const id = 'dQw4w9WgXcQ'; // Rick roll
    const stream = await play.stream('https://www.youtube.com/watch?v=' + id);
    console.log('Stream URL:', stream.url);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
