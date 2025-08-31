async function buscar(term) {
  setCargando(true);
  setError(null);
  try {
    const res = await fetch(`/api/competencia?q=${encodeURIComponent(term)}&limit=20`, {
      method: 'GET',
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Error API /competencia: ${res.status} - ${txt}`);
    }
    const data = await res.json();
    setResultados(data.results || []);
  } catch (e) {
    setError(String(e));
  } finally {
    setCargando(false);
  }
}
