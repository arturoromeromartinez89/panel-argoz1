// lib/meli.js

// --- Memoria simple para cachear access_token y evitar pedirlo en cada request ---
let _accessToken = null;
let _accessTokenExpiresAt = 0;

// Intercambia refresh_token -> access_token
export async function getAccessTokenFromRefresh() {
  // Variables desde .env.local
  const client_id = process.env.ML_CLIENT_ID;
  const client_secret = process.env.ML_CLIENT_SECRET;
  const refresh_token = process.env.ML_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    throw new Error('Faltan variables ML_CLIENT_ID / ML_CLIENT_SECRET / ML_REFRESH_TOKEN en .env.local');
  }

  // Si el token en memoria sigue vigente, úsalo
  const now = Math.floor(Date.now() / 1000);
  if (_accessToken && _accessTokenExpiresAt - 30 > now) {
    return _accessToken;
  }

  const body = new URLSearchParams();
  body.append('grant_type', 'refresh_token');
  body.append('client_id', client_id);
  body.append('client_secret', client_secret);
  body.append('refresh_token', refresh_token);

  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Error al refrescar token: ' + txt);
  }

  const data = await res.json();
  _accessToken = data.access_token;
  _accessTokenExpiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 900);
  return _accessToken;
}

// Helper para GET a la API ML
async function mlGet(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error GET ${url}: ${txt}`);
  }
  return res.json();
}

// --- Datos del usuario autenticado ---
export async function getUserInfo(token) {
  return mlGet('https://api.mercadolibre.com/users/me', token);
}

// Items de un usuario (ids)
export async function getUserItemIds(userId, token) {
  const url = `https://api.mercadolibre.com/users/${userId}/items/search?status=active&limit=50`;
  const data = await mlGet(url, token);
  return data.results || [];
}

// Detalles de items por IDs
export async function getItemsByIds(ids = [], token) {
  if (!ids.length) return [];
  // La API permite /items?ids=id1,id2
  const url = `https://api.mercadolibre.com/items?ids=${ids.slice(0, 20).join(',')}`; // 20 por batch
  const data = await mlGet(url, token);
  // data viene como [{code, body}, ...]
  return data
    .map((x) => x.body)
    .filter(Boolean)
    .map(normalizeItem);
}

// Búsqueda en el sitio (ej: MLM para México)
export async function searchItems({ q, site = 'MLM', limit = 15 } = {}, token) {
  const url = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(q)}&limit=${limit}`;
  const data = await mlGet(url, token);
  const items = (data.results || []).map(normalizeItem);
  return items;
}

// Normaliza el item para comparar en frontend
function normalizeItem(it) {
  if (!it) return null;
  return {
    id: it.id,
    title: it.title,
    price: it.price ?? it.prices?.prices?.[0]?.amount ?? null,
    currency_id: it.currency_id || it.prices?.prices?.[0]?.currency_id || 'MXN',
    permalink: it.permalink,
    thumbnail: it.thumbnail?.replace('-I.jpg', '-O.jpg') || null,
    sold_quantity: it.sold_quantity ?? null,
    available_quantity: it.available_quantity ?? null,
    seller_id: it.seller_id ?? it.seller_id?.id ?? null,
    shipping_free: it.shipping?.free_shipping ?? false,
    listing_type_id: it.listing_type_id ?? null,
    condition: it.condition ?? null,
    seller_reputation: it?.seller_address
      ? undefined
      : undefined, // (Opcional: puedes enriquecer con /users/{seller_id})
  };
}

// Orquesta: trae tu user, tus items y competidores por query
export async function getComparisonData({ q }) {
  const token = await getAccessTokenFromRefresh();

  const me = await getUserInfo(token);
  const myItemIds = await getUserItemIds(me.id, token);
  const myItems = await getItemsByIds(myItemIds.slice(0, 20), token);

  const competitors = await searchItems({ q, site: 'MLM', limit: 20 }, token);

  return {
    me: { id: me.id, nickname: me.nickname },
    myItems,
    competitors,
  };
}
