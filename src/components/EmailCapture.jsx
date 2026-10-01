import { useState } from "react";
import { Link } from "react-router-dom";
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
    // This event measures submit intent only. Kit is the source of truth for
    // accepted and confirmed subscribers; a cross-origin POST can still fail.
    track("newsletter_submit", { form_id: KIT_FORM_ID });
  };

  return (
    <div className="bg-surface border border-line rounded-xl p-6">
      <div className="text-center mb-4">
        <p className="text-ink font-bold text-sm">Get 3 dinners + 1 grocery list every Sunday</p>
        <p className="text-muted text-xs mt-1">New week, new meals, same system. Free.</p>
      </div>
      <form action={KIT_FORM_URL} method="post" onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mx-auto sm:flex-row">
        <label htmlFor="newsletter-email" className="text-ink text-xs font-semibold sm:sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email_address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          required
          className="w-full min-w-0 flex-1 px-4 py-2.5 bg-surface2 border border-line rounded-lg text-ink text-sm placeholder-faint focus:outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          className="w-full px-5 py-2.5 bg-brand text-brandink font-bold rounded-lg text-sm hover:bg-brand transition-colors cursor-pointer sm:w-auto sm:flex-shrink-0"
        >
          Sign Up
        </button>
      </form>
      {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
      <p className="text-faint text-[11px] text-center mt-3 leading-relaxed">
        Your email goes to Kit to send this newsletter. Unsubscribe anytime. Read our{" "}
        <Link to="/privacy" className="text-brand underline underline-offset-2 hover:text-ink">Privacy Policy</Link>
        {" "}and{" "}
        <Link to="/terms" className="text-brand underline underline-offset-2 hover:text-ink">Terms</Link>.
      </p>
    </div>
  );
}
