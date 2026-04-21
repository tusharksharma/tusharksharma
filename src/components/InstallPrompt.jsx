import { useState, useEffect } from "react";
import track from "../hooks/useTrack";

let deferredPrompt = null;

export default function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Don't show if user already dismissed
      if (localStorage.getItem("sp_install_dismissed")) return;
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    track("pwa_install", { outcome: result.outcome });
    deferredPrompt = null;
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("sp_install_dismissed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto bg-neutral-900 border border-amber-500/40 rounded-xl p-4 shadow-2xl flex items-center gap-3">
      <img src="/images/favicon.png" alt="" className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">Add to Home Screen</p>
        <p className="text-neutral-400 text-xs">Quick access to recipes + grocery lists</p>
      </div>
      <button onClick={handleInstall} className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors cursor-pointer flex-shrink-0">
        Install
      </button>
      <button onClick={handleDismiss} className="text-neutral-600 hover:text-neutral-400 text-lg cursor-pointer flex-shrink-0">&times;</button>
    </div>
  );
}
