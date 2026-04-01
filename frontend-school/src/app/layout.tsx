"use client";
import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}

function NavBar() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) return null;

  const links = [
    { href: '/',             label: 'Professeurs', icon: '👤' },
    { href: '/matieres',     label: 'Matières',    icon: '📚' },
    { href: '/attributions', label: 'Attributions', icon: '🔗' },
  ];

  return (
    <nav style={{
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
      <div style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 20px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}>🎓</div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '18px',
            color: '#f0f4ff',
            letterSpacing: '-0.01em',
          }}>School<span style={{ color: '#3b82f6' }}>Manager</span></span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {links.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                color: isActive ? '#f0f4ff' : '#8899bb',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#f0f4ff';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.07)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#8899bb';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span className="nav-label">{label}</span>
                {isActive && (
                  <span style={{
                    width: '4px', height: '4px',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    boxShadow: '0 0 6px #3b82f6',
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .nav-label { display: none; }
        }
      `}</style>
    </nav>
  );
}
