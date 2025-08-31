// app/components/Sidebar.jsx
export default function Sidebar() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>ArgozMX</div>
      <nav style={{ display: 'grid', gap: 8 }}>
        <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Dashboard</a>
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Publicaciones</a>
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Órdenes</a>
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Mensajes</a>
        <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Reportes</a>
      </nav>
    </div>
  );
}
