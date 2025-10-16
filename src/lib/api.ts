const API = process.env.NEXT_PUBLIC_API_URL!;

export async function getSites() {
  const r = await fetch(`${API}/sites`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load sites");
  return r.json();
}

export async function getMeters(site: string) {
  const r = await fetch(`${API}/meters?site_code=${encodeURIComponent(site)}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load meters");
  return r.json();
}

export async function getSeries(site: string, meter: string, hours = 24) {
  const qs = new URLSearchParams({ site_code: site, meter_id: meter, hours: String(hours) });
  const r = await fetch(`${API}/series?${qs}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load series");
  return r.json();
}
