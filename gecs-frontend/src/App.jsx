import { useState } from "react";
import Landing from "./Landing";
import Classifier from "./Classifier";
import Dashboard from "./Dashboard";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <div className="app-root">
      {/* ── NAV ── */}
      <nav className="app-nav">
        <button className="app-nav-logo" onClick={() => setPage("landing")}>
          <span className="app-nav-icon">⬡</span>
          IndustryLens
        </button>
        <div className="app-nav-links">
          <button
            className={`app-nav-link ${page === "landing" ? "active" : ""}`}
            onClick={() => setPage("landing")}>
            Home
          </button>
          <button
            className={`app-nav-link ${page === "classifier" ? "active" : ""}`}
            onClick={() => setPage("classifier")}>
            Classifier
          </button>
          <button
            className={`app-nav-link ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}>
            Dashboard
          </button>
        </div>
        <button className="app-nav-cta" onClick={() => setPage("classifier")}>
          Classify Now →
        </button>
      </nav>

      {/* ── PAGES ── */}
      <div className="app-page">
        {page === "landing" && (
          <Landing onStart={() => setPage("classifier")} />
        )}
        {page === "classifier" && (
          <Classifier onDashboard={() => setPage("dashboard")} />
        )}
        {page === "dashboard" && (
          <Dashboard onBack={() => setPage("classifier")} />
        )}
      </div>
    </div>
  );
}
