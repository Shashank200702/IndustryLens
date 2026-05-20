import { useEffect, useState } from "react";
import "./Landing.css";

const STATS = [
  { num: "53,585", label: "Segments Trained" },
  { num: "23,207", label: "Unique Companies" },
  { num: "145", label: "GECS Industries" },
  { num: "407", label: "Sub-Industries" },
];

const HOW = [
  { step: "01", title: "Paste a description", body: "Enter any company\'s business profile, segment name, and what they do." },
  { step: "02", title: "Model analyses", body: "Our TF-IDF + Logistic Regression model reads the text and scores all 145 industries." },
  { step: "03", title: "Get instant results", body: "See the predicted industry, confidence score, and top alternatives in under 100ms." },
];

const EXAMPLES = [
  { industry: "Semiconductors", code: "31130020", conf: "44.99%", color: "#b45309" },
  { industry: "Biotechnology", code: "20610010", conf: "71.2%", color: "#065f46" },
  { industry: "Asset Management", code: "10310010", conf: "58.4%", color: "#1e3a5f" },
  { industry: "Software - Application", code: "31110020", conf: "63.1%", color: "#4c1d95" },
];

export default function Landing({ onStart }) {
  const [visible, setVisible] = useState(false);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const iv = setInterval(() => setTicker(t => (t + 1) % EXAMPLES.length), 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={`landing ${visible ? "visible" : ""}`}>

      {/* ── HERO ── */}
      <section className="l-hero">
        <div className="l-hero-inner">
          <div className="l-eyebrow">GECS Industry Classification · 2026</div>
          <h1 className="l-title">
            Know exactly what<br />
            <em>industry</em> any company<br />
            belongs to.
          </h1>
          <p className="l-sub">
            IndustryLens uses machine learning trained on 53,000+ real Morningstar
            segments to instantly classify any company into the right GECS industry
            and business activity — with confidence scores.
          </p>
          <div className="l-actions">
            <button className="l-cta" onClick={onStart}>
              Start Classifying →
            </button>
            <span className="l-hint">No signup needed · Free · Under 100ms</span>
          </div>

          {/* Live ticker */}
          <div className="l-ticker">
            <span className="l-ticker-label">Recently classified</span>
            {EXAMPLES.map((e, i) => (
              <div key={i} className={`l-tick ${ticker === i ? "active" : ""}`}
                style={{ "--tc": e.color }}>
                <span className="l-tick-ind">{e.industry}</span>
                <span className="l-tick-code">{e.code}</span>
                <span className="l-tick-conf">{e.conf}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative right panel */}
        <div className="l-hero-visual">
          <div className="l-vis-card">
            <div className="l-vis-label">GECS Industry</div>
            <div className="l-vis-name">{EXAMPLES[ticker].industry}</div>
            <div className="l-vis-code">{EXAMPLES[ticker].code}</div>
            <div className="l-vis-bar-wrap">
              <div className="l-vis-bar" style={{ width: EXAMPLES[ticker].conf, background: EXAMPLES[ticker].color }} />
            </div>
            <div className="l-vis-conf">{EXAMPLES[ticker].conf} confidence</div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="l-stats">
        {STATS.map((s, i) => (
          <div key={i} className="l-stat">
            <div className="l-stat-num">{s.num}</div>
            <div className="l-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="l-how">
        <div className="l-section-label">How it works</div>
        <h2 className="l-section-title">Three steps to classification</h2>
        <div className="l-how-grid">
          {HOW.map((h, i) => (
            <div key={i} className="l-how-card">
              <div className="l-how-step">{h.step}</div>
              <div className="l-how-title">{h.title}</div>
              <div className="l-how-body">{h.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="l-bottom-cta">
        <h2>Ready to classify?</h2>
        <p>Paste any company description and get instant results.</p>
        <button className="l-cta" onClick={onStart}>Open Classifier →</button>
      </section>

    </div>
  );
}
