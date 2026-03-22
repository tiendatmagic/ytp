async function test() {
  try {
    const res = await fetch('https://api.cobalt.tools', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        isAudioOnly: true
      })
    });
    if(!res.ok) throw new Error('status ' + res.status);
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e.message);
  }
}
test();
