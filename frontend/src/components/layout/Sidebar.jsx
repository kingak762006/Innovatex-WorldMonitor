import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FINDINGS } from '../../data/findings';

const INTEL_LINKS = [
  { to: '/dashboard', icon: '▦', label: 'Executive Overview' },
  { to: '/operations-map', icon: '🌐', label: 'Operations Map', badge: 'LIVE' },
  { to: '/document-screening', icon: '🪪', label: 'AI Identity Screening', badge: 'AI' },
];

const SECURITY_LINKS = [
  { to: '/findings', icon: '⚑', label: 'Findings Catalogue', count: FINDINGS.length },
  { to: '/labs', icon: '⚗', label: 'Lab Bench', count: 12 },
  { to: '/report', icon: '❐', label: 'Executive Report' },
  { to: '/scope', icon: '⛨', label: 'Scope & RoE' },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">
          <span className="sidebar__brand-dot" />
          World Monitor
        </div>
        <div className="sidebar__brand-sub">Intelligence &amp; Security Workbench</div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__group-label">Global Intelligence</div>
        {INTEL_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
          >
            <span className="nav-item__icon">{l.icon}</span>
            <span>{l.label}</span>
            {l.badge && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 9.5,
                  fontWeight: 700,
                  background: l.badge === 'LIVE' ? 'rgba(255, 77, 109, 0.2)' : 'rgba(79, 140, 255, 0.2)',
                  color: l.badge === 'LIVE' ? 'var(--critical)' : 'var(--accent)',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontFamily: 'var(--mono)',
                }}
              >
                {l.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="sidebar__group-label" style={{ marginTop: 14 }}>Security Assessment</div>
        {SECURITY_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
          >
            <span className="nav-item__icon">{l.icon}</span>
            <span>{l.label}</span>
            {l.count != null && <span className="nav-item__count">{l.count}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div><strong>PS ID 26163</strong></div>
        <div style={{ color: 'var(--fg-2)', marginTop: 2 }}>
          {user ? `Signed in as ${user.username} (${user.role})` : 'Not signed in'}
        </div>
        <div style={{ marginTop: 6, fontSize: 10.5, color: 'var(--fg-3)' }}>
          Authorised workbench environment.
        </div>
      </div>
    </aside>
  );
}