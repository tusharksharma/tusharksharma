import { useState } from "react";
import track from "../hooks/useTrack";

const KIT_API_KEY = "kit_23ff1501ff395b6cfc66e683e1bdfd67";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://api.kit.com/v4/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": KIT_API_KEY,
        },
        body: JSON.stringify({ email_address: email }),
      });

      if (res.ok) {
        track("email_capture", { email });
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-6 text-center">
        <p className="text-amber-400 font-bold text-sm">You're in.</p>
        <p className="text-neutral-400 text-xs mt-1">New dinners + grocery list drop every Sunday.</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="text-center mb-4">
        <p className="text-white font-bold text-sm">Get 3 dinners + 1 grocery list every Sunday</p>
        <p className="text-neutral-500 text-xs mt-1">New week, new meals, same system. Free.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-wait"
        >
          {loading ? "..." : "Sign Up"}
        </button>
      </form>
      {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
      <p className="text-neutral-600 text-[10px] text-center mt-3">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
