// src/app/site/[code]/page.tsx
import ClientSitePage from "./ClientSitePage";

export const dynamicParams = false;

export async function generateStaticParams() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  try {
    const r = await fetch(`${API}/sites`, { cache: "no-store" });
    if (!r.ok) return [];
    const sites = await r.json();
    return sites.map((s: any) => ({ code: s.code }));
  } catch {
    return [];
  }
}

// ⬇️ params is a Promise in Next 15, so await it:
export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ClientSitePage code={code} />;
}





