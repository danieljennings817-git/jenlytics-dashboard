// src/app/site/[code]/ClientSitePage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from "chart.js";
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

type Meter = { id: string; meter_id: string; type: string; unit: string };
type Point = { ts: string; value: number };
type Tariff = { unit: string; unit_rate: number; standing_charge: number; currency: string } | null;

const API = process.env.NEXT_PUBLIC_API_URL!;

const fmtMoney = (v:number, ccy='GBP') =>
  new Intl.NumberFormat('en-GB', { style:'currency', currency: ccy }).format(v);

export default function ClientSitePage({ code }: { code: string }) {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [series, setSeries] = useState<Point[]>([]);
  const [tariff, setTariff] = useState<Tariff>(null);
  const [showCost, setShowCost] = useState(false);
  const [tab, setTab] = useState<"meters"|"billing">("meters");

  // Billing state
  const [bill, setBill] = useState<any>(null);
  const [period, setPeriod] = useState<"thisMonth"|"lastMonth">("thisMonth");

  const asArray = <T,>(v:any, fallback:T[]=[] as T[]) => Array.isArray(v) ? (v as T[]) : fallback;
  const asObject = (v:any) => (v && typeof v === "object" ? v : null);

  // Load meters for site
  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        const r = await fetch(`${API}/meters?site_code=${encodeURIComponent(code)}`, { cache: "no-store" });
        const j = await r.json().catch(() => []);
        const arr = asArray<Meter>(j, []);
        setMeters(arr);
        if (arr.length) setSelectedMeter(arr[0]);
      } catch (e) {
        console.warn("meters fetch failed", e);
        setMeters([]);
      }
    })();
  }, [code]);

  // Load interval series + tariff for selected meter
  useEffect(() => {
    if (!selectedMeter) return;
    (async () => {
      try {
        const r = await fetch(`${API}/series?site_code=${encodeURIComponent(code)}&meter_id=${encodeURIComponent(selectedMeter.meter_id)}&hours=24`, { cache: "no-store" });
        const j = await r.json().catch(() => []);
        setSeries(asArray<Point>(j, []));
      } catch (e) {
        console.warn("series fetch failed", e);
        setSeries([]);
      }
    })();
    (async () => {
      try {
        const r = await fetch(`${API}/tariffs?meter_id=${encodeURIComponent(selectedMeter.meter_id)}`, { cache: "no-store" });
        const j = await r.json().catch(() => null);
        setTariff(asObject(j));
      } catch (e) {
        console.warn("tariff fetch failed", e);
        setTariff(null);
      }
    })();
  }, [selectedMeter, code]);

  // Compute “cost” overlay
  const costSeries: Point[] = useMemo(() => {
    const s = asArray<Point>(series, []);
    if (!tariff || s.length === 0) return [];
    const perPointStanding = (tariff.standing_charge || 0) / s.length; // viz only
    return s.map(p => ({
      ts: p.ts,
      value: (Number(p.value) || 0) * (tariff.unit_rate || 0) + perPointStanding
    }));
  }, [series, tariff]);

  const safeSeries = asArray<Point>(series, []);
  const chartData = useMemo(() => {
    const labels = safeSeries.map(p => new Date(p.ts).toLocaleTimeString());
    const datasets:any[] = [{
      label: selectedMeter ? `${selectedMeter.meter_id} (${selectedMeter.unit})` : "Usage",
      data: safeSeries.map(p => Number(p.value) || 0),
      borderColor: "#111", backgroundColor: "rgba(0,0,0,.06)", fill: true, tension: .3, pointRadius: 0, borderWidth: 2,
    }];
    if (showCost && costSeries.length) {
      datasets.push({
        label: "Cost",
        data: costSeries.map(p => Number(p.value) || 0),
        borderColor: "#1f7ae0", backgroundColor: "rgba(31,122,224,.10)", fill: true, tension: .3, pointRadius: 0, borderWidth: 2,
        yAxisID: 'y1'
      });
    }
    return { labels, datasets };
  }, [safeSeries, selectedMeter, showCost, costSeries]);

  // Billing fetch (site-level)
  useEffect(() => {
    if (tab !== "billing" || !code) return;
    const now = new Date();
    const range = (p:typeof period) => {
      if (p==="lastMonth") {
        const d1 = new Date(now.getFullYear(), now.getMonth()-1, 1);
        const d2 = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: d1.toISOString(), to: d2.toISOString() };
      }
      const d1 = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: d1.toISOString(), to: now.toISOString() };
    };
    const { from, to } = range(period);
    (async () => {
      try {
        const r = await fetch(`${API}/billing/summary?site_code=${encodeURIComponent(code)}&from=${from}&to=${to}`, { cache: "no-store" });
        const j = await r.json().catch(() => null);
        setBill(asObject(j));
      } catch (e) {
        console.warn("billing fetch failed", e);
        setBill(null);
      }
    })();
  }, [tab, code, period]);

  const safeMeters = asArray<Meter>(meters, []);
  const billRows = asArray<any>(bill?.rows, []);

  return (
    <main className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-3">
        <a href="/lnt" className="text-gray-900 font-semibold">← LNT</a>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <img src="/logo.png" alt="Jenlytics" className="h-4 opacity-80" />
          <span>Powered by Jenlytics</span>
        </div>
      </header>

      <h1 className="text-2xl font-extrabold mb-2">{code || "—"}</h1>

      {/* Tabs */}
      <div className="mb-3 flex gap-2">
        <button onClick={()=>setTab("meters")} className={`px-3 py-1 rounded border ${tab==="meters"?"bg-black text-white":"bg-white"}`}>Meters</button>
        <button onClick={()=>setTab("billing")} className={`px-3 py-1 rounded border ${tab==="billing"?"bg-black text-white":"bg-white"}`}>Billing</button>
      </div>

      {tab==="meters" ? (
        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          {/* Left: meters + tariff */}
          <aside className="bg-white border border-gray-200 rounded-xl p-3 space-y-4">
            <div>
              <div className="font-bold mb-2 text-gray-700">Meters</div>
              {safeMeters.length === 0 ? (
                <div className="text-sm text-gray-500">No meters found.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {safeMeters.map(m => (
                    <div key={m.meter_id} onClick={() => setSelectedMeter(m)}
                      className={`p-2 rounded-lg border cursor-pointer ${
                        selectedMeter?.meter_id === m.meter_id
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className="text-sm font-semibold">{m.meter_id}</div>
                      <div className="text-xs text-gray-500">{m.type} · {m.unit}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tariff card + upsert */}
            <div className="border-t pt-3">
              <div className="font-bold text-gray-700 mb-2">Tariff</div>
              {tariff ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Unit: <b>{tariff.unit}</b></div>
                  <div>Rate: <b>{fmtMoney(Number(tariff.unit_rate||0), tariff.currency)}/{tariff.unit}</b></div>
                  <div>Standing: <b>{fmtMoney(Number(tariff.standing_charge||0), tariff.currency)}/day</b></div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No tariff set for this meter.</div>
              )}
              {selectedMeter && (
                <form
                  className="mt-3 grid grid-cols-2 gap-2 text-sm"
                  onSubmit={async (e:any) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const body = {
                      site_code: String(code),
                      meter_id: selectedMeter.meter_id,
                      unit: String(f.get("unit") || selectedMeter.unit),
                      unit_rate: Number(f.get("unit_rate")),
                      standing_charge: Number(f.get("standing_charge")),
                      currency: String(f.get("currency") || "GBP"),
                    };
                    try {
                      const r = await fetch(`${API}/tariffs`, {
                        method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(body)
                      });
                      if (r.ok) setTariff(asObject(await r.json()));
                      else alert('Failed to save tariff');
                    } catch {
                      alert('Failed to save tariff');
                    }
                  }}
                >
                  <input name="unit" defaultValue={selectedMeter.unit} className="border rounded px-2 py-1" placeholder="kWh / m3" />
                  <input name="currency" defaultValue={tariff?.currency || 'GBP'} className="border rounded px-2 py-1" />
                  <input name="unit_rate" type="number" step="0.000001" placeholder="0.2573" className="border rounded px-2 py-1 col-span-2" />
                  <input name="standing_charge" type="number" step="0.000001" placeholder="0.35" className="border rounded px-2 py-1 col-span-2" />
                  <button className="col-span-2 bg-black text-white rounded px-3 py-1">Save Tariff</button>
                </form>
              )}
            </div>
          </aside>

          {/* Right: chart */}
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-gray-500">Selected meter</div>
                <div className="font-bold">{selectedMeter?.meter_id ?? "—"}</div>
              </div>
              <label className="text-sm text-gray-700 flex items-center gap-1">
                <input type="checkbox" checked={showCost} onChange={e => setShowCost(e.target.checked)} />
                Show cost
              </label>
            </div>

            <div style={{ height: 380 }}>
              <Line
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true } },
                  scales: {
                    x: { ticks: { maxTicksLimit: 8 } },
                    y: { beginAtZero: true, title: { display: true, text: selectedMeter?.unit || 'Unit' } },
                    y1:{ beginAtZero: true, position:'right', grid:{ drawOnChartArea:false }, title:{ display: showCost, text:'Cost' } }
                  }
                }}
              />
            </div>
          </section>
        </div>
      ) : (
        // Billing tab
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold">Billing summary</div>
            <div className="flex gap-2 text-sm">
              <button onClick={()=>setPeriod("thisMonth")} className={`px-2 py-1 border rounded ${period==="thisMonth"?"bg-black text-white":""}`}>This month</button>
              <button onClick={()=>setPeriod("lastMonth")} className={`px-2 py-1 border rounded ${period==="lastMonth"?"bg-black text-white":""}`}>Last month</button>
            </div>
          </div>

          {!bill ? (
            <div className="text-gray-500">Loading…</div>
          ) : billRows.length === 0 ? (
            <div className="text-gray-500">No billing data in this period.</div>
          ) : (
            <>
              <div className="mb-3 text-sm text-gray-700">
                Period: {bill?.from ? new Date(bill.from).toLocaleDateString() : "—"} → {bill?.to ? new Date(bill.to).toLocaleDateString() : "—"}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {billRows.map((r:any) => (
                  <div key={r.meter_id} className="border rounded p-3">
                    <div className="font-semibold mb-1">{r.meter_id}</div>
                    <div className="text-sm text-gray-700">Quantity: <b>{Number(r.qty ?? 0).toFixed(2)} {r.unit}</b></div>
                    <div className="text-sm text-gray-700">Energy cost: <b>£{Number(r.energy_cost ?? 0).toFixed(2)}</b></div>
                    <div className="text-sm text-gray-700">Standing ({r.days}d): <b>£{Number(r.standing_cost ?? 0).toFixed(2)}</b></div>
                    <div className="mt-1 font-bold">Total: £{Number(r.total ?? 0).toFixed(2)}</b></div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-right text-lg font-extrabold">
                Site subtotal: £{Number(bill?.site_subtotal ?? 0).toFixed(2)}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
