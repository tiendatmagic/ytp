const youtubedl = require('youtube-dl-exec');

async function test() {
  try {
    const output = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
      dumpJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    console.log('Success. Formats:', output.formats ? output.formats.length : 0);
  } catch (err) {
    console.error('YTDL ERROR:', err.message);
  }
}
test();
