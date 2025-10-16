export function useSession() {
  return { data: null as any, status: 'unauthenticated' as const };
}

export function signIn() {
  if (typeof window !== 'undefined') alert('Authentication is disabled on the static demo.');
}

export function signOut() {
  if (typeof window !== 'undefined') alert('Authentication is disabled on the static demo.');
}
