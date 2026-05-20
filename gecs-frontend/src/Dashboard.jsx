import { useState, useEffect, useRef } from "react";
import "./Dashboard.css";

// ── Real data from Morningstar dataset ─────────────────────────────────────
const TOP20_INDUSTRIES = [
  { code: "31030010", name: "Conglomerates", count: 1902 },
  { code: "10310010", name: "Asset Management", count: 1886 },
  { code: "10410020", name: "Real Estate Services", count: 1215 },
  { code: "10320020", name: "Banks - Regional", count: 1167 },
  { code: "31040010", name: "Engineering & Construction", count: 851 },
  { code: "20610010", name: "Biotechnology", count: 843 },
  { code: "31110020", name: "Software - Application", count: 829 },
  { code: "31070020", name: "Specialty Industrial Machinery", count: 793 },
  { code: "20620020", name: "Drug Manufacturers - Specialty & Generic", count: 743 },
  { code: "10410010", name: "Real Estate - Development", count: 715 },
  { code: "20525040", name: "Packaged Foods", count: 681 },
  { code: "31110010", name: "Information Technology Services", count: 639 },
  { code: "10130020", name: "Specialty Chemicals", count: 630 },
  { code: "31110030", name: "Software - Infrastructure", count: 623 },
  { code: "31020010", name: "Specialty Business Services", count: 571 },
  { code: "10360010", name: "Credit Services", count: 555 },
  { code: "10200030", name: "Auto Parts", count: 540 },
  { code: "31120040", name: "Electronic Components", count: 534 },
  { code: "20650010", name: "Medical Devices", count: 491 },
  { code: "31070060", name: "Electrical Equipment & Parts", count: 488 },
];

const SECTORS = [
  { name: "Industrials", count: 6198 },
  { name: "Financial Services", count: 4153 },
  { name: "Technology", count: 3683 },
  { name: "Consumer Cyclical", count: 3594 },
  { name: "Healthcare", count: 2846 },
  { name: "Basic Materials", count: 2448 },
  { name: "Real Estate", count: 2438 },
  { name: "Consumer Defensive", count: 1833 },
  { name: "Communication Services", count: 1389 },
  { name: "Utilities", count: 1021 },
  { name: "Energy", count: 963 },
];

const TOP20_REVENUE = [
  { name: "Drug Manufacturers - General", avg_revenue_bn: 48.3 },
  { name: "Auto Manufacturers", avg_revenue_bn: 40.0 },
  { name: "Beverages - Brewers", avg_revenue_bn: 39.1 },
  { name: "Conglomerates", avg_revenue_bn: 35.6 },
  { name: "Confectioners", avg_revenue_bn: 35.3 },
  { name: "Discount Stores", avg_revenue_bn: 30.6 },
  { name: "Oil & Gas Integrated", avg_revenue_bn: 29.2 },
  { name: "Oil & Gas Refining & Marketing", avg_revenue_bn: 28.3 },
  { name: "Department Stores", avg_revenue_bn: 27.7 },
  { name: "Banks - Diversified", avg_revenue_bn: 26.8 },
  { name: "Steel", avg_revenue_bn: 24.7 },
  { name: "Grocery Stores", avg_revenue_bn: 20.8 },
  { name: "Insurance - Life", avg_revenue_bn: 20.8 },
  { name: "Insurance - Diversified", avg_revenue_bn: 20.3 },
  { name: "Utilities - Regulated Electric", avg_revenue_bn: 19.9 },
  { name: "Airlines", avg_revenue_bn: 16.4 },
  { name: "Aluminum", avg_revenue_bn: 15.6 },
  { name: "Business Equipment & Supplies", avg_revenue_bn: 13.4 },
  { name: "Insurance - Property & Casualty", avg_revenue_bn: 13.2 },
  { name: "Infrastructure Operations", avg_revenue_bn: 12.3 },
];

const SECTOR_COLORS = [
  "#63cab7", "#a78bfa", "#f59e0b", "#f87171", "#34d399",
  "#60a5fa", "#fb923c", "#e879f9", "#a3e635", "#38bdf8", "#fb7185"
];

const MODEL_METRICS = {
  task1: { f1: 0.6163, accuracy: 0.6482, classes: 145, label: "Industry Classification" },
  task2: { f1: 0.3329, accuracy: 0.4973, classes: 407, label: "Sub-Industry Classification" },
};

// ── Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((s, d) => s + d.count, 0);
  let cumAngle = -Math.PI / 2;
  const cx = 120, cy = 120, r = 90, inner = 55;

  const slices = data.map((d, i) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    const x2 = cx + r * Math.cos(cumAngle + angle);
    const y2 = cy + r * Math.sin(cumAngle + angle);
    const ix1 = cx + inner * Math.cos(cumAngle);
    const iy1 = cy + inner * Math.sin(cumAngle);
    const ix2 = cx + inner * Math.cos(cumAngle + angle);
    const iy2 = cy + inner * Math.sin(cumAngle + angle);
    const large = angle > Math.PI ? 1 : 0;
    const midAngle = cumAngle + angle / 2;
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`;
    cumAngle += angle;
    return { path, color: SECTOR_COLORS[i], d, pct: ((d.count / total) * 100).toFixed(1), midAngle };
  });

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 240 240" className="donut-svg">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            opacity={hovered === null || hovered === i ? 1 : 0.3}
            style={{ transition: "opacity 0.2s", cursor: "pointer" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
        ))}
        <circle cx={cx} cy={cy} r={inner} fill="#050812" />
        {hov ? (
          <>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{hov.pct}%</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#6b7a99" fontSize="8">{hov.d.name}</text>
            <text x={cx} y={cy + 22} textAnchor="middle" fill="#63cab7" fontSize="9">{hov.d.count.toLocaleString()}</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="13" fontWeight="800">11</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7a99" fontSize="8">Sectors</text>
          </>
        )}
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="legend-row"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered === null || hovered === i ? 1 : 0.4, transition: "opacity 0.2s", cursor: "pointer" }}>
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="legend-name">{s.d.name}</span>
            <span className="legend-count">{s.d.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gauge ──────────────────────────────────────────────────────────────────
function Gauge({ value, max = 1, label, sublabel, color }) {
  const pct = value / max;
  const r = 70, circ = Math.PI * r;
  const dash = pct * circ;
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 160 100" className="gauge-svg">
        <path d={`M 10 90 A ${r} ${r} 0 0 1 150 90`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
        <path d={`M 10 90 A ${r} ${r} 0 0 1 150 90`} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 1s ease" }} />
        <text x="80" y="78" textAnchor="middle" fill="white" fontSize="20" fontWeight="800" fontFamily="Syne, sans-serif">
          {(value * 100).toFixed(1)}%
        </text>
        <text x="80" y="94" textAnchor="middle" fill="#6b7a99" fontSize="7" fontFamily="DM Mono, monospace">
          {sublabel}
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

// ── Horizontal Bar ─────────────────────────────────────────────────────────
function HBar({ data, valueKey, labelKey, unit = "", color = "#63cab7" }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  return (
    <div className="hbar-list">
      {data.map((d, i) => (
        <div key={i} className="hbar-row">
          <div className="hbar-label" title={d[labelKey]}>{d[labelKey]}</div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{
              width: visible ? `${(d[valueKey] / max) * 100}%` : "0%",
              background: `linear-gradient(90deg, ${color}, ${color}88)`,
              transitionDelay: `${i * 30}ms`,
              boxShadow: `0 0 8px ${color}44`
            }} />
          </div>
          <div className="hbar-val">{unit}{typeof d[valueKey] === 'number' && d[valueKey] > 100 ? d[valueKey].toLocaleString() : d[valueKey]}{unit === "$" ? "B" : ""}</div>
        </div>
      ))}
    </div>
  );
}

// ── Live Feed ──────────────────────────────────────────────────────────────
function LiveFeed() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem("il_classifications");
        if (raw) setEvents(JSON.parse(raw).reverse().slice(0, 15));
      } catch {}
    };
    load();
    const iv = setInterval(load, 1500);
    return () => clearInterval(iv);
  }, []);

  const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  if (events.length === 0) {
    return (
      <div className="feed-empty">
        <div className="feed-empty-icon">⬡</div>
        <div className="feed-empty-text">No classifications yet</div>
        <div className="feed-empty-sub">Go to the main page and classify a company — it will appear here instantly</div>
      </div>
    );
  }

  return (
    <div className="feed-list">
      {events.map((e, i) => (
        <div key={i} className="feed-item" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="feed-dot" style={{ background: e.confidence > 50 ? "#63cab7" : e.confidence > 25 ? "#f59e0b" : "#f87171" }} />
          <div className="feed-info">
            <div className="feed-industry">{e.industry}</div>
            <div className="feed-preview">{e.preview}</div>
          </div>
          <div className="feed-right">
            <div className="feed-conf" style={{ color: e.confidence > 50 ? "#63cab7" : e.confidence > 25 ? "#f59e0b" : "#f87171" }}>
              {e.confidence}%
            </div>
            <div className="feed-time">{timeAgo(e.ts)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard({ onBack }) {
  return (
    <div className="dash">
      <div className="dash-header">
        <button className="back-btn" onClick={onBack}>← Back to Classifier</button>
        <div className="dash-title">
          <span className="dash-title-icon">⬡</span>
          Analytics Dashboard
        </div>
        <div className="dash-subtitle">Live insights from 53,585 Morningstar segments · 23,207 companies</div>
      </div>

      {/* stat pills */}
      <div className="stat-pills">
        {[
          { label: "Total Segments", value: "53,585" },
          { label: "Unique Companies", value: "23,207" },
          { label: "Industries", value: "145" },
          { label: "Sub-Industries", value: "407" },
          { label: "Task 1 F1 Score", value: "0.6163" },
          { label: "Task 2 F1 Score", value: "0.3329" },
        ].map((s, i) => (
          <div key={i} className="stat-pill">
            <span className="sp-val">{s.value}</span>
            <span className="sp-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dash-grid">

        {/* Card 1 — Top 20 Industries */}
        <div className="dash-card span2">
          <div className="dc-header">
            <span className="dc-title">Top 20 Industries by Company Count</span>
            <span className="dc-badge">From 23,207 companies</span>
          </div>
          <HBar data={TOP20_INDUSTRIES} valueKey="count" labelKey="name" color="#63cab7" />
        </div>

        {/* Card 2 — Sector Distribution */}
        <div className="dash-card">
          <div className="dc-header">
            <span className="dc-title">Sector Distribution</span>
            <span className="dc-badge">11 sectors</span>
          </div>
          <DonutChart data={SECTORS} />
        </div>

        {/* Card 3 — Model Performance */}
        <div className="dash-card">
          <div className="dc-header">
            <span className="dc-title">Model Performance</span>
            <span className="dc-badge">TF-IDF + Logistic Regression</span>
          </div>
          <div className="gauges-row">
            <Gauge value={MODEL_METRICS.task1.f1} label="Task 1 — Industry" sublabel={`${MODEL_METRICS.task1.classes} classes`} color="#63cab7" />
            <Gauge value={MODEL_METRICS.task2.f1} label="Task 2 — Sub-Industry" sublabel={`${MODEL_METRICS.task2.classes} classes`} color="#a78bfa" />
          </div>
          <div className="model-stats">
            <div className="ms-row"><span>Task 1 Accuracy</span><span style={{color:"#63cab7"}}>64.82%</span></div>
            <div className="ms-row"><span>Task 2 Accuracy</span><span style={{color:"#a78bfa"}}>49.73%</span></div>
            <div className="ms-row"><span>Model Type</span><span>Logistic Regression</span></div>
            <div className="ms-row"><span>Features</span><span>TF-IDF Bigrams (50K)</span></div>
          </div>
        </div>

        {/* Card 4 — Revenue */}
        <div className="dash-card span2">
          <div className="dc-header">
            <span className="dc-title">Top 20 Industries by Median Revenue</span>
            <span className="dc-badge">Median company revenue in $B</span>
          </div>
          <HBar data={TOP20_REVENUE} valueKey="avg_revenue_bn" labelKey="name" unit="$" color="#a78bfa" />
        </div>

        {/* Card 5 — Live Feed */}
        <div className="dash-card">
          <div className="dc-header">
            <span className="dc-title">Live Classification Feed</span>
            <span className="live-dot-wrap"><span className="live-dot" />Live</span>
          </div>
          <LiveFeed />
        </div>

      </div>
    </div>
  );
}
