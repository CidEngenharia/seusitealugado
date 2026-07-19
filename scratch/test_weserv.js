import fetch from 'node-fetch';

async function test() {
  const url = 'https://images.weserv.nl/?url=https://www.instagram.com/p/DZ7bsdJIvsa/media/?size=l';
  try {
    const res = await fetch(url);
    console.log('Weserv Proxy status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
