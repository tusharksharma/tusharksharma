import { useState } from "react";
import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";
import { downloadBlob, isMobileDevice, zipFiles } from "../utils/downloadFiles";

/**
 * Friday X-thoughts carousel page.
 * Renders pre-built 1080×1350 text slides (matching past ShortSync X carousels).
 * First card is the thumbnail; there is no separate cover card.
 */
export default function XThoughtsSocialPage({ carousel }) {
  const [saveAllBusy, setSaveAllBusy] = useState(false);
  useMeta({
    title: `Social Carousel — ${carousel.title}`,
    description: carousel.subtitle || "Friday X thoughts carousel.",
  });

  const cards = carousel.cards || [];
  const slugForFiles = carousel.slug;

  async function fetchCardFile(card, index) {
    const res = await fetch(card.src);
    if (!res.ok) throw new Error(`Failed to fetch ${card.src}: ${res.status}`);
    const blob = await res.blob();
    const ext = card.src.toLowerCase().endsWith(".png") ? "png" : "jpg";
    return new File([blob], `${slugForFiles}-${String(index + 1).padStart(2, "0")}.${ext}`, {
      type: blob.type || (ext === "png" ? "image/png" : "image/jpeg"),
    });
  }

  async function saveAll() {
    if (saveAllBusy) return;
    setSaveAllBusy(true);
    try {
      const files = [];
      for (let i = 0; i < cards.length; i++) {
        files.push(await fetchCardFile(cards[i], i));
      }
      if (files.length === 0) {
        alert("No cards exported.");
        return;
      }
      if (isMobileDevice() && navigator.canShare?.({ files })) {
        try {
          await navigator.share({ files, title: `${carousel.title} carousel` });
          return;
        } catch (e) {
          if (e.name === "AbortError") return;
        }
      }
      downloadBlob(await zipFiles(files), `${slugForFiles}-carousel.zip`);
    } catch (e) {
      console.error("X-thoughts carousel export failed:", e);
      alert("The carousel could not be downloaded. Please try again.");
    } finally {
      setSaveAllBusy(false);
    }
  }

  async function saveOne(card, index) {
    try {
      const file = await fetchCardFile(card, index);
      downloadBlob(file, file.name);
    } catch (e) {
      console.error(e);
      alert("Could not download that card.");
    }
  }

  const caption = carousel.caption?.default || "";
  const tiktokCaption = carousel.caption?.tiktok || caption;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
          X Thoughts · Friday carousel
        </p>
        <h1 className="text-white text-2xl font-black">Social Carousel</h1>
        <p className="text-neutral-400 text-sm mt-1">{carousel.title}</p>
        {carousel.subtitle ? (
          <p className="text-neutral-500 text-sm mt-0.5">{carousel.subtitle}</p>
        ) : null}
        <p className="text-neutral-500 text-xs mt-2">
          {cards.length} cards · 1080×1350 each. First card is the thumbnail — no separate cover.{" "}
          <span className="text-amber-400">Text slides match the past @splitplates X carousel format (handle, date, page number; no food photos).</span>
        </p>
        <p className="text-neutral-600 text-[10px] mt-1">
          Week of {carousel.weekLabel}. On desktop, Save all downloads one ZIP with all {cards.length} images.
        </p>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={saveAll}
            disabled={saveAllBusy}
            data-testid="save-all"
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {saveAllBusy ? "Saving…" : "Save all images"}
          </button>
          <Link to="/social" className="text-neutral-400 text-sm hover:text-amber-400">
            ← All carousels
          </Link>
        </div>

        <details className="mt-6 bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-bold text-amber-400">Captions (copy-paste)</summary>
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Instagram / Facebook / LinkedIn / Telegram / Threads</p>
              <pre className="whitespace-pre-wrap text-xs text-neutral-300 bg-neutral-900 rounded-lg p-3">{caption}</pre>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">TikTok (link in bio, no URL)</p>
              <pre className="whitespace-pre-wrap text-xs text-neutral-300 bg-neutral-900 rounded-lg p-3">{tiktokCaption}</pre>
            </div>
          </div>
        </details>
      </div>

      <div className="max-w-2xl mx-auto grid gap-8">
        {cards.map((card, i) => (
          <div
            key={card.src}
            data-card-index={i + 1}
            className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
              <p className="text-xs text-neutral-400 font-bold">
                Card {i + 1} · {card.date} · {card.label}
              </p>
              <button
                onClick={() => saveOne(card, i)}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                Save
              </button>
            </div>
            {/* Portrait 1080×1350 preview — scale to container width */}
            <div className="w-full bg-[#f9f4ee] flex justify-center">
              <img
                src={card.src}
                alt={`${carousel.title} card ${i + 1}`}
                className="w-full max-w-[540px] h-auto"
                width={1080}
                height={1350}
                data-card-image="true"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
