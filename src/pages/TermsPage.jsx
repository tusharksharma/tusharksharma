import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";

export default function TermsPage() {
  useMeta({ title: "Terms of Service", description: "The terms for using The Split Plate website and the Split Plate posting tool." });

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black text-ink">Terms of Service</h1>
        <p className="text-brand text-sm font-semibold mt-2">Last updated: June 18, 2026</p>

        <div className="mt-8 space-y-5 text-muted text-sm leading-relaxed">
          <p>
            These terms cover your use of The Split Plate website (<span className="text-ink">thesplitplate.com</span>)
            and the Split Plate posting tool. By using either, you agree to what's below. If you don't
            agree, please don't use them.
          </p>

          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">Using the website</h2>
            <p className="text-muted text-sm">
              The recipes, nutrition figures, and other content here are provided for personal,
              informational use. They aren't medical or dietary advice. Cook safely, check ingredients
              against your own allergies and needs, and use your judgment.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">The posting tool</h2>
            <p className="text-muted text-sm mb-2">
              The Split Plate posting tool is a personal-use application the site operator runs on their
              own computer to publish their own videos to their own social accounts.
            </p>
            <ul className="space-y-1.5 text-muted text-sm list-disc pl-5">
              <li>It is used only by the account owner to post content they own or have the right to share.</li>
              <li>
                All posting through YouTube, Instagram, and TikTok must comply with each platform's own
                terms, community guidelines, and developer policies.
              </li>
              <li>The tool is provided as-is, without warranties of any kind.</li>
            </ul>
          </div>

          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">Limitation of liability</h2>
            <p className="text-muted text-sm">
              The Split Plate is a personal project offered without guarantees. To the fullest extent
              permitted by law, the operator isn't liable for any loss or damage arising from use of the
              website or the posting tool.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">Changes &amp; contact</h2>
            <p className="text-muted text-sm">
              These terms may be updated from time to time; the date above reflects the latest version.
              Questions? Email <span className="text-brand">splitplates@gmail.com</span>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link to="/" className="px-5 py-2.5 bg-brand text-brandink font-bold rounded-xl text-sm hover:bg-brand transition-colors">
            Back home
          </Link>
          <Link to="/privacy" className="px-5 py-2.5 bg-surface2 text-ink font-bold rounded-xl border border-line text-sm hover:bg-line transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
