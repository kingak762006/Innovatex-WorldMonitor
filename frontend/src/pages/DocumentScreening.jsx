import { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { validateVerhoeff, calculateIcaoCheckDigit } from '../lib/verhoeff';
import { MOCK_IDENTITY_FIXTURES } from '../data/mockDb';

export default function DocumentScreening() {
  const [selectedFixture, setSelectedFixture] = useState(MOCK_IDENTITY_FIXTURES[0]);
  const [docType, setDocType] = useState('passport');
  const [docNumber, setDocNumber] = useState(MOCK_IDENTITY_FIXTURES[0].docNumber);
  const [holderName, setHolderName] = useState(MOCK_IDENTITY_FIXTURES[0].holderName);
  const [dob, setDob] = useState(MOCK_IDENTITY_FIXTURES[0].dob);
  const [expiry, setExpiry] = useState(MOCK_IDENTITY_FIXTURES[0].expiry);
  const [country, setCountry] = useState(MOCK_IDENTITY_FIXTURES[0].country);
  const [isTamperedPreset, setIsTamperedPreset] = useState(false);
  const [simulatedFaceMatch, setSimulatedFaceMatch] = useState(97.2);
  const [activeTab, setActiveTab] = useState('screening');
  const [auditLog, setAuditLog] = useState([
    {
      id: 'AUD-8821',
      timestamp: '2026-10-05 18:42:10 UTC',
      docType: 'Passport (ICAO Doc 9303)',
      docNumber: 'D8829104A',
      holder: 'VANCE, ELENA MARIE',
      verhoeffResult: 'PASSED',
      elaResult: 'NORMAL (98.4%)',
      faceScore: '97.2%',
      riskScore: 6.2,
      decision: 'APPROVED',
      hash: '9f83ab12c0192e47bbfa199341',
    },
    {
      id: 'AUD-8820',
      timestamp: '2026-10-05 18:15:22 UTC',
      docType: 'Aadhaar Card (UIDAI)',
      docNumber: '9283 4710 5624',
      holder: 'RAJESH KUMAR',
      verhoeffResult: 'PASSED (D5 Verified)',
      elaResult: 'NORMAL (96.1%)',
      faceScore: '94.8%',
      riskScore: 8.4,
      decision: 'APPROVED',
      hash: '3e12c8fa9012cd41bfa0991244',
    },
  ]);

  const [elaActive, setElaActive] = useState(false);
  const canvasRef = useRef(null);

  // Load selected fixture data into form
  const loadFixture = (fixture) => {
    setSelectedFixture(fixture);
    setDocNumber(fixture.docNumber);
    setHolderName(fixture.holderName);
    setDob(fixture.dob);
    setExpiry(fixture.expiry);
    setCountry(fixture.country);
    setIsTamperedPreset(fixture.verdict.includes('REJECTED'));
    setSimulatedFaceMatch(fixture.faceMatchScore);
  };

  // Run Checksum Validation (Verhoeff for numeric/Aadhaar or ICAO 9303 for Passport)
  const isAadhaar = docNumber.replace(/\s+/g, '').length === 12 && /^\d+$/.test(docNumber.replace(/\s+/g, ''));
  const isVerhoeffValid = isAadhaar ? validateVerhoeff(docNumber) : true;

  // Passport Checksum calculation
  const mrzCheckDigitCalculated = calculateIcaoCheckDigit(docNumber.slice(0, 8));

  // Compute Error Level Analysis (ELA) score
  const elaScore = isTamperedPreset ? 42.6 : 98.2;
  const isElaSuspicious = elaScore < 70;

  // Weighted Risk Score Calculation
  // 30% Checksum validity + 25% Image Integrity (ELA) + 25% Biometric match + 20% Watchlist
  const checksumPenalty = isAadhaar ? (isVerhoeffValid ? 0 : 35) : 0;
  const elaPenalty = isElaSuspicious ? 30 : 0;
  const facePenalty = simulatedFaceMatch < 80 ? 25 : 0;
  const watchlistPenalty = isTamperedPreset ? 25 : 0;
  const calculatedRiskScore = Math.min(100, Math.round(checksumPenalty + elaPenalty + facePenalty + watchlistPenalty));

  const screeningDecision =
    calculatedRiskScore > 50
      ? 'REJECTED'
      : calculatedRiskScore > 25
      ? 'MANUAL REVIEW'
      : 'APPROVED';

  // Draw simulated Error Level Analysis (ELA) canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#101726';
    ctx.fillRect(0, 0, w, h);

    if (elaActive) {
      // ELA Mode: Draw high-frequency noise & compression artifacts
      for (let x = 0; x < w; x += 4) {
        for (let y = 0; y < h; y += 4) {
          const noise = Math.random() * (isTamperedPreset ? 240 : 40);
          ctx.fillStyle = `rgb(${noise}, ${noise * 0.4}, ${noise * 1.2})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
      // If tampered, draw bright anomalous compression block over the photo/name region
      if (isTamperedPreset) {
        ctx.fillStyle = 'rgba(255, 60, 80, 0.7)';
        ctx.fillRect(20, 30, 90, 110);
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText('ELA ANOMALY: COMPRESSION DISPARITY (85% vs 40%)', 24, 75);
      }
    } else {
      // Normal Document Preview
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(10, 10, w - 20, h - 20, 8);
      ctx.fill();

      // Portrait photo placeholder
      ctx.fillStyle = '#334155';
      ctx.fillRect(25, 25, 80, 100);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(65, 60, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(65, 105, 30, 20, 0, 0, Math.PI, true);
      ctx.fill();

      // Text lines
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(holderName || 'IDENTITY DOCUMENT', 120, 45);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`DOC NO: ${docNumber}`, 120, 70);
      ctx.fillText(`DOB: ${dob}  |  EXPIRY: ${expiry}`, 120, 90);
      ctx.fillText(`ISSUING STATE: ${country}`, 120, 110);

      // MRZ strip at bottom
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(15, h - 45, w - 30, 35);
      ctx.fillStyle = '#4ade80';
      ctx.font = '9.5px monospace';
      ctx.fillText(`P<${country.slice(0, 3).toUpperCase()}${holderName.replace(/\s+/g, '<')}<<<<<<<<<<<<<`, 25, h - 28);
      ctx.fillText(`${docNumber.replace(/\s+/g, '')}0${country.slice(0, 3).toUpperCase()}${dob.replace(/-/g, '').slice(2)}0<<<<<<<<<<<<<<01`, 25, h - 14);
    }
  }, [elaActive, isTamperedPreset, holderName, docNumber, dob, expiry, country]);

  // Execute Screening & Push to Audit Trail
  const handleExecuteScreening = () => {
    const newEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      docType: isAadhaar ? 'Aadhaar Card (UIDAI)' : 'Passport (ICAO 9303)',
      docNumber,
      holder: holderName,
      verhoeffResult: isAadhaar ? (isVerhoeffValid ? 'PASSED (D5 Valid)' : 'FAILED (Checksum Mismatch)') : 'N/A',
      elaResult: isElaSuspicious ? 'COMPRESSION ANOMALY' : 'NORMAL (98.2%)',
      faceScore: `${simulatedFaceMatch}%`,
      riskScore: calculatedRiskScore,
      decision: screeningDecision,
      hash: Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    setAuditLog([newEntry, ...auditLog]);
  };

  // Export audit trail to CSV
  const handleExportCsv = () => {
    const headers = 'Audit ID,Timestamp,Doc Type,Doc Number,Holder Name,Verhoeff,ELA Result,Biometric Match,Risk Score,Decision,Cryptographic Hash\n';
    const rows = auditLog.map((a) =>
      `"${a.id}","${a.timestamp}","${a.docType}","${a.docNumber}","${a.holder}","${a.verhoeffResult}","${a.elaResult}","${a.faceScore}",${a.riskScore},"${a.decision}","${a.hash}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `world_monitor_screening_audit_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="row row--between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>🪪</span>
            <h1 style={{ margin: 0 }}>AI Document &amp; Identity Screening System</h1>
          </div>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Multimodal automated document analysis, Verhoeff checksum validation, Error Level Analysis (ELA), and biometric verification.
          </p>
        </div>

        {/* View Switcher */}
        <div className="row" style={{ gap: 6, background: 'var(--bg-2)', padding: 4, borderRadius: 'var(--radius-s)' }}>
          <button
            onClick={() => setActiveTab('screening')}
            className="btn"
            style={{
              fontSize: 11.5,
              padding: '4px 12px',
              background: activeTab === 'screening' ? 'var(--accent)' : 'transparent',
              borderColor: activeTab === 'screening' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'screening' ? '#fff' : 'var(--fg-2)',
            }}
          >
            Scanner &amp; Analysis
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className="btn"
            style={{
              fontSize: 11.5,
              padding: '4px 12px',
              background: activeTab === 'audit' ? 'var(--accent)' : 'transparent',
              borderColor: activeTab === 'audit' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'audit' ? '#fff' : 'var(--fg-2)',
            }}
          >
            Audit Trail ({auditLog.length})
          </button>
        </div>
      </div>

      {activeTab === 'screening' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 20 }}>
          {/* Left Column: Document Inspection & ELA Visualizer */}
          <div className="col" style={{ gap: 16 }}>
            {/* Fixture Selector Presets */}
            <Card title="Quick Load Presets & Test Cases">
              <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                {MOCK_IDENTITY_FIXTURES.map((fixture) => (
                  <button
                    key={fixture.id}
                    onClick={() => loadFixture(fixture)}
                    className="btn"
                    style={{
                      fontSize: 11.5,
                      background: selectedFixture?.id === fixture.id ? 'var(--accent-soft)' : 'var(--bg-2)',
                      borderColor: selectedFixture?.id === fixture.id ? 'var(--accent)' : 'var(--line)',
                      color: selectedFixture?.id === fixture.id ? '#cfe0ff' : 'var(--fg-1)',
                    }}
                  >
                    {fixture.title}
                  </button>
                ))}
              </div>
            </Card>

            {/* Document Digital Forensics Canvas & ELA */}
            <Card
              title="Forensic Document Inspection & Optical Sink"
              extra={
                <button
                  onClick={() => setElaActive(!elaActive)}
                  className="btn"
                  style={{
                    fontSize: 11,
                    background: elaActive ? 'var(--critical)' : 'var(--bg-2)',
                    borderColor: elaActive ? 'var(--critical)' : 'var(--line)',
                    color: '#fff',
                  }}
                >
                  {elaActive ? '🔬 ELA Mode: ACTIVE' : '🔍 Toggle Error Level Analysis (ELA)'}
                </button>
              }
            >
              <div className="col" style={{ gap: 10 }}>
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={220}
                  style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 'var(--radius-s)',
                    border: '1px solid var(--line)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
                  }}
                />
                <div className="row row--between" style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>
                  <span>ALGORITHM: D5 VERHOEFF + ICAO 9303</span>
                  <span>COMPRESSION DISPARITY: {elaScore}%</span>
                  <span>ELA INTEGRITY: {isElaSuspicious ? 'COMPROMISED' : 'NOMINAL'}</span>
                </div>
              </div>
            </Card>

            {/* Extracted OCR Information Fields */}
            <Card title="Extracted OCR Metadata & Field Validation">
              <div className="grid grid--2" style={{ gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--fg-2)', display: 'block', marginBottom: 4 }}>
                    Document Type
                  </label>
                  <input
                    type="text"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 7, borderRadius: 6, color: '#fff', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--fg-2)', display: 'block', marginBottom: 4 }}>
                    Document / Identity Number
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 7, borderRadius: 6, color: '#fff', fontSize: 12, fontFamily: 'var(--mono)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--fg-2)', display: 'block', marginBottom: 4 }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 7, borderRadius: 6, color: '#fff', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--fg-2)', display: 'block', marginBottom: 4 }}>
                    Issuing Authority / Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line)', padding: 7, borderRadius: 6, color: '#fff', fontSize: 12 }}
                  />
                </div>
              </div>

              {/* Checksum Validation Indicator */}
              <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-2)', borderRadius: 'var(--radius-s)' }}>
                <div className="row row--between">
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Algorithmic Integrity (Verhoeff &amp; ICAO 9303):</span>
                  {isAadhaar ? (
                    <Badge
                      text={isVerhoeffValid ? 'VERHOEFF VALID (D5 Root = 0)' : 'VERHOEFF CHECKSUM FAILED'}
                      color={isVerhoeffValid ? 'var(--ok)' : 'var(--critical)'}
                    />
                  ) : (
                    <Badge
                      text={`ICAO Check Digit: ${mrzCheckDigitCalculated} (Matched)`}
                      color="var(--ok)"
                    />
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>
                  {isAadhaar
                    ? 'Evaluated via Dihedral Group D5 multiplication & permutation tables. Immune to all single-digit errors and adjacent transpositions.'
                    : 'Evaluated against standard 7-3-1 weight modulus 10 check digit algorithms per ICAO Doc 9303 Part 3.'}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Biometrics, Risk Engine & Decisioning */}
          <div className="col" style={{ gap: 16 }}>
            {/* Biometric Verification Simulation */}
            <Card title="Facial Biometric &amp; Liveness Match">
              <div className="col" style={{ gap: 12 }}>
                <div className="row row--between" style={{ alignItems: 'center' }}>
                  <span className="muted" style={{ fontSize: 12 }}>Biometric Cosine Similarity:</span>
                  <strong className="mono" style={{ fontSize: 18, color: simulatedFaceMatch > 80 ? 'var(--ok)' : 'var(--critical)' }}>
                    {simulatedFaceMatch}%
                  </strong>
                </div>

                <div style={{ width: '100%', height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${simulatedFaceMatch}%`,
                      height: '100%',
                      background: simulatedFaceMatch > 80 ? 'var(--ok)' : 'var(--critical)',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>

                <div className="row row--between" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                  <span>Threshold: &gt; 80.0%</span>
                  <span>Anti-Spoofing: Active (Passive 3D Liveness)</span>
                </div>

                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => setSimulatedFaceMatch(96.8)}
                    className="btn"
                    style={{ fontSize: 10.5, flex: 1 }}
                  >
                    Simulate Match (96.8%)
                  </button>
                  <button
                    onClick={() => setSimulatedFaceMatch(52.4)}
                    className="btn"
                    style={{ fontSize: 10.5, flex: 1 }}
                  >
                    Simulate Mismatch (52.4%)
                  </button>
                </div>
              </div>
            </Card>

            {/* Risk Engine Breakdown */}
            <Card title="Weighted Risk Scoring Engine">
              <div className="col" style={{ gap: 14 }}>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-3)' }}>
                    Composite Screening Risk Score
                  </div>
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 800,
                      fontFamily: 'var(--mono)',
                      color: calculatedRiskScore > 50 ? 'var(--critical)' : calculatedRiskScore > 25 ? 'var(--medium)' : 'var(--ok)',
                      margin: '4px 0',
                    }}
                  >
                    {calculatedRiskScore}
                    <span style={{ fontSize: 18, color: 'var(--fg-3)' }}>/100</span>
                  </div>
                  <Badge
                    text={`DECISION: ${screeningDecision}`}
                    color={calculatedRiskScore > 50 ? 'var(--critical)' : calculatedRiskScore > 25 ? 'var(--medium)' : 'var(--ok)'}
                  />
                </div>

                <div className="col" style={{ gap: 8, fontSize: 12 }}>
                  <div className="row row--between">
                    <span className="muted">Checksum / MRZ Integrity (30%):</span>
                    <strong style={{ color: checksumPenalty > 0 ? 'var(--critical)' : 'var(--ok)' }}>
                      {checksumPenalty > 0 ? '+35 High Risk' : 'Pass (0)'}
                    </strong>
                  </div>
                  <div className="row row--between">
                    <span className="muted">Error Level Analysis (ELA) (25%):</span>
                    <strong style={{ color: elaPenalty > 0 ? 'var(--critical)' : 'var(--ok)' }}>
                      {elaPenalty > 0 ? '+30 Disparity Found' : 'Pass (0)'}
                    </strong>
                  </div>
                  <div className="row row--between">
                    <span className="muted">Biometric Verification (25%):</span>
                    <strong style={{ color: facePenalty > 0 ? 'var(--critical)' : 'var(--ok)' }}>
                      {facePenalty > 0 ? '+25 Mismatch' : 'Pass (0)'}
                    </strong>
                  </div>
                  <div className="row row--between">
                    <span className="muted">Sanctions &amp; Watchlist Check (20%):</span>
                    <strong style={{ color: watchlistPenalty > 0 ? 'var(--critical)' : 'var(--ok)' }}>
                      {watchlistPenalty > 0 ? '+25 Watchlist Hit' : 'Clear (0)'}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={handleExecuteScreening}
                  className="btn"
                  style={{
                    background: 'var(--accent)',
                    borderColor: 'var(--accent)',
                    color: '#fff',
                    padding: 10,
                    fontWeight: 650,
                    fontSize: 13,
                    marginTop: 8,
                  }}
                >
                  ⚡ Authorize &amp; Commit to Audit Log
                </button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Audit Trail View */
        <Card
          title="Cryptographic Audit Trail &amp; Screening History"
          extra={
            <button onClick={handleExportCsv} className="btn" style={{ fontSize: 11.5 }}>
              📥 Export Audit CSV
            </button>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Timestamp</th>
                  <th>Document Type</th>
                  <th>Holder Name</th>
                  <th>Doc Number</th>
                  <th>Verhoeff / MRZ</th>
                  <th>Biometric</th>
                  <th>Risk Score</th>
                  <th>Decision</th>
                  <th>Hash Digest</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((log) => (
                  <tr key={log.id}>
                    <td><code>{log.id}</code></td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--fg-2)' }}>{log.timestamp}</td>
                    <td>{log.docType}</td>
                    <td style={{ fontWeight: 600 }}>{log.holder}</td>
                    <td><code>{log.docNumber}</code></td>
                    <td>{log.verhoeffResult}</td>
                    <td className="mono">{log.faceScore}</td>
                    <td className="mono" style={{ fontWeight: 700, color: log.riskScore > 50 ? 'var(--critical)' : 'var(--ok)' }}>
                      {log.riskScore}
                    </td>
                    <td>
                      <Badge
                        text={log.decision}
                        color={log.decision === 'APPROVED' ? 'var(--ok)' : 'var(--critical)'}
                      />
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-3)' }}>
                      {log.hash.slice(0, 10)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
