import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  STRATEGIC_CHOKEPOINTS,
  SUBSEA_CABLES,
  AI_DATACENTERS,
  NUCLEAR_FACILITIES,
  STRATEGIC_BASES,
  COUNTRY_INSTABILITY_INDEX,
  COMMODITIES_RADAR,
  LIVE_OSINT_WIRE,
} from '../data/worldMonitorData';

export default function OperationsMap() {
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [selectedVariant, setSelectedVariant] = useState('full');
  const [activeItem, setActiveItem] = useState(STRATEGIC_CHOKEPOINTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [radarFilter, setRadarFilter] = useState('all');

  // Convert lat/lng into SVG coordinates (Equirectangular projection)
  // lat: 90 (top) to -90 (bottom) -> y: 0 to 500
  // lng: -180 (left) to 180 (right) -> x: 0 to 1000
  const projectCoords = (lat, lng) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  const filteredChokepoints = useMemo(() => {
    if (selectedVariant === 'tech') return [];
    return STRATEGIC_CHOKEPOINTS.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedVariant]);

  const filteredCables = useMemo(() => {
    if (selectedVariant === 'energy') return [];
    return SUBSEA_CABLES.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.endpoints.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedVariant]);

  const filteredDatacenters = useMemo(() => {
    if (selectedVariant === 'energy') return [];
    return AI_DATACENTERS.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedVariant]);

  const filteredNuclear = useMemo(() => {
    if (selectedVariant === 'tech') return [];
    return NUCLEAR_FACILITIES.filter((n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedVariant]);

  const filteredBases = useMemo(() => {
    if (selectedVariant === 'tech') return [];
    return STRATEGIC_BASES.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedVariant]);

  const threatColor = (level) => {
    switch (level) {
      case 'critical': return 'var(--critical)';
      case 'high': return 'var(--high)';
      case 'elevated': return 'var(--medium)';
      case 'moderate': return 'var(--info)';
      default: return 'var(--ok)';
    }
  };

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* ─── Header & Ticker ────────────────────────────────────────── */}
      <div className="row row--between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--critical)',
              boxShadow: '0 0 8px var(--critical)',
              animation: 'pulse 1.8s infinite',
            }} />
            <h1 style={{ margin: 0 }}>World Monitor — Real-Time Operations Map</h1>
          </div>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Aggregated intelligence dataset from <code>worldmonitor.app</code> (Problem Statement ID 26163).
          </p>
        </div>

        {/* Variant Selector */}
        <div className="row" style={{ gap: 6, background: 'var(--bg-2)', padding: 4, borderRadius: 'var(--radius-s)' }}>
          {['full', 'energy', 'tech', 'geopolitics'].map((variant) => (
            <button
              key={variant}
              onClick={() => setSelectedVariant(variant)}
              className="btn"
              style={{
                fontSize: 11,
                padding: '4px 10px',
                background: selectedVariant === variant ? 'var(--accent)' : 'transparent',
                borderColor: selectedVariant === variant ? 'var(--accent)' : 'transparent',
                color: selectedVariant === variant ? '#fff' : 'var(--fg-2)',
              }}
            >
              {variant.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Live Market & Geopolitical Commodities Radar ──────────── */}
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        padding: '10px 14px',
        background: 'var(--bg-1)',
        border: '1px solid var(--line-soft)',
        borderRadius: 'var(--radius-m)',
      }}>
        {COMMODITIES_RADAR.map((item) => (
          <div key={item.symbol} style={{ flexShrink: 0, minWidth: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)' }}>
              <span>{item.symbol}</span>
              <span style={{ color: item.change.startsWith('+') ? 'var(--critical)' : 'var(--ok)' }}>
                {item.change}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)' }}>
              {item.price}
            </div>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {item.name}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Tactical Map Viewport ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16 }}>
        <Card title="Global Situational Surface (Equirectangular Projection)" flush>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 16px',
            borderBottom: '1px solid var(--line-soft)',
            background: 'var(--bg-2)',
            flexWrap: 'wrap',
          }}>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Layers' },
                { id: 'chokepoints', label: `Chokepoints (${filteredChokepoints.length})` },
                { id: 'cables', label: `Cables (${filteredCables.length})` },
                { id: 'datacenters', label: `AI Clusters (${filteredDatacenters.length})` },
                { id: 'nuclear', label: `Nuclear (${filteredNuclear.length})` },
                { id: 'bases', label: `Military (${filteredBases.length})` },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className="btn"
                  style={{
                    fontSize: 11.5,
                    padding: '3px 9px',
                    background: selectedLayer === layer.id ? 'var(--accent-soft)' : 'var(--bg-1)',
                    borderColor: selectedLayer === layer.id ? 'var(--accent)' : 'var(--line)',
                    color: selectedLayer === layer.id ? '#cfe0ff' : 'var(--fg-1)',
                  }}
                >
                  {layer.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search assets, straits, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-0)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-s)',
                padding: '4px 10px',
                color: 'var(--fg-0)',
                fontSize: 12,
                width: 200,
              }}
            />
          </div>

          {/* Interactive Tactical SVG Map */}
          <div style={{ position: 'relative', width: '100%', height: 480, background: '#070b12', overflow: 'hidden' }}>
            <svg
              viewBox="0 0 1000 500"
              style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
            >
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(79, 140, 255, 0.15)" />
                  <stop offset="100%" stopColor="rgba(79, 140, 255, 0)" />
                </radialGradient>
              </defs>

              {/* Background Grid & Equator / Prime Meridian */}
              <rect width="1000" height="500" fill="url(#grid)" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(79, 140, 255, 0.2)" strokeDasharray="3 3" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(79, 140, 255, 0.2)" strokeDasharray="3 3" />

              {/* Simplified World Coastline Polygons */}
              <g fill="#141d2f" stroke="#1d2a44" strokeWidth="1">
                {/* North America */}
                <path d="M 120 70 L 280 80 L 320 130 L 280 180 L 250 250 L 220 230 L 160 210 L 120 130 Z" />
                {/* South America */}
                <path d="M 270 260 L 340 280 L 370 340 L 320 440 L 280 430 L 260 330 Z" />
                {/* Europe */}
                <path d="M 460 80 L 580 80 L 560 160 L 480 180 L 460 120 Z" />
                {/* Africa */}
                <path d="M 470 190 L 590 190 L 610 280 L 570 410 L 510 390 L 460 270 Z" />
                {/* Asia */}
                <path d="M 590 80 L 880 90 L 890 200 L 780 270 L 680 250 L 600 170 Z" />
                {/* Australia */}
                <path d="M 780 340 L 890 340 L 880 420 L 790 410 Z" />
              </g>

              {/* ─── Subsea Cables Paths (Arcs) ────────────────────────── */}
              {(selectedLayer === 'all' || selectedLayer === 'cables') && (
                <g stroke="#3ddc97" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 2">
                  {/* MAREA */}
                  <path d="M 288 147 Q 380 130 488 148" fill="none" />
                  {/* 2Africa */}
                  <path d="M 488 148 C 450 240 500 390 570 380" fill="none" />
                  {/* SEA-ME-WE 6 */}
                  <path d="M 788 246 C 680 270 600 230 488 148" fill="none" />
                  {/* Dunant */}
                  <path d="M 288 147 Q 380 120 494 120" fill="none" />
                </g>
              )}

              {/* ─── Chokepoints (Red / Amber Diamonds) ────────────────── */}
              {(selectedLayer === 'all' || selectedLayer === 'chokepoints') &&
                filteredChokepoints.map((item) => {
                  const { x, y } = projectCoords(item.lat, item.lng);
                  const isSelected = activeItem?.id === item.id;
                  const color = threatColor(item.threatLevel);
                  return (
                    <g
                      key={item.id}
                      onClick={() => setActiveItem({ ...item, layerType: 'Chokepoint' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={x} cy={y} r={isSelected ? 14 : 9} fill={color} fillOpacity="0.25">
                        <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <polygon
                        points={`${x},${y - 6} ${x + 6},${y} ${x},${y + 6} ${x - 6},${y}`}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x={x + 10}
                        y={y + 4}
                        fill="#e8edf7"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="var(--sans)"
                        style={{ pointerEvents: 'none', textShadow: '0 1px 4px #000' }}
                      >
                        {item.name}
                      </text>
                    </g>
                  );
                })}

              {/* ─── AI Datacenters (Cyan Squares) ────────────────────── */}
              {(selectedLayer === 'all' || selectedLayer === 'datacenters') &&
                filteredDatacenters.map((item) => {
                  const { x, y } = projectCoords(item.lat, item.lng);
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <g
                      key={item.id}
                      onClick={() => setActiveItem({ ...item, layerType: 'AI Datacenter' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={x - 4}
                        y={y - 4}
                        width="8"
                        height="8"
                        fill="var(--low)"
                        stroke="#fff"
                        strokeWidth={isSelected ? 2 : 0.8}
                      />
                      <text
                        x={x + 8}
                        y={y + 3}
                        fill="var(--low)"
                        fontSize="9"
                        fontFamily="var(--mono)"
                        style={{ pointerEvents: 'none', textShadow: '0 1px 3px #000' }}
                      >
                        {item.city}
                      </text>
                    </g>
                  );
                })}

              {/* ─── Nuclear Sites (Yellow Triangles) ─────────────────── */}
              {(selectedLayer === 'all' || selectedLayer === 'nuclear') &&
                filteredNuclear.map((item) => {
                  const { x, y } = projectCoords(item.lat, item.lng);
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <g
                      key={item.id}
                      onClick={() => setActiveItem({ ...item, layerType: 'Nuclear Facility' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <polygon
                        points={`${x},${y - 6} ${x + 6},${y + 4} ${x - 6},${y + 4}`}
                        fill="var(--medium)"
                        stroke="#000"
                        strokeWidth={isSelected ? 1.5 : 0.6}
                      />
                    </g>
                  );
                })}

              {/* ─── Military Bases (White Stars) ─────────────────────── */}
              {(selectedLayer === 'all' || selectedLayer === 'bases') &&
                filteredBases.map((item) => {
                  const { x, y } = projectCoords(item.lat, item.lng);
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <g
                      key={item.id}
                      onClick={() => setActiveItem({ ...item, layerType: 'Military Base' })}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={x} cy={y} r={isSelected ? 6 : 4} fill="#fff" stroke="var(--accent)" strokeWidth="1.5" />
                    </g>
                  );
                })}
            </svg>

            {/* Tactical Watermark HUD */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 14,
              fontSize: 10,
              fontFamily: 'var(--mono)',
              color: 'var(--fg-3)',
              background: 'rgba(11, 15, 23, 0.75)',
              padding: '4px 8px',
              borderRadius: 4,
            }}>
              SURFACE: DUAL-ENGINE | MERC/EQUIRECT | AIS STREAM 156.800MHz | LATENCY: 28ms
            </div>
          </div>
        </Card>

        {/* ─── Active Asset Inspector Drawer ────────────────────────── */}
        <div className="col" style={{ gap: 16 }}>
          {activeItem ? (
            <Card title={`Target Telemetry: ${activeItem.name || activeItem.city || activeItem.id}`}>
              <div className="col" style={{ gap: 12 }}>
                <div className="row row--between">
                  <Badge
                    text={activeItem.threatLevel || activeItem.status || activeItem.tier || 'ACTIVE'}
                    color={threatColor(activeItem.threatLevel || 'moderate')}
                  />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
                    {activeItem.lat?.toFixed(2)}°N, {activeItem.lng?.toFixed(2)}°E
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.4 }}>
                  {activeItem.details || activeItem.notes || activeItem.connectivity || activeItem.endpoints}
                </div>

                <hr style={{ margin: '4px 0' }} />

                <div className="col" style={{ gap: 8, fontSize: 12 }}>
                  {activeItem.dailyFlow && (
                    <div className="row row--between">
                      <span className="muted">Daily Throughput:</span>
                      <strong className="mono">{activeItem.dailyFlow}</strong>
                    </div>
                  )}
                  {activeItem.aisCongestion && (
                    <div className="row row--between">
                      <span className="muted">AIS Congestion:</span>
                      <span>{activeItem.aisCongestion}</span>
                    </div>
                  )}
                  {activeItem.powerMw && (
                    <div className="row row--between">
                      <span className="muted">Grid Power Draw:</span>
                      <strong className="mono">{activeItem.powerMw} MW</strong>
                    </div>
                  )}
                  {activeItem.gpuCapacity && (
                    <div className="row row--between">
                      <span className="muted">GPU Fleet:</span>
                      <span className="mono">{activeItem.gpuCapacity}</span>
                    </div>
                  )}
                  {activeItem.radiationCpm && (
                    <div className="row row--between">
                      <span className="muted">Radiation Watch:</span>
                      <span className="mono" style={{ color: 'var(--medium)' }}>{activeItem.radiationCpm}</span>
                    </div>
                  )}
                  {activeItem.riskScore != null && (
                    <div className="row row--between">
                      <span className="muted">Risk Index:</span>
                      <strong style={{
                        color: activeItem.riskScore > 70 ? 'var(--critical)' : 'var(--ok)',
                        fontSize: 14,
                        fontFamily: 'var(--mono)',
                      }}>
                        {activeItem.riskScore}/100
                      </strong>
                    </div>
                  )}
                </div>

                {/* Direct Action Link into Security Labs */}
                <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-2)', borderRadius: 'var(--radius-s)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
                    SECURITY BENCH CORRELATION
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-2)', marginBottom: 10 }}>
                    Monitor endpoint <code>/api/vuln/monitors?name={encodeURIComponent(activeItem.name || '')}</code> is under active vulnerability assessment.
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <Link
                      to={`/labs/sql_injection?target=${encodeURIComponent(activeItem.name || '')}`}
                      className="btn"
                      style={{ fontSize: 11, flex: 1, textAlign: 'center' }}
                    >
                      Audit SQL Query
                    </Link>
                    <Link
                      to={`/labs/xss?payload=${encodeURIComponent(activeItem.name || '')}`}
                      className="btn"
                      style={{ fontSize: 11, flex: 1, textAlign: 'center' }}
                    >
                      Test XSS Sink
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Inspector">
              <p className="muted">Select any strategic coordinate on the map to inspect live telemetry.</p>
            </Card>
          )}

          {/* Country Instability Index Snapshot */}
          <Card title="Country Instability (CII Top Riskiest)">
            <div className="col" style={{ gap: 6 }}>
              {COUNTRY_INSTABILITY_INDEX.slice(0, 5).map((c) => (
                <div key={c.code} className="row row--between" style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span>{c.flag}</span>
                    <span style={{ fontWeight: 600 }}>{c.country}</span>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="mono" style={{ color: threatColor(c.tier), fontWeight: 700 }}>
                      {c.ciiScore}
                    </span>
                    <span className="muted" style={{ fontSize: 10 }}>({c.trend})</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ─── Live OSINT Wire Feed ─────────────────────────────────── */}
      <Card title="Live Multi-Source OSINT Stream (578+ Aggregated Feeds)">
        <div className="grid grid--auto" style={{ gap: 12 }}>
          {LIVE_OSINT_WIRE.map((wire) => (
            <div
              key={wire.id}
              style={{
                padding: 12,
                background: 'var(--bg-2)',
                borderRadius: 'var(--radius-s)',
                borderLeft: `3px solid ${threatColor(wire.urgency)}`,
              }}
            >
              <div className="row row--between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{wire.source}</span>
                <span style={{ fontSize: 10, color: 'var(--fg-2)' }}>{wire.timestamp}</span>
              </div>
              <h4 style={{ fontSize: 12.5, margin: '0 0 6px' }}>{wire.title}</h4>
              <p style={{ fontSize: 11.5, color: 'var(--fg-1)', margin: 0 }}>{wire.body}</p>
              <div className="row" style={{ gap: 4, marginTop: 8 }}>
                {wire.tags.map((t) => (
                  <span key={t} style={{ fontSize: 9.5, background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4, color: 'var(--fg-2)' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
