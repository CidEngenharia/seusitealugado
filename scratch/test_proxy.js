import fetch from 'node-fetch';

async function test() {
  const imageUrl = 'https://www.instagram.com/p/DZ7bsdJIvsa/media/?size=l';
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Fetch status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const arrayBuffer = await res.arrayBuffer();
    console.log('Buffer length:', arrayBuffer.byteLength);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
