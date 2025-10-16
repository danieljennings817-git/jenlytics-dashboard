// Browser-safe stub for static export.
// The dashboard should call your Render API, not the DB directly.

export type QueryResult<T = any> = { rows: T[] };

// Used only to make existing imports compile if they expect `pool`
export const pool: undefined = undefined;

export async function query(_text: string, _params?: any[]): Promise<QueryResult> {
  throw new Error(
    "Direct DB access is disabled in the static dashboard. Use the API (NEXT_PUBLIC_API_URL) instead."
  );
}

