// app/components/Topbar.jsx
export default function Topbar() {
  return (
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}
    >
      <div>Panel Argoz</div>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>v0.1.0</div>
    </div>
  );
}
