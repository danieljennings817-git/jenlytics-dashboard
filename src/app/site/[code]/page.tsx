// src/app/site/[code]/page.tsx
import { fileURLToPath } from "url";
import ClientSitePage from "./ClientSitePage";

export const dynamicParams = false;

export async function generateStaticParams() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  try {
    const r = await fetch(`${API}/sites`, { cache: "no-store" });
    if (!r.ok) return [];
    const sites = await r.json();
    // your /sites returns [{ code, name }]
    return sites.map((s: any) => ({ code: s.code }));
  } catch {
    return [];
  }
}

export default function Page({ params }: { params: { code: string } }) {
  return <ClientSitePage code={params.code} />;
}




