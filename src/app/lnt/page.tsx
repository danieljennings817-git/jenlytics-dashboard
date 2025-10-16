"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from '@/lib/noauth';

type Site = { id: string; code: string; name: string };

export default function LntHome() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/proxy/sites`, { cache: "no-store" });
        const data = await r.json().catch(() => null);
        if (Array.isArray(data)) setSites(data.filter(s => s?.code?.startsWith("LNT-")));
        else setSites([]);
      } catch {
        setSites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/lnt_care_developments_logo.jpeg" alt="LNT Group" className="h-9 rounded" />
          <h1 className="text-2xl font-extrabold text-gray-800">LNT Group — Energy</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <img src="/logo.png" alt="Jenlytics" className="h-4 opacity-80" />
            <span>Powered by Jenlytics</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-gray-700 border rounded px-2 py-1 hover:bg-gray-50">
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-gray-500">Loading sites…</div>
      ) : sites.length === 0 ? (
        <div className="text-gray-500">No sites to show. Check API connection.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sites.map((s) => (
            <a key={s.id} href={`/site/${encodeURIComponent(s.code)}`} className="bg-white border rounded-xl p-4 hover:shadow transition">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-gray-500">{s.code}</div>
              <div className="mt-2 text-xs text-gray-700">Electric · Heat · Water</div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}

