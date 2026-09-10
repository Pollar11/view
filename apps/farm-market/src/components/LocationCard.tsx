import {
  FARM_ADDRESS_LABEL,
  FARM_HOURS,
  FARM_MAP_EMBED_URL,
  FARM_PHONE,
  FARM_PHONE_TEL,
  GOOGLE_MAPS_DIRECTIONS_URL,
} from "@/lib/site";
import { CopyButton } from "./CopyButton";

export function LocationCard({
  heading = "Our Address & Pickup",
  description = "Our order-processing hub — deliveries ship from here within a ~320 mile radius (Anaheim, CA included).",
}: {
  heading?: string;
  description?: string;
}) {
  return (
    <div className="card grid overflow-hidden md:grid-cols-2">
      <div className="aspect-[4/3] w-full md:aspect-auto">
        <iframe
          title="Map to Meadow & Market"
          src={FARM_MAP_EMBED_URL}
          className="h-full w-full grayscale-[15%]"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold">{heading}</h3>
        <p className="mt-1 text-sm text-ink-light/85 dark:text-ink-dark/85">{description}</p>

        <div className="mt-4 space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <a href={GOOGLE_MAPS_DIRECTIONS_URL} target="_blank" rel="noreferrer" className="font-medium hover:underline">
              {FARM_ADDRESS_LABEL}
            </a>
            <CopyButton text={FARM_ADDRESS_LABEL} label="Copy" />
          </div>
          <a href={`tel:${FARM_PHONE_TEL}`} className="block hover:underline">
            {FARM_PHONE}
          </a>
        </div>

        <table className="mt-4 w-full text-sm text-ink-light/70 dark:text-ink-dark/70">
          <tbody>
            {FARM_HOURS.map((h) => (
              <tr key={h.day}>
                <td className="py-0.5 pr-4 font-medium">{h.day}</td>
                <td className="py-0.5">{h.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <a
          href={GOOGLE_MAPS_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-4 inline-flex"
        >
          Get directions
        </a>
      </div>
    </div>
  );
}
