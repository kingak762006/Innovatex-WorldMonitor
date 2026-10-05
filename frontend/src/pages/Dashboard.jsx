import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../lib/mockApi';
import { SEVERITY_COLORS } from '../lib/cvss';
import Card from '../components/common/Card';
import Donut from '../components/common/Donut';
import Badge from '../components/common/Badge';
import SeverityBadge from '../components/findings/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { STRATEGIC_CHOKEPOINTS, COMMODITIES_RADAR, COUNTRY_INSTABILITY_INDEX } from '../data/worldMonitorData';

export default function Dashboard() {
  const { user } = useAuth();
  const [findings, setFindings] = useState([]);

  useEffect(() => {
    assessmentApi.listFindings().then(setFindings);
  }, []);

  const bySeverity = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {});

  const donut = Object.entries(bySeverity).map(([sev, count]) => ({
    label: sev,
    value: count,
    color: SEVERITY_COLORS[sev],
  }));

  const maxRisk = findings.reduce((m, f) => Math.max(m, f.cvss.score ?? 0), 0);
  const criticalChokepoints = STRATEGIC_CHOKEPOINTS.filter((c) => c.threatLevel === 'critical' || c.threatLevel === 'high');

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* ─── Greeting & Meta ────────────────────────────────────────── */}
      <div className="row row--between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Welcome back, {user?.fullName?.split(' ')[0] ?? user?.username}</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Problem Statement ID <code>26163</code> — Security Assessment &amp; Situational Intelligence Workbench for{' '}
            <a href="https://www.worldmonitor.app" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
              worldmonitor.app
            </a>.
          </p>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <Link to="/operations-map" className="btn" style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}>
            🌐 Launch Operations Map
          </Link>
          <Link to="/document-screening" className="btn" style={{ background: 'var(--bg-2)', color: 'var(--fg-0)' }}>
            🪪 AI Document Screening
          </Link>
        </div>
      </div>

      {/* ─── Global Intelligence & Security Metrics ─────────────────── */}
      <div className="grid grid--4">
        <div className="stat">
          <div className="stat__label">Security Findings</div>
          <div className="stat__value">{findings.length}</div>
          <div className="stat__sub">12 reproducible sandbox labs</div>
        </div>
        <div className="stat">
          <div className="stat__label">Highest CVSS</div>
          <div className="stat__value" style={{ color: SEVERITY_COLORS.critical }}>
            {maxRisk.toFixed(1)}
          </div>
          <div className="stat__sub">CVSS v3.1 Base Metric</div>
        </div>
        <div className="stat">
          <div className="stat__label">Monitored Chokepoints</div>
          <div className="stat__value">{STRATEGIC_CHOKEPOINTS.length}</div>
          <div className="stat__sub">{criticalChokepoints.length} critical / high threat alerts</div>
        </div>
        <div className="stat">
          <div className="stat__label">Peak Instability (CII)</div>
          <div className="stat__value" style={{ color: 'var(--critical)' }}>
            {COUNTRY_INSTABILITY_INDEX[0]?.ciiScore}
          </div>
          <div className="stat__sub">{COUNTRY_INSTABILITY_INDEX[0]?.country} (Sovereign Alert)</div>
        </div>
      </div>

      {/* ─── Real-Time World Monitor Strategic Threat Feed ──────────── */}
      <Card title="Live World Monitor Strategic Watch &amp; Chokepoint Alerts">
        <div className="grid grid--3">
          {criticalChokepoints.slice(0, 3).map((chk) => (
            <div
              key={chk.id}
              style={{
                padding: 14,
                background: 'var(--bg-2)',
                borderRadius: 'var(--radius-s)',
                borderLeft: `3px solid ${chk.threatLevel === 'critical' ? 'var(--critical)' : 'var(--high)'}`,
              }}
            >
              <div className="row row--between" style={{ marginBottom: 6 }}>
                <strong style={{ fontSize: 13 }}>{chk.name}</strong>
                <Badge
                  text={chk.threatLevel.toUpperCase()}
                  color={chk.threatLevel === 'critical' ? 'var(--critical)' : 'var(--high)'}
                />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-1)', marginBottom: 8, lineHeight: 1.4 }}>
                {chk.details}
              </div>
              <div className="row row--between" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>
                <span>FLOW: {chk.dailyFlow.split('/')[0]}</span>
                <span>RISK: {chk.riskScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Findings Breakdown & Quick Navigation ─────────────────── */}
      <div className="grid grid--2">
        <Card title="Vulnerability Breakdown by Severity">
          {donut.length ? <Donut data={donut} /> : <div className="muted small">No findings loaded.</div>}
        </Card>

        <Card title="Workbench Direct Actions">
          <div className="col" style={{ gap: 10 }}>
            <Link className="btn" to="/operations-map" style={{ padding: 10 }}>
              🌐 <strong>Operations Map:</strong> Explore 13 Chokepoints, Subsea Cables &amp; AI Clusters
            </Link>
            <Link className="btn" to="/document-screening" style={{ padding: 10 }}>
              🪪 <strong>AI Document Screening:</strong> Verhoeff Algorithm &amp; Biometric Verification
            </Link>
            <Link className="btn" to="/labs" style={{ padding: 10 }}>
              ⚗ <strong>Interactive Lab Bench:</strong> Test 12 Real-Time Exploits &amp; Patches
            </Link>
            <Link className="btn btn--ghost" to="/report" style={{ padding: 10 }}>
              ❐ <strong>Executive Audit Report:</strong> View CVSS Ratings &amp; Remediation Roadmap
            </Link>
          </div>
        </Card>
      </div>

      {/* ─── Top Security Risks Table ───────────────────────────────── */}
      <Card title="Prioritized Risk Matrix (Problem Statement ID 26163)">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vulnerability Title</th>
              <th>Affected Surface</th>
              <th>Severity</th>
              <th>CVSS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[...findings]
              .sort((a, b) => (b.cvss.score ?? 0) - (a.cvss.score ?? 0))
              .slice(0, 6)
              .map((f) => (
                <tr key={f.id}>
                  <td><code>{f.id}</code></td>
                  <td>
                    <Link to={`/findings?id=${f.id}`} style={{ fontWeight: 600 }}>
                      {f.title}
                    </Link>
                  </td>
                  <td style={{ fontSize: 11.5, color: 'var(--fg-2)', maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {f.affectedComponent}
                  </td>
                  <td>
                    <SeverityBadge severity={f.severity} score={f.cvss.score} />
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {f.cvss.score?.toFixed(1)}
                  </td>
                  <td>
                    <Link to={`/labs/${f.labId}`} className="btn" style={{ fontSize: 11, padding: '3px 8px' }}>
                      Open Lab ⚗
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}