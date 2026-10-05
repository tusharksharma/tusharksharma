export const config = { runtime: "edge" };

const RELEASES = {
  "chipotle-queso-tacos": "https://github.com/tusharksharma/tusharksharma/releases/download/site-videos-2026-09/",
};

export default async function handler(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const release = RELEASES[searchParams.get("collection")];
  const filename = searchParams.get("filename") || "";
  if (!release || !/^[a-zA-Z0-9_-]+\.mp4$/.test(filename)) {
    return new Response("Video not found", { status: 404 });
  }

  const upstream = await fetch(release + filename, {
    method: request.method,
    headers: request.headers.has("range") ? { Range: request.headers.get("range") } : {},
    redirect: "follow",
  });

  if (!upstream.ok) {
    return new Response("Video unavailable", { status: upstream.status });
  }

  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Content-Disposition": "inline",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  });
  for (const key of ["Content-Length", "Content-Range", "ETag", "Last-Modified"]) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
