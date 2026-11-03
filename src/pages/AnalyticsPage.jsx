import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";

// Matches SocialIndexPage.jsx so unlocking /social or /analytics shares the same session
const ACCESS_CODE = "splitsmart";
const STORAGE_KEY = "tsp-social-access-v1";

function countryFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  const upper = code.toUpperCase();
  return String.fromCodePoint(...[...upper].map((c) => 127397 + c.charCodeAt(0)));
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function projectLatLon(lat, lon) {
  const width = 800;
  const height = 380;
  const x = ((lon + 180) / 360) * width;
  const clampedLat = Math.max(-58, Math.min(75, lat));
  const y = ((75 - clampedLat) / (75 - -58)) * height;
  return { x, y };
}

function detectCurrentBrowserTech() {
  if (typeof navigator === "undefined") {
    return { deviceType: "Desktop", browser: "Chrome", os: "Windows" };
  }
  const ua = navigator.userAgent || "";
  const lower = ua.toLowerCase();
  let deviceType = "Desktop";
  if (/ipad|tablet/i.test(ua)) deviceType = "Tablet";
  else if (/mobile|iphone|android/i.test(ua)) deviceType = "Mobile";

  let browser = "Browser";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome")) browser = "Chrome";
  else if (lower.includes("safari")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";

  let os = "OS";
  if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";

  return { deviceType, browser, os };
}

export default function AnalyticsPage() {
  useMeta({
    title: "Website Analytics — The Split Plate",
    description: "Private website usage, visitor locations, and recipe traffic dashboard.",
  });

  const [unlocked, setUnlocked] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const [payload, setPayload] = useState(null);
  const [range, setRange] = useState("7d");
  const [locationTab, setLocationTab] = useState("countries");
  const [techTab, setTechTab] = useState("browsers");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [liveVisitor, setLiveVisitor] = useState(null);

  useEffect(() => {
    if (!unlocked) return;
    fetch("/analytics-data.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setPayload(json))
      .catch((err) => console.error("Failed to load analytics-data.json:", err));

    // Also resolve the owner's current live session location via free ipapi.co
    const tech = detectCurrentBrowserTech();
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((geo) => {
        if (geo && geo.country_code) {
          setLiveVisitor({
            city: geo.city || "Local",
            region: geo.region_code || "",
            country: geo.country_name || "United States",
            countryCode: geo.country_code || "US",
            ...tech,
          });
        }
      })
      .catch(() => {
        setLiveVisitor({
          city: "San Ramon",
          region: "CA",
          country: "United States",
          countryCode: "US",
          ...tech,
        });
      });
  }, [unlocked]);

  function submit(e) {
    e.preventDefault();
    if (input.trim().toLowerCase() === ACCESS_CODE.toLowerCase()) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  function lock() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setInput("");
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <form
          onSubmit={submit}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
        >
          <h1 className="text-white text-xl font-black">Private — access code required</h1>
          <p className="text-neutral-500 text-xs mt-2">
            This page shows website usage, visitor locations, and recipe analytics for The Split Plate. Enter the access code to continue.
          </p>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Access code"
            className="w-full mt-5 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          {error && <p className="text-red-400 text-xs mt-2">Wrong code. Try again.</p>}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2.5 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Unlock Analytics
          </button>
          <p className="text-neutral-600 text-[10px] mt-4">
            Same access code as /social. Client-side gate only.
          </p>
        </form>
      </div>
    );
  }

  if (!payload || !payload.ranges) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-300 flex items-center justify-center">
        <p className="text-sm">Loading Split Plate analytics...</p>
      </div>
    );
  }

  const data = payload.ranges[range] || payload.ranges["7d"];
  const { summary } = data;

  const filteredCities = selectedCountry
    ? data.cities.filter((c) => c.countryCode === selectedCountry)
    : data.cities;

  const maxCityVisitors = Math.max(1, ...data.cities.map((c) => c.visitors));

  // Build SVG Area Chart coordinates (width 760, height 220)
  const chartW = 760;
  const chartH = 220;
  const padL = 38;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const ts = data.timeSeries || [];
  const maxY = Math.max(10, ...ts.map((d) => Math.max(d.pageviews, d.visitors)));

  const getX = (i) =>
    ts.length <= 1 ? padL + plotW / 2 : padL + (i / (ts.length - 1)) * plotW;
  const getY = (val) => padT + plotH - (val / maxY) * plotH;

  const viewsPoints = ts.map((d, i) => `${getX(i)},${getY(d.pageviews)}`).join(" ");
  const visitorsPoints = ts.map((d, i) => `${getX(i)},${getY(d.visitors)}`).join(" ");

  const viewsArea =
    ts.length > 0
      ? `M ${getX(0)},${padT + plotH} L ${viewsPoints.replace(/ /g, " L ")} L ${getX(
          ts.length - 1
        )},${padT + plotH} Z`
      : "";
  const visitorsArea =
    ts.length > 0
      ? `M ${getX(0)},${padT + plotH} L ${visitorsPoints.replace(/ /g, " L ")} L ${getX(
          ts.length - 1
        )},${padT + plotH} Z`
      : "";

  const updatedDate = payload.lastUpdated
    ? new Date(payload.lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Daily";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-white text-2xl font-black tracking-tight">
                Website Usage &amp; Locations
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {summary.activeNow} active now
              </span>
            </div>
            <p className="text-neutral-400 text-xs mt-1">
              Property: <span className="text-neutral-200 font-semibold">thesplitplate.com</span> ({payload.measurementId || "G-10YP1BFG19"}) · Updated {updatedDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/social"
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
            >
              Social Carousels →
            </Link>

            <button
              onClick={() => setShowSetupModal(true)}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Daily Auto-Sync Setup
            </button>

            <div className="flex rounded-lg border border-neutral-800 bg-neutral-900 p-0.5">
              {[
                { id: "24h", label: "24h" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRange(tab.id)}
                  className={`rounded-md px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                    range === tab.id
                      ? "bg-amber-500 text-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={lock}
              className="text-neutral-500 text-xs hover:text-amber-400 px-2 py-1 cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Live Session Banner */}
        {liveVisitor && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                YOUR SESSION
              </span>
              <span>
                Connected from{" "}
                <strong className="text-white">
                  {countryFlag(liveVisitor.countryCode)} {liveVisitor.city}
                  {liveVisitor.region ? `, ${liveVisitor.region}` : ""} ({liveVisitor.country})
                </strong>{" "}
                · {liveVisitor.deviceType} · {liveVisitor.browser} on {liveVisitor.os}
              </span>
            </div>
            <span className="text-neutral-500 text-[11px]">
              GA4 Tag Active: {payload.measurementId}
            </span>
          </div>
        )}

        {/* 5 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <div className="text-xs font-medium text-neutral-400">Unique Visitors</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">
                {summary.uniqueVisitors.toLocaleString()}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  summary.visitorsDelta >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {summary.visitorsDelta >= 0 ? "↑" : "↓"} {Math.abs(summary.visitorsDelta)}%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">vs. previous {range} window</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <div className="text-xs font-medium text-neutral-400">Total Pageviews</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">
                {summary.totalPageviews.toLocaleString()}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  summary.pageviewsDelta >= 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {summary.pageviewsDelta >= 0 ? "↑" : "↓"} {Math.abs(summary.pageviewsDelta)}%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              {(summary.totalPageviews / Math.max(1, summary.uniqueVisitors)).toFixed(1)} pages / visitor
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <div className="text-xs font-medium text-neutral-400">Top Country</div>
            <div className="mt-2 truncate text-xl font-black text-white">
              {data.countries[0]
                ? `${countryFlag(data.countries[0].countryCode)} ${data.countries[0].country}`
                : "United States"}
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              {data.countries[0]
                ? `${data.countries[0].percentage}% of visitors (${data.countries.length} countries)`
                : "Global traffic"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <div className="text-xs font-medium text-neutral-400">Avg. Time on Site</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">
                {formatDuration(summary.avgDurationSec)}
              </span>
              <span className="text-xs font-semibold text-amber-400">Recipe reads</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">Active cooking &amp; browsing time</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            <div className="text-xs font-medium text-neutral-400">Bounce Rate</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{summary.bounceRate}%</span>
              <span className="text-xs text-neutral-400">
                {100 - summary.bounceRate}% engaged
              </span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">Single-page sessions</p>
          </div>
        </div>

        {/* Traffic Trend Chart */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Visitors &amp; Pageviews Over Time
              </h2>
              <p className="text-xs text-neutral-400">
                Hover over any point to inspect daily traffic
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Unique Visitors
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Pageviews
              </span>
            </div>
          </div>

          <div className="relative w-full">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-56 overflow-visible">
              <defs>
                <linearGradient id="tspViewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="tspVisitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = padT + plotH * (1 - pct);
                const val = Math.round(maxY * pct);
                return (
                  <g key={idx}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={chartW - padR}
                      y2={y}
                      stroke="#262626"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#737373"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Areas & Lines */}
              {viewsArea && <path d={viewsArea} fill="url(#tspViewsGrad)" />}
              {visitorsArea && <path d={visitorsArea} fill="url(#tspVisitorsGrad)" />}

              {viewsPoints && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  points={viewsPoints}
                />
              )}
              {visitorsPoints && (
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  points={visitorsPoints}
                />
              )}

              {/* Interactive Data Points */}
              {ts.map((d, i) => {
                const cx = getX(i);
                const cyVis = getY(d.visitors);
                const cyViews = getY(d.pageviews);
                return (
                  <g
                    key={d.label + i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ ...d, x: cx })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <rect
                      x={cx - plotW / Math.max(2, ts.length * 2)}
                      y={padT}
                      width={plotW / Math.max(1, ts.length)}
                      height={plotH}
                      fill="transparent"
                    />
                    <circle cx={cx} cy={cyViews} r="3.5" fill="#10b981" />
                    <circle cx={cx} cy={cyVis} r="4" fill="#f59e0b" />
                    <text
                      x={cx}
                      y={chartH - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#a3a3a3"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div className="pointer-events-none absolute top-2 right-4 rounded-xl border border-neutral-700 bg-neutral-900/95 px-3.5 py-2 text-xs shadow-xl">
                <div className="font-bold text-white">{hoveredPoint.label}</div>
                <div className="mt-0.5 text-amber-400">
                  Visitors: <strong>{hoveredPoint.visitors.toLocaleString()}</strong>
                </div>
                <div className="text-emerald-400">
                  Pageviews: <strong>{hoveredPoint.pageviews.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visitor Locations: World Map + Countries/Cities Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Map (7 cols) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 lg:col-span-7 flex flex-col justify-between">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white">
                  Visitor Locations &amp; Geography
                </h2>
                <p className="text-xs text-neutral-400">
                  Hover over any city pin or click to filter by country
                </p>
              </div>
              {selectedCountry && (
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 cursor-pointer"
                >
                  Filtered: {countryFlag(selectedCountry)} {selectedCountry} ×
                </button>
              )}
            </div>

            <div className="relative aspect-[800/380] w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
              <svg viewBox="0 0 800 380" className="h-full w-full">
                <defs>
                  <pattern id="tspGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#262626" />
                  </pattern>
                </defs>
                <rect width="800" height="380" fill="url(#tspGrid)" />

                {/* Continents silhouette */}
                <g fill="#171717" stroke="#2e2e2e" strokeWidth="1">
                  <path d="M 65,45 L 185,38 L 245,65 L 260,115 L 210,165 L 180,195 L 150,185 L 115,145 L 85,105 Z" />
                  <path d="M 182,195 L 220,208 L 285,235 L 295,285 L 250,355 L 225,360 L 210,290 L 190,235 Z" />
                  <path d="M 365,55 L 445,42 L 485,55 L 480,115 L 435,128 L 385,125 L 358,95 Z" />
                  <path d="M 365,138 L 445,138 L 495,180 L 485,255 L 445,320 L 410,315 L 395,245 L 355,195 Z" />
                  <path d="M 485,48 L 655,40 L 725,65 L 705,135 L 655,185 L 585,205 L 535,185 L 490,140 Z" />
                  <path d="M 635,260 L 725,255 L 740,305 L 695,332 L 635,315 Z" />
                </g>

                {filteredCities.map((c) => {
                  const { x, y } = projectLatLon(c.lat, c.lon);
                  const radius = 4.5 + (c.visitors / maxCityVisitors) * 7;
                  return (
                    <g
                      key={`${c.city}-${c.countryCode}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCity(c)}
                      onMouseLeave={() => setHoveredCity(null)}
                      onClick={() =>
                        setSelectedCountry(
                          selectedCountry === c.countryCode ? null : c.countryCode
                        )
                      }
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={radius * 1.9}
                        fill="#f59e0b"
                        fillOpacity="0.22"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill="#f59e0b"
                        stroke="#0a0a0a"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {hoveredCity && (
                <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-neutral-700 bg-neutral-900/95 px-3.5 py-2 text-xs shadow-xl">
                  <div className="font-bold text-white">
                    {countryFlag(hoveredCity.countryCode)} {hoveredCity.city}
                    {hoveredCity.region ? `, ${hoveredCity.region}` : ""} —{" "}
                    <span className="text-neutral-400">{hoveredCity.country}</span>
                  </div>
                  <div className="mt-0.5 text-neutral-300">
                    <span className="font-bold text-amber-400">
                      {hoveredCity.visitors.toLocaleString()}
                    </span>{" "}
                    visitors ·{" "}
                    <span className="font-bold text-emerald-400">
                      {hoveredCity.pageviews.toLocaleString()}
                    </span>{" "}
                    views ({hoveredCity.percentage}%)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Countries & Cities List (5 cols) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 lg:col-span-5 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Top Locations</h3>
              <div className="flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
                <button
                  onClick={() => setLocationTab("countries")}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    locationTab === "countries"
                      ? "bg-amber-500 text-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Countries ({data.countries.length})
                </button>
                <button
                  onClick={() => setLocationTab("cities")}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    locationTab === "cities"
                      ? "bg-amber-500 text-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Cities ({filteredCities.length})
                </button>
              </div>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-80 pr-1">
              {locationTab === "countries"
                ? data.countries.map((c) => {
                    const isSelected = selectedCountry === c.countryCode;
                    return (
                      <div
                        key={c.countryCode}
                        onClick={() =>
                          setSelectedCountry(isSelected ? null : c.countryCode)
                        }
                        className={`cursor-pointer rounded-xl border p-2.5 transition ${
                          isSelected
                            ? "border-amber-500/60 bg-amber-500/10"
                            : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-200">
                            {countryFlag(c.countryCode)} {c.country}
                          </span>
                          <span className="text-neutral-300">
                            <strong className="text-white">
                              {c.visitors.toLocaleString()}
                            </strong>{" "}
                            ({c.percentage}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${Math.max(4, c.percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                : filteredCities.map((c) => (
                    <div
                      key={`${c.city}-${c.countryCode}`}
                      className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-200">
                          {countryFlag(c.countryCode)} {c.city}
                          {c.region ? `, ${c.region}` : ""}
                        </span>
                        <span className="text-neutral-300">
                          <strong className="text-white">
                            {c.visitors.toLocaleString()}
                          </strong>{" "}
                          ({c.percentage}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.max(4, c.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Most Visited Recipes/Pages + Traffic Sources & Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Pages (7 cols) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Top Recipes &amp; Pages
                </h2>
                <p className="text-xs text-neutral-400">
                  Most viewed destinations on thesplitplate.com
                </p>
              </div>
              <span className="text-xs text-neutral-500">Views / Visitors</span>
            </div>

            <div className="space-y-2.5">
              {data.topPages.map((p) => (
                <Link
                  key={p.path}
                  to={p.path}
                  className="block relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 hover:border-amber-500/40 transition-colors group"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-500/10"
                    style={{ width: `${Math.max(4, p.percentage)}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs font-bold text-amber-400 group-hover:underline">
                        {p.path}
                      </div>
                      <div className="truncate text-xs text-neutral-400">
                        {p.title}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <div className="font-bold text-white">
                        {p.views.toLocaleString()} views
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {p.visitors.toLocaleString()} visitors · avg{" "}
                        {formatDuration(p.avgDurationSec)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Referrers & Devices (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            {/* Traffic Sources */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
              <h2 className="text-base font-bold text-white">Traffic Sources</h2>
              <p className="text-xs text-neutral-400 mb-4">
                How readers are finding The Split Plate
              </p>
              <div className="space-y-2.5">
                {data.referrers.map((r) => (
                  <div
                    key={r.source}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-200">
                        {r.source}
                      </span>
                      <span className="text-neutral-300">
                        <strong className="text-white">
                          {r.visitors.toLocaleString()}
                        </strong>{" "}
                        visitors ({r.percentage}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(4, r.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices, Browsers, OS */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">
                  Devices &amp; Platforms
                </h2>
                <div className="flex rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
                  <button
                    onClick={() => setTechTab("browsers")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold cursor-pointer ${
                      techTab === "browsers"
                        ? "bg-amber-500 text-black"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Browsers
                  </button>
                  <button
                    onClick={() => setTechTab("os")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold cursor-pointer ${
                      techTab === "os"
                        ? "bg-amber-500 text-black"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    OS
                  </button>
                </div>
              </div>

              <div className="mb-3 flex gap-2">
                {data.devices.map((d) => (
                  <div
                    key={d.name}
                    className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-2.5 text-center"
                  >
                    <div className="text-xs text-neutral-400">{d.name}</div>
                    <div className="mt-0.5 text-base font-black text-amber-400">
                      {d.percentage}%
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {d.visitors.toLocaleString()} users
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {(techTab === "browsers"
                  ? data.browsers
                  : data.operatingSystems
                ).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg bg-neutral-950/60 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-neutral-300">
                      {item.name}
                    </span>
                    <span className="text-neutral-400">
                      <strong className="text-white">
                        {item.visitors.toLocaleString()}
                      </strong>{" "}
                      ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Auto-Sync Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">
                Automated Daily GA4 Sync Setup
              </h2>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Your site already sends live traffic to Google Analytics 4 (<strong>G-10YP1BFG19</strong>). The workflow in <code>.github/workflows/daily-analytics-sync.yml</code> runs every day at midnight PST to refresh this page automatically.
            </p>
            <ol className="mt-4 space-y-3 text-xs text-neutral-300 list-decimal list-inside">
              <li>
                In <strong>Google Analytics → Admin → Property Settings</strong>, copy your numeric <strong>Property ID</strong> (e.g. <code>123456789</code>).
              </li>
              <li>
                In <strong>Google Cloud Console</strong>, enable the free <strong>Google Analytics Data API</strong>, create a Service Account JSON key, and grant its <code>client_email</code> <strong>Viewer</strong> access in GA4 Property Access Management.
              </li>
              <li>
                In your GitHub repo <strong>Settings → Secrets and variables → Actions</strong>, add two secrets:
                <ul className="mt-1.5 ml-5 list-disc space-y-1 text-amber-400 font-mono">
                  <li>GA4_PROPERTY_ID</li>
                  <li>GA4_SERVICE_ACCOUNT_JSON</li>
                </ul>
              </li>
            </ol>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowSetupModal(false)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
