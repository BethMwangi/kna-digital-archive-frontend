/**
 * Anonymous cart for logged-out visitors — kept entirely client-side
 * (localStorage), never touching the backend. The near-universal
 * e-commerce pattern: let people browse and collect items freely, and only
 * require an account at checkout (the auth-required cart API is the
 * "logged-in" half of that; this module is the "guest" half). Replayed into
 * the real server cart on login — see merge-guest-cart.ts.
 */

const STORAGE_KEY = "kna.guestCart";

export interface GuestCartLine {
  asset_id: string;
  license_id: string;
  title: string;
  thumbnail: string;
  price: number;
  license_name: string;
}

const EMPTY: GuestCartLine[] = [];

let lines: GuestCartLine[] = readCached();
const listeners = new Set<() => void>();

function readCached(): GuestCartLine[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestCartLine[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist(next: GuestCartLine[]) {
  lines = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLines(): GuestCartLine[] {
  return lines;
}

export function getServerLines(): GuestCartLine[] {
  return EMPTY;
}

/** No-ops if this exact asset+license pair is already in the guest cart. */
export function addLine(line: GuestCartLine) {
  const exists = lines.some(
    (l) => l.asset_id === line.asset_id && l.license_id === line.license_id,
  );
  if (exists) return;
  persist([...lines, line]);
}

export function removeLine(assetId: string, licenseId: string) {
  persist(lines.filter((l) => !(l.asset_id === assetId && l.license_id === licenseId)));
}

export function clearLines() {
  persist([]);
}
