const ytdl = require('@distube/ytdl-core');

async function test() {
  try {
    const id = 'dQw4w9WgXcQ'; // Rick roll
    const info = await ytdl.getInfo(id);
    console.log('Formats found:', info.formats.length);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    console.log('Audio formats:', audioFormats.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
