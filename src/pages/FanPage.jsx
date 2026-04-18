import FanSpinner from "../components/FanSpinner";
import useMeta from "../hooks/useMeta";

export default function FanPage() {
  useMeta({ title: "In the Hands of the Fan", description: "Can't decide what to cook? Spin the fan and let it pick your dinner." });
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <FanSpinner />
    </div>
  );
}
