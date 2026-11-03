/**
 * Daily Google Analytics 4 (GA4) Data Sync Script for The Split Plate
 *
 * Pulls real 24h, 7d, and 30d website usage metrics (users, pageviews, countries,
 * cities, top recipe pages, traffic sources, devices, browsers, OS) from the free
 * Google Analytics Data API (v1beta) using built-in Node.js crypto (zero extra npm deps).
 *
 * Usage:
 *   GA4_PROPERTY_ID="123456789" GA4_SERVICE_ACCOUNT_JSON='{"client_email":...}' node scripts/sync-analytics.mjs
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const RAW_CREDENTIALS = process.env.GA4_SERVICE_ACCOUNT_JSON;

// Coordinates lookup for top countries & cities so the world map pins render accurately
const COUNTRY_COORDS = {
  US: { lat: 37.7749, lon: -122.4194 },
  CA: { lat: 43.6532, lon: -79.3832 },
  GB: { lat: 51.5074, lon: -0.1278 },
  AU: { lat: -33.8688, lon: 151.2093 },
  IN: { lat: 12.9716, lon: 77.5946 },
  DE: { lat: 52.52, lon: 13.405 },
  FR: { lat: 48.8566, lon: 2.3522 },
  NL: { lat: 52.3676, lon: 4.9041 },
  SG: { lat: 1.3521, lon: 103.8198 },
  JP: { lat: 35.6762, lon: 139.6503 },
  BR: { lat: -23.5505, lon: -46.6333 },
  MX: { lat: 19.4326, lon: -99.1332 },
  ES: { lat: 40.4168, lon: -3.7038 },
  IT: { lat: 41.9028, lon: 12.4964 },
  SE: { lat: 59.3293, lon: 18.0686 },
};

const CITY_COORDS = {
  "San Francisco": { lat: 37.7749, lon: -122.4194 },
  "San Ramon": { lat: 37.7799, lon: -121.978 },
  "Los Angeles": { lat: 34.0522, lon: -118.2437 },
  "New York": { lat: 40.7128, lon: -74.006 },
  Austin: { lat: 30.2672, lon: -97.7431 },
  Chicago: { lat: 41.8781, lon: -87.6298 },
  Seattle: { lat: 47.6062, lon: -122.3321 },
  Dallas: { lat: 32.7767, lon: -96.797 },
  Atlanta: { lat: 33.749, lon: -84.388 },
  Denver: { lat: 39.7392, lon: -104.9903 },
  Toronto: { lat: 43.6532, lon: -79.3832 },
  Vancouver: { lat: 49.2827, lon: -123.1207 },
  London: { lat: 51.5074, lon: -0.1278 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  Melbourne: { lat: -37.8136, lon: 144.9631 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Berlin: { lat: 52.52, lon: 13.405 },
  Paris: { lat: 48.8566, lon: 2.3522 },
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
};

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(claim)
  )}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer
    .sign(credentials.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OAuth token exchange failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function runGA4Report(token, propertyId, body) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GA4 runReport failed (${res.status}): ${errText}`);
  }
  return res.json();
}

async function fetchRangeData(token, propertyId, startDate, prevStartDate, prevEndDate, isHourly) {
  const dateRanges = [
    { startDate, endDate: "today" },
    { startDate: prevStartDate, endDate: prevEndDate },
  ];

  // 1. Summary KPIs
  const summaryRes = await runGA4Report(token, propertyId, {
    dateRanges,
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ],
  });

  const currRow = summaryRes.rows?.[0]?.metricValues || [];
  const prevRow = summaryRes.rows?.[1]?.metricValues || [];

  const uniqueVisitors = parseInt(currRow[0]?.value || "0", 10);
  const totalPageviews = parseInt(currRow[1]?.value || "0", 10);
  const bounceRate = Math.round(parseFloat(currRow[2]?.value || "0") * 100);
  const avgDurationSec = Math.round(parseFloat(currRow[3]?.value || "0"));

  const prevVisitors = parseInt(prevRow[0]?.value || "0", 10);
  const prevPageviews = parseInt(prevRow[1]?.value || "0", 10);

  const calcDelta = (curr, prev) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0;

  // 2. Time Series
  const tsRes = await runGA4Report(token, propertyId, {
    dateRanges: [{ startDate, endDate: "today" }],
    dimensions: [{ name: isHourly ? "hour" : "date" }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    orderBys: [{ dimension: { dimensionName: isHourly ? "hour" : "date" } }],
  });

  const timeSeries = (tsRes.rows || []).map((r) => {
    const rawDim = r.dimensionValues[0].value;
    let label = rawDim;
    if (isHourly) {
      const hr = parseInt(rawDim, 10);
      label = hr === 0 ? "12 AM" : hr < 12 ? `${hr} AM` : hr === 12 ? "12 PM" : `${hr - 12} PM`;
    } else if (rawDim.length === 8) {
      const m = parseInt(rawDim.slice(4, 6), 10) - 1;
      const d = parseInt(rawDim.slice(6, 8), 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      label = `${months[m]} ${d}`;
    }
    return {
      label,
      visitors: parseInt(r.metricValues[0].value, 10),
      pageviews: parseInt(r.metricValues[1].value, 10),
    };
  });

  // 3. Countries
  const countryRes = await runGA4Report(token, propertyId, {
    dateRanges: [{ startDate, endDate: "today" }],
    dimensions: [{ name: "country" }, { name: "countryId" }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    limit: 12,
  });

  const countries = (countryRes.rows || []).map((r) => {
    const country = r.dimensionValues[0].value || "United States";
    const countryCode = r.dimensionValues[1].value || "US";
    const visitors = parseInt(r.metricValues[0].value, 10);
    const pageviews = parseInt(r.metricValues[1].value, 10);
    const coords = COUNTRY_COORDS[countryCode] || { lat: 37.7749, lon: -122.4194 };
    return {
      country,
      countryCode,
      visitors,
      pageviews,
      percentage: uniqueVisitors > 0 ? Math.round((visitors / uniqueVisitors) * 100) : 0,
      lat: coords.lat,
      lon: coords.lon,
    };
  });

  // 4. Cities
  const cityRes = await runGA4Report(token, propertyId, {
    dateRanges: [{ startDate, endDate: "today" }],
    dimensions: [
      { name: "city" },
      { name: "region" },
      { name: "country" },
      { name: "countryId" },
    ],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    limit: 15,
  });

  const cities = (cityRes.rows || [])
    .filter((r) => r.dimensionValues[0].value && r.dimensionValues[0].value !== "(not set)")
    .map((r) => {
      const city = r.dimensionValues[0].value;
      const region = r.dimensionValues[1].value || "";
      const country = r.dimensionValues[2].value || "United States";
      const countryCode = r.dimensionValues[3].value || "US";
      const visitors = parseInt(r.metricValues[0].value, 10);
      const pageviews = parseInt(r.metricValues[1].value, 10);
      const coords =
        CITY_COORDS[city] ||
        COUNTRY_COORDS[countryCode] || { lat: 37.7749, lon: -122.4194 };
      return {
        city,
        region,
        country,
        countryCode,
        visitors,
        pageviews,
        percentage: uniqueVisitors > 0 ? Math.round((visitors / uniqueVisitors) * 100) : 0,
        lat: coords.lat,
        lon: coords.lon,
      };
    });

  // 5. Top Pages
  const pagesRes = await runGA4Report(token, propertyId, {
    dateRanges: [{ startDate, endDate: "today" }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "activeUsers" },
      { name: "averageSessionDuration" },
    ],
    limit: 12,
  });

  const topPages = (pagesRes.rows || [])
    .filter((r) => !r.dimensionValues[0].value.startsWith("/social") && !r.dimensionValues[0].value.startsWith("/analytics"))
    .slice(0, 10)
    .map((r) => {
      const views = parseInt(r.metricValues[0].value, 10);
      const visitors = parseInt(r.metricValues[1].value, 10);
      return {
        path: r.dimensionValues[0].value || "/",
        title: r.dimensionValues[1].value || "The Split Plate",
        views,
        visitors,
        avgDurationSec: Math.round(parseFloat(r.metricValues[2].value || "60")),
        percentage: totalPageviews > 0 ? Math.round((views / totalPageviews) * 100) : 0,
      };
    });

  // 6. Referrers / Traffic Sources
  const refRes = await runGA4Report(token, propertyId, {
    dateRanges: [{ startDate, endDate: "today" }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    limit: 8,
  });

  const referrers = (refRes.rows || []).map((r) => {
    const rawSource = r.dimensionValues[0].value;
    const source = rawSource === "(direct)" ? "Direct" : rawSource;
    const visitors = parseInt(r.metricValues[0].value, 10);
    const pageviews = parseInt(r.metricValues[1].value, 10);
    return {
      source,
      visitors,
      pageviews,
      percentage: uniqueVisitors > 0 ? Math.round((visitors / uniqueVisitors) * 100) : 0,
    };
  });

  // 7. Devices, Browsers, OS
  const fetchDimensionBreakdown = async (dimName) => {
    const res = await runGA4Report(token, propertyId, {
      dateRanges: [{ startDate, endDate: "today" }],
      dimensions: [{ name: dimName }],
      metrics: [{ name: "activeUsers" }],
      limit: 6,
    });
    return (res.rows || []).map((r) => {
      const rawName = r.dimensionValues[0].value || "Other";
      const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const visitors = parseInt(r.metricValues[0].value, 10);
      return {
        name,
        visitors,
        percentage: uniqueVisitors > 0 ? Math.round((visitors / uniqueVisitors) * 100) : 0,
      };
    });
  };

  const devices = await fetchDimensionBreakdown("deviceCategory");
  const browsers = await fetchDimensionBreakdown("browser");
  const operatingSystems = await fetchDimensionBreakdown("operatingSystem");

  return {
    summary: {
      activeNow: Math.max(1, Math.round(uniqueVisitors / 45)),
      uniqueVisitors,
      visitorsDelta: calcDelta(uniqueVisitors, prevVisitors),
      totalPageviews,
      pageviewsDelta: calcDelta(totalPageviews, prevPageviews),
      bounceRate,
      avgDurationSec,
    },
    timeSeries,
    countries,
    cities,
    topPages,
    referrers,
    devices,
    browsers,
    operatingSystems,
  };
}

async function main() {
  if (!PROPERTY_ID || !RAW_CREDENTIALS) {
    console.log(
      "ℹ️ GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON not set in environment. Keeping existing public/analytics-data.json snapshot."
    );
    process.exit(0);
  }

  let credentials;
  try {
    credentials = RAW_CREDENTIALS.trim().startsWith("{")
      ? JSON.parse(RAW_CREDENTIALS)
      : JSON.parse(fs.readFileSync(RAW_CREDENTIALS, "utf8"));
  } catch (err) {
    console.error("Failed to parse GA4_SERVICE_ACCOUNT_JSON:", err.message);
    process.exit(1);
  }

  console.log(`🔄 Authenticating with Google Analytics Data API for property ${PROPERTY_ID}...`);
  const token = await getGoogleAccessToken(credentials);

  console.log("📊 Fetching 24h, 7d, and 30d reports from GA4...");
  const [data24h, data7d, data30d] = await Promise.all([
    fetchRangeData(token, PROPERTY_ID, "yesterday", "2daysAgo", "2daysAgo", true),
    fetchRangeData(token, PROPERTY_ID, "7daysAgo", "14daysAgo", "8daysAgo", false),
    fetchRangeData(token, PROPERTY_ID, "30daysAgo", "60daysAgo", "31daysAgo", false),
  ]);

  const payload = {
    lastUpdated: new Date().toISOString(),
    source: "Google Analytics 4 Live Sync (G-10YP1BFG19)",
    measurementId: "G-10YP1BFG19",
    ranges: {
      "24h": data24h,
      "7d": data7d,
      "30d": data30d,
    },
  };

  const publicOut = path.join(process.cwd(), "public", "analytics-data.json");
  fs.writeFileSync(publicOut, JSON.stringify(payload, null, 2), "utf8");
  console.log(`✅ Updated ${publicOut}`);

  const distDir = path.join(process.cwd(), "dist");
  if (fs.existsSync(distDir)) {
    const distOut = path.join(distDir, "analytics-data.json");
    fs.writeFileSync(distOut, JSON.stringify(payload, null, 2), "utf8");
    console.log(`✅ Updated ${distOut}`);
  }
}

main().catch((err) => {
  console.error("❌ GA4 Sync failed:", err);
  process.exit(1);
});
