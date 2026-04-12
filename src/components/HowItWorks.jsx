export default function HowItWorks() {
  return (
    <section className="border-b border-neutral-800 bg-neutral-900/50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
            Your Unfair Advantage
          </p>
          <h2 className="text-3xl font-black text-white">
            The Split Cook Method&trade;
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StepCard num="1" color="amber" title="Cook the Base" desc="Protein + carbs + foundation. No spice. No complexity." />
          <StepCard num="2" color="white" title="Split" desc="Divide into two pans at the right moment." isSplit />
          <StepCard num="3" color="red" title="Adult Finish" desc="Bold flavor. Spice. Full experience." />
          <StepCard num="4" color="green" title="Kid Finish" desc="Mild. Simple. Familiar." />
        </div>
        <p className="text-center text-neutral-500 text-sm mt-8">
          One workflow. Two outcomes. Zero extra time.
        </p>
      </div>
    </section>
  );
}

function StepCard({ num, color, title, desc, isSplit }) {
  const borderColor = { amber: "border-amber-500/50", red: "border-red-500/50", green: "border-green-500/50", white: "border-neutral-500/50" }[color];
  const textColor = { amber: "text-amber-400", red: "text-red-400", green: "text-green-400", white: "text-white" }[color];
  const numBg = isSplit
    ? "bg-gradient-to-r from-red-600 to-green-600 text-white"
    : { amber: "bg-amber-500 text-black", red: "bg-red-600 text-white", green: "bg-green-600 text-white", white: "bg-neutral-600 text-white" }[color];

  return (
    <div className={`bg-neutral-900 border ${borderColor} rounded-xl p-5 text-center`}>
      <div className={`w-10 h-10 rounded-full ${numBg} flex items-center justify-center text-sm font-black mx-auto mb-3`}>
        {isSplit ? "\u2194" : num}
      </div>
      <h3 className={`font-bold text-sm ${textColor}`}>{title}</h3>
      <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}
