"use client";

import { useEffect, useState } from "react";

type Site = { code: string; name?: string };

const API = process.env.NEXT_PUBLIC_API_URL!; // must be set in Render env

export default function LntPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        if (!API) {
          setErr("NEXT_PUBLIC_API_URL is not set");
          setSites([]);
          return;
        }
        const r = await fetch(`${API}/sites`, { cache: "no-store" });
        if (!r.ok) {
          setErr(`API responded ${r.status}`);
          setSites([]);
          return;
        }
        const j = await r.json().catch(() => []);
        if (!Array.isArray(j)) {
          setErr("Unexpected response shape");
          setSites([]);
          return;
        }
        setSites(j);
      } catch (e: any) {
        setErr(String(e?.message || e));
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
          <img src="/lnt-badge.svg" alt="LNT" className="h-6" />
          <h1 className="text-2xl font-extrabold">LNT Group — Energy</h1>
        </div>
        <a href="/" className="text-sm border rounded px-2 py-1 hover:bg-gray-50">Logout</a>
      </header>

      {loading ? (
        <div className="text-gray-500">Loading sites…</div>
      ) : sites.length === 0 ? (
        <div className="text-gray-600">
          <div>No sites to show. Check API connection.</div>
          <div className="mt-2 text-xs text-gray-500">
            <div><b>API:</b> {API || "(not set)"}</div>
            {err && <div><b>Error:</b> {err}</div>}
          </div>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {sites.map(s => (
            <li key={s.code}>
              <a
                href={`/site/${encodeURIComponent(s.code)}`}
                className="block border rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="font-semibold">{s.name || s.code}</div>
                <div className="text-xs text-gray-500">{s.code}</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


