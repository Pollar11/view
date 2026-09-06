import { LocationCard } from "@/components/LocationCard";

export const metadata = { title: "Locations — Meadow & Market" };

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Our location</h1>
      <p className="mt-2 text-ink-light/60 dark:text-ink-dark/60">
        One farm, one delivery hub — we ship everything from Oakland. As we
        grow, additional pickup points will be listed here.
      </p>
      <div className="mt-8">
        <LocationCard />
      </div>

      <div className="mt-10 card p-6">
        <h2 className="font-semibold">Delivery area</h2>
        <p className="mt-2 text-sm text-ink-light/70 dark:text-ink-dark/70">
          We deliver within roughly a 320 mile radius of Oakland — that
          reaches most of California and neighboring states, including
          Anaheim, CA. Enter your ZIP at checkout for an exact distance and
          delivery-time estimate.
        </p>
      </div>
    </div>
  );
}
