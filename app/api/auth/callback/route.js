export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response(
      `<h1>Token generado ❌</h1><p>No llegó el parámetro <code>code</code>.</p>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.ML_CLIENT_ID,
    client_secret: process.env.ML_CLIENT_SECRET,
    code,
    redirect_uri: process.env.ML_REDIRECT_URI,
  });

  try {
    const resp = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await resp.json();

    // Muestra el error real si falla
    if (!resp.ok) {
      console.error('TOKEN ERROR', resp.status, data);
      return new Response(
        `
        <h1>Token generado ❌</h1>
        <p><strong>Error ${resp.status}</strong></p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <hr/>
        <p>Verifica que <code>ML_REDIRECT_URI</code> coincida EXACTO en:</p>
        <ul>
          <li>Tu archivo <code>.env.local</code></li>
          <li>Developers ML &rarr; Redirect URIs</li>
        </ul>
        `,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const html = `
      <h1>Token generado ✅</h1>
      <p><strong>access_token:</strong> ${data.access_token ?? 'undefined'}</p>
      <p><strong>expires_in:</strong> ${data.expires_in ?? 'undefined'} segundos</p>
      <p><strong>refresh_token:</strong> ${data.refresh_token ?? 'undefined'}</p>
      <pre>ML_REFRESH_TOKEN=${data.refresh_token ?? ''}</pre>
      <p>Agrega esa línea a tu <code>.env.local</code></p>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error('TOKEN EXCEPTION', e);
    return new Response(
      `<h1>Token generado ❌</h1><pre>${String(e)}</pre>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
