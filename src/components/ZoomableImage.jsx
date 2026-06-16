import { useEffect, useState } from "react";

// Small inline thumbnail + click-to-expand fullscreen overlay.
// Standing rule: step images on cookbook + recipe detail pages render as
// small thumbnails by default (so the page reads as scannable text + brand
// callouts, not a wall of photos). Click expands to fullscreen overlay.
// Heroes stay large — they're the page hook.
//
// Props:
//   src — image src
//   alt — alt text (passed through to both thumb + expanded view)
//   size — thumb size variant: "sm" (96px) / "md" (128px default) / "lg" (160px)
//   className — extra classes on the thumbnail button wrapper
export default function ZoomableImage({ src, alt = "", size = "md", className = "" }) {
  const [open, setOpen] = useState(false);

  // ESC to close + lock body scroll when overlay is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!src) return null;

  const sizeClasses = {
    sm: "w-24 h-24 sm:w-28 sm:h-28",
    md: "w-32 h-32 sm:w-36 sm:h-36",
    lg: "w-40 h-40 sm:w-48 sm:h-48",
  };
  const thumbSize = sizeClasses[size] || sizeClasses.md;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group inline-block relative cursor-zoom-in mt-2 ${className}`}
        aria-label={`Expand: ${alt || "image"}`}
      >
        <img
          src={src}
          alt={alt}
          className={`${thumbSize} object-cover rounded-lg border border-neutral-800 group-hover:border-amber-500/50 transition-colors`}
          loading="lazy"
        />
        <span
          className="absolute bottom-1 right-1 text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white px-1.5 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          tap to expand
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Expanded image"}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
            aria-label="Close expanded image"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
