// app/api/auth/callback/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return new Response(
      <h1>Token generado ❌</h1><p>No llegó el parámetro <code>code</code>.</p>,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const client_id = process.env.ML_CLIENT_ID;
  const client_secret = process.env.ML_CLIENT_SECRET;
  const redirect_uri = process.env.ML_REDIRECT_URI;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id,
    client_secret,
    code,
    redirect_uri,
  });

  const r = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  const data = await r.json();

  const html = `
    <h1>Token generado ${r.ok ? '✅' : '❌'}</h1>
    <p><b>access_token:</b> ${data.access_token ?? 'undefined'}</p>
    <p><b>expires_in:</b> ${data.expires_in ?? 'undefined'} segundos</p>
    <p><b>refresh_token:</b> ${data.refresh_token ?? 'undefined'}</p>
    <pre>ML_REFRESH_TOKEN=${data.refresh_token ?? ''}</pre>
    <p>Agrega esa línea a tu <code>.env.local</code> (local) o a *Vercel → Environment Variables* (producción).</p>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}