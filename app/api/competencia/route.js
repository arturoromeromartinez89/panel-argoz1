// app/api/competencia/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const limit = Number(searchParams.get('limit') || 20);

    if (!q) {
      return Response.json({ error: 'missing q' }, { status: 400 });
    }

    const url = `https://api.mercadolibre.com/sites/MLM/search?q=${encodeURIComponent(q)}&limit=${limit}`;

    const mlRes = await fetch(url, {
      // Un UA ayuda a pasar algunos filtros del WAF
      headers: { 'User-Agent': 'panel-argoz/1.0' },
      // ¡IMPORTANTE! Esta llamada la hace el servidor (no el browser), así evitamos CORS
      cache: 'no-store',
    });

    if (!mlRes.ok) {
      const txt = await mlRes.text();
      return new Response(txt, { status: mlRes.status });
    }

    const data = await mlRes.json();

    return Response.json({
      query: q,
      total: data.paging?.total ?? 0,
      results: (data.results || []).map((r) => ({
        id: r.id,
        title: r.title,
        price: r.price,
        currency_id: r.currency_id,
        permalink: r.permalink,
        seller_id: r.seller?.id ?? null,
        seller: r.seller?.nickname ?? null,
        thumbnail: r.thumbnail,
        shipping_free: r.shipping?.free_shipping ?? false,
        sold_quantity: r.sold_quantity ?? null,
        available_quantity: r.available_quantity ?? null,
        category_id: r.category_id ?? null,
      })),
    });
  } catch (e) {
    console.error('API /competencia error', e);
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}
