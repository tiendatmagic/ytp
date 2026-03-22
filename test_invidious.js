async function test() {
  const instances = [
    'https://invidious.private.coffee',
    'https://invidious.fdn.fr',
    'https://inv.tux.pizza'
  ];
  
  for (const inst of instances) {
    try {
      console.log('Testing', inst);
      const res = await fetch(`${inst}/api/v1/videos/dQw4w9WgXcQ`);
      if (res.ok) {
        const data = await res.json();
        const audioFormats = data.adaptiveFormats.filter(f => f.type.startsWith('audio'));
        console.log('Success!', audioFormats[0].url.substring(0, 50) + '...');
        return;
      }
    } catch(e) {}
  }
}
test();
