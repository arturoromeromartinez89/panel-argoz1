// app/api/ml/metrics/route.js
import { NextResponse } from 'next/server';

const ML_OAUTH_URL = 'https://api.mercadolibre.com/oauth/token';

async function refreshAccessToken() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.ML_CLIENT_ID,
    client_secret: process.env.ML_CLIENT_SECRET,
    refresh_token: process.env.ML_REFRESH_TOKEN,
  });

  const res = await fetch(ML_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    // For Next.js edge/runtime quirks
    cache: 'no-store',
  });

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`OAuth refresh failed (${res.status}): ${errTxt}`);
  }

  const data = await res.json();
  // data = { access_token, expires_in, token_type, scope, ... }
  return data.access_token;
}

function todayRangeISO(tzOffsetMinutes = 0) {
  // construye rango de hoy (00:00 a ahora) en ISO
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  // aplica offset si quieres forzar zona horaria
  if (tzOffsetMinutes) {
    start.setMinutes(start.getMinutes() - tzOffsetMinutes);
    now.setMinutes(now.getMinutes() - tzOffsetMinutes);
  }

  return {
    from: start.toISOString().slice(0, 19) + '.000Z',
    to: now.toISOString().slice(0, 19) + '.000Z',
  };
}

async function fetchJSON(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`${url} -> ${res.status} ${errTxt}`);
  }
  return res.json();
}

async function getUserId(token) {
  const me = await fetchJSON('https://api.mercadolibre.com/users/me', token);
  return me.id; // seller id
}

async function countOrdersToday(token, sellerId) {
  const { from, to } = todayRangeISO();
  // Filtra por fecha de creación de la orden (hoy).
  // Puedes ajustar 'order.status=paid' si quieres solo pagadas.
  const url =
    `https://api.mercadolibre.com/orders/search?seller=${sellerId}` +
    `&order.date_created.from=${encodeURIComponent(from)}` +
    `&order.date_created.to=${encodeURIComponent(to)}`;

  const data = await fetchJSON(url, token);
  // data.results es paginado; paging.total trae el total real
  const total = data?.paging?.total ?? (Array.isArray(data?.results) ? data.results.length : 0);
  return total;
}

async function getVisitsToday(token, sellerId) {
  // 1) trae items del seller
  const itemsUrl = `https://api.mercadolibre.com/users/${sellerId}/items/search?search_type=scan&limit=50`;
  const items = await fetchJSON(itemsUrl, token);
  const ids = items?.results?.slice(0, 50) ?? [];

  if (!ids.length) return null;

  // 2) visitas de hoy para esos items (endpoint de visitas por ítems)
  // Nota: endpoint puede variar; si falla, devolvemos null sin romper.
  const { from, to } = todayRangeISO();
  const visitsUrl =
    `https://api.mercadolibre.com/visits/items?ids=${ids.join(',')}` +
    `&date_from=${encodeURIComponent(from)}&date_to=${encodeURIComponent(to)}`;

  try {
    const visits = await fetchJSON(visitsUrl, token);
    // respuesta típica: [{id:'MLM...', total_visits: X}, ...]
    let sum = 0;
    for (const v of Array.isArray(visits) ? visits : []) {
      const n = Number(v?.total_visits ?? v?.total ?? 0);
      if (!Number.isNaN(n)) sum += n;
    }
    return sum;
  } catch {
    // si el endpoint de visitas no está disponible para tu app/país/permiso
    return null;
  }
}

export async function GET() {
  try {
    // 1) access token a partir del refresh
    const accessToken = await refreshAccessToken();

    // 2) tu user/seller id
    const sellerId = await getUserId(accessToken);

    // 3) ventas (órdenes) de hoy
    const ventasHoy = await countOrdersToday(accessToken, sellerId);

    // 4) visitas (si no se puede, null)
    const visitas = await getVisitsToday(accessToken, sellerId);

    // 5) conversión
    const conversion =
      visitas && visitas > 0 ? +( (ventasHoy / visitas) * 100 ).toFixed(1) : null;

    return NextResponse.json({
      ventasHoy,
      visitas,
      conversion,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 }
    );
  }
}
