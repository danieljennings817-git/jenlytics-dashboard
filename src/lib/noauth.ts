export function useSession() {
  return { data: null as any, status: 'unauthenticated' as const };
}

// Accept and ignore options to match next-auth signatures
export function signIn(_provider?: any, _options?: any, _authorizationParams?: any) {
  if (typeof window !== 'undefined') alert('Authentication is disabled on the static demo.');
}

export function signOut(_options?: any) {
  if (typeof window !== 'undefined') alert('Authentication is disabled on the static demo.');
}


