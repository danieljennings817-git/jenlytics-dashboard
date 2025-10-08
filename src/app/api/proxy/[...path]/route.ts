import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;

function targetUrl(req: NextRequest, parts: string[]) {
  return `${API_BASE}/${parts.join("/")}${req.nextUrl.search || ""}`;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;                 // ✅ await here
  const url = targetUrl(req, path);
  try {
    const r = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    const body = await r.text();
    return new NextResponse(body, { status: r.status, headers: { "content-type": r.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return NextResponse.json({ error: "proxy_error", detail: e?.message || String(e), url }, { status: 502 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;                 // ✅ and here
  const url = targetUrl(req, path);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": req.headers.get("content-type") || "application/json" },
      body: await req.text(),
      cache: "no-store",
    });
    const body = await r.text();
    return new NextResponse(body, { status: r.status, headers: { "content-type": r.headers.get("content-type") || "application/json" } });
  } catch (e: any) {
    return NextResponse.json({ error: "proxy_error", detail: e?.message || String(e), url }, { status: 502 });
  }
}


