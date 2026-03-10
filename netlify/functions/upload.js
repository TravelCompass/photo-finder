exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { imageData, mimeType, dest, hotel, index } = body;

    if (!imageData || !dest || !hotel) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const key = `${dest}/${hotel}-${index}.${ext}`;

    const SITE_ID = 'de6b2431-a4ae-438c-b42a-4aa7be5da359';
    const TOKEN = 'nfp_9gcq3fUwGW5JaUR9ZjqUsDaCRv7pKVXw356c';

    const buffer = Buffer.from(imageData, 'base64');

    const blobUrl = `https://api.netlify.com/api/v1/blobs/${SITE_ID}/site:photos/${encodeURIComponent(key)}`;

    const res = await fetch(blobUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': mimeType || 'image/jpeg'
      },
      body: buffer
    });

    const resText = await res.text();

    if (!res.ok) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: resText || ('HTTP ' + res.status) })
      };
    }

    const publicUrl = `https://api.netlify.com/api/v1/blobs/${SITE_ID}/site:photos/${encodeURIComponent(key)}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: publicUrl, key })
    };

  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
