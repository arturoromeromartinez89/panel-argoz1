// app/page.js
export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/ml/metrics`, {
    cache: 'no-store',
  }).catch(() => null);

  const data = res && res.ok ? await res.json() : null;

  const ventasHoy = data?.ventasHoy ?? 0;
  const visitas = data?.visitas ?? 0;
  const conversion = data?.conversion ?? 0;

  return (
    <main>
      <h1>📊 Dashboard — Panel Argoz</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Ventas de hoy" value={ventasHoy} />
        <StatCard title="Visitas" value={visitas} />
        <StatCard title="Conversión" value={`${conversion}%`} />
      </div>
      <p>Última actualización: {new Date().toLocaleString()}</p>
    </main>
  );
}
