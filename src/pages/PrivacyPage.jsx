import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";

export default function PrivacyPage() {
  useMeta({ title: "Privacy Policy", description: "How The Split Plate handles your data — what we collect, what we don't, and how the Split Plate posting tool uses social account access." });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-amber-400 text-sm font-semibold mt-2">Last updated: June 18, 2026</p>

        <div className="mt-8 space-y-5 text-neutral-300 text-sm leading-relaxed">
          <p>
            The Split Plate (<span className="text-white">thesplitplate.com</span>) is a personal recipe
            website run by an individual. This policy explains what data is and isn't collected, both on
            the website and through the Split Plate posting tool described below.
          </p>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm mb-3">The website</h2>
            <p className="text-neutral-400 text-sm">
              The website is a static recipe site. It has no user accounts, no sign-in, and no shopping
              cart. We don't ask you for personal information, and we don't sell or share any. Standard
              hosting logs (such as IP address and browser type) may be processed by our hosting provider
              for security and reliability, as is typical for any website.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm mb-3">The Split Plate posting tool</h2>
            <p className="text-neutral-400 text-sm mb-2">
              The Split Plate posting tool is a small application the site operator runs on their own
              computer to publish their own short cooking videos to their own YouTube, Instagram, and
              TikTok accounts. It is not a public service and is used only by the account owner.
            </p>
            <ul className="space-y-1.5 text-neutral-400 text-sm list-disc pl-5">
              <li>
                It connects to each platform using that platform's official login (OAuth). Access tokens
                are stored locally on the operator's own computer and are never transmitted to any
                third-party server.
              </li>
              <li>
                It only ever accesses the account that the operator personally authorizes, and only to
                upload videos and captions the operator explicitly chooses to post.
              </li>
              <li>
                It does not read, collect, store, or share any other person's data, followers, messages,
                or analytics.
              </li>
              <li>
                Access can be revoked at any time from the platform's own settings (for example, your
                Google, Instagram, or TikTok account's connected-apps page).
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm mb-3">Third-party platforms</h2>
            <p className="text-neutral-400 text-sm">
              When content is posted to YouTube, Instagram, or TikTok, that content and its handling are
              then governed by each platform's own terms and privacy policies. We encourage you to review
              them.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm mb-3">Contact</h2>
            <p className="text-neutral-400 text-sm">
              Questions about this policy? Email <span className="text-amber-400">splitplates@gmail.com</span>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link to="/" className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors">
            Back home
          </Link>
          <Link to="/terms" className="px-5 py-2.5 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 text-sm hover:bg-neutral-700 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
