// src/lib/noauth.ts

// Minimal shape like NextAuth's SignInResponse
export type SignInResponseLike = {
  ok: boolean;
  error?: string | null;
  status?: number;
  url?: string | null;
};

export function useSession() {
  return { data: null as any, status: 'unauthenticated' as const };
}

// Accept and ignore args; return a Promise with { ok: boolean }
export async function signIn(
  _provider?: any,
  options?: { callbackUrl?: string } | any,
  _authorizationParams?: any
): Promise<SignInResponseLike> {
  if (typeof window !== 'undefined') {
    // Optional toast to make it obvious in the demo:
    // alert('Authentication is disabled on the static demo. Proceeding...');
  }
  return {
    ok: true,
    status: 200,
    url: options?.callbackUrl ?? '/lnt',
    error: null,
  };
}

// Accept and ignore options for compatibility
export async function signOut(_options?: any): Promise<void> {
  if (typeof window !== 'undefined') {
    // alert('Sign-out is disabled on the static demo.');
    // Simulate redirect if your UI expects it:
    const url = _options?.callbackUrl ?? '/';
    try { window.location.href = url; } catch {}
  }
}




