// app/layout.js
import './globals.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

export const metadata = {
  title: 'Panel Argoz',
  description: 'Dashboard operativo de Argoz',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
          background: '#0b1220',
          color: '#e5e7eb',
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gridTemplateRows: '64px 1fr',
          gridTemplateAreas: `
            "sidebar topbar"
            "sidebar main"
          `,
        }}
      >
        <aside style={{ gridArea: 'sidebar', borderRight: '1px solid #1f2937' }}>
          <Sidebar />
        </aside>

        <header style={{ gridArea: 'topbar', borderBottom: '1px solid #1f2937' }}>
          <Topbar />
        </header>

        <main style={{ gridArea: 'main', padding: '24px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
