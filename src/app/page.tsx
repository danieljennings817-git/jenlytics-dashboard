"use client";
import { useSession, signIn, signOut } from '@/lib/noauth';
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("lnt.user@example.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/lnt" });
    if (res?.ok) window.location.href = "/lnt";
    else setErr("Invalid email or password");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo.png" className="h-7" alt="Jenlytics" />
          <div className="text-sm text-gray-600">Jenlytics Portal</div>
        </div>
        <h1 className="text-xl font-extrabold text-center text-gray-800 mb-2">Sign in</h1>
        <p className="text-center text-sm text-gray-600 mb-6">Access your dashboards</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button type="submit" className="w-full bg-gray-900 text-white font-semibold rounded-lg py-2 hover:bg-black transition">Continue</button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">© Jenlytics</div>
      </div>
    </main>
  );
}




