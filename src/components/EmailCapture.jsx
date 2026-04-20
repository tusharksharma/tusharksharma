import { useState } from "react";
import track from "../hooks/useTrack";

const KIT_FORM_ID = "9347142";
const KIT_FORM_URL = `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`;

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    if (!email || !email.includes("@")) {
      e.preventDefault();
      setError("Enter a valid email");
      return;
    }
    // Valid email — track the intent, then let the native form POST go through.
    // Kit's server handles the subscription and redirects back.
    // If Kit is down or unreachable, the user sees Kit's error page — not a false success.
    track("email_capture");
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="text-center mb-4">
        <p className="text-white font-bold text-sm">Get 3 dinners + 1 grocery list every Sunday</p>
        <p className="text-neutral-500 text-xs mt-1">New week, new meals, same system. Free.</p>
      </div>
      <form action={KIT_FORM_URL} method="post" onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          name="email_address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer flex-shrink-0"
        >
          Sign Up
        </button>
      </form>
      {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
      <p className="text-neutral-600 text-[10px] text-center mt-3">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
