// app/api/auth/authorize/route.js
export async function GET() {
  const clientId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new Response(
      'Faltan variables ML_CLIENT_ID o ML_REDIRECT_URI',
      { status: 500 }
    );
  }

  const url =
    https://auth.mercadolibre.com.mx/authorization +
    ?response_type=code +
    &client_id=${encodeURIComponent(clientId)} +
    &redirect_uri=${encodeURIComponent(redirectUri)};

  return Response.redirect(url);
}