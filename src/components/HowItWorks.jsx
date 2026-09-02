function StepCard({ num, color, title, desc, isSplit }) {
  const borderColor = { amber: "border-brand/50", red: "border-red-500/50", green: "border-green-500/50", white: "border-line/50" }[color];
  const textColor = { amber: "text-brand", red: "text-red-400", green: "text-green-400", white: "text-ink" }[color];
  const numBg = isSplit
    ? "bg-gradient-to-r from-red-600 to-green-600 text-ink"
    : { amber: "bg-brand text-brandink", red: "bg-red-600 text-ink", green: "bg-green-600 text-ink", white: "bg-line text-ink" }[color];

  return (
    <div className={`bg-surface border ${borderColor} rounded-xl p-5 text-center`}>
      <div
        className={`w-10 h-10 rounded-full ${numBg} flex items-center justify-center text-sm font-black mx-auto mb-3`}
        aria-label={isSplit ? `Step ${num}` : undefined}
      >
        <span aria-hidden={isSplit ? "true" : undefined}>{isSplit ? "\u2194" : num}</span>
      </div>
      <h3 className={`font-bold text-sm ${textColor}`}>{title}</h3>
      <p className="text-muted text-xs mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="border-b border-line bg-surface/50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-2">How It Works</p>
          <h2 className="text-3xl font-black text-ink">The Split Cook Method</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StepCard num="1" color="amber" title="Cook the Base" desc="Protein + carbs + foundation. No spice. No complexity." />
          <StepCard num="2" color="white" title="Split" desc="Divide into two pans at the right moment." isSplit />
          <StepCard num="3" color="red" title="Adult Finish" desc="Bold flavor. Spice. Full experience." />
          <StepCard num="4" color="green" title="Kid Finish" desc="Mild. Simple. Familiar." />
        </div>
        <p className="text-center text-muted text-sm mt-8">One cook. Two plates. Same amount of time.</p>
      </div>
    </section>
  );
}
