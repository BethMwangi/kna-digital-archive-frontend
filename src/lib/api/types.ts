/** Mirrors accounts/models.py Role.choices. */
export type Role = "customer" | "content_editor" | "admin" | "super_admin";

/** Mirrors accounts/models.py AccountStatus.choices. */
export type AccountStatus = "active" | "suspended";

/** Mirrors accounts/serializers.py UserSerializer. */
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: Role;
  account_status: AccountStatus;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  /** TODO(api): not yet a real backend field — profile.tsx's upload is currently simulated client-side. */
  profile_picture?: string | null;
}

/** SDD §16.2 success envelope, returned by core.api_response. */
export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * SDD §16.19 error envelope, returned by core.exceptions.api_exception_handler.
 * `errors` is the raw DRF error detail: `{}` when the exception carried a
 * single top-level `detail` string (auth failures, permission errors, not
 * found, throttling), otherwise a field-keyed map of message arrays
 * (serializer validation errors) — occasionally a plain string array for
 * non-field errors.
 */
export interface ApiErrorEnvelope {
  success: false;
  code: string;
  message: string;
  errors: Record<string, string[]> | string[] | Record<string, never>;
  timestamp: string;
}

export interface LoginResult {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResult {
  access: string;
  refresh: string;
}

/** DRF pagination shape, nested inside `data` for enveloped list endpoints. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Mirrors apps/assets/serializers.py CategorySerializer. `count`/`cover` are
 * present when a category is nested inside an asset response — not yet
 * confirmed on the standalone GET /categories/ list, so treat as optional.
 */
export interface CategoryOut {
  id: string;
  name: string;
  slug: string;
  description: string;
  count?: number;
  cover?: string;
}

/** Mirrors apps/assets/serializers.py CollectionSerializer. Same `count`/`cover` caveat as CategoryOut. */
export interface CollectionOut {
  id: string;
  name: string;
  slug: string;
  description: string;
  count?: number;
  cover?: string;
}

/** Mirrors apps/assets/serializers.py TagSerializer. */
export interface TagOut {
  id: string;
  name: string;
  slug: string;
}

/** GET /assets/counties/ — distinct county values in use, sorted by count desc. */
export interface CountyOut {
  name: string;
  count: number;
}

/** GET /assets/photographers/ — distinct photographer values in use, sorted by count desc. */
export interface PhotographerOut {
  name: string;
  count: number;
}

export interface AssetMetadataOut {
  keywords: string;
  location: string;
  county: string;
  country: string;
  event_name: string;
  historical_period: string;
  headline: string;
  language: string;
}

export interface AssetVariantPublicOut {
  id: string;
  variant_name: string;
  mime_type: string;
  file_size: number;
}

/** DigitalAssetListSerializer — lightweight grid-card shape, no metadata/variants. */
export interface AssetListItem {
  id: string;
  asset_number: string;
  title: string;
  asset_type: string;
  status: string;
  visibility: string;
  category: CategoryOut | null;
  collection: CollectionOut | null;
  tags: TagOut[];
  photographer: string;
  publication_date: string | null;
  created_at: string;
  /** Watermarked, small — for listing grids. */
  thumbnail: string;
  /** Flat per-asset price — no resolution tiers. */
  price: number;
  currency: string;
  /** True for two-sided prints — the detail endpoint's `image_back` is only meaningful then. */
  has_back: boolean;
}

/** DigitalAssetDetailSerializer — full detail/buy page shape. */
export interface AssetDetail extends AssetListItem {
  description: string;
  caption: string;
  photographer_credit: string;
  source: string;
  copyright_holder: string;
  capture_date: string | null;
  metadata: AssetMetadataOut | null;
  variants: AssetVariantPublicOut[];
  /** Watermarked preview, large — detail page hero (front side). */
  image: string;
  /** Watermarked preview of the reverse side — present only when has_back is true. */
  image_back: string | null;
  updated_at: string;
}

/** GET /licenses/ — 4 fixed license types (Editorial/Commercial/Educational/Government). */
export interface LicenseOut {
  id: string;
  name: string;
  slug: string;
  description: string;
  allows_commercial?: boolean;
}

/** The asset fields nested directly in a cart item — no extra round-trip needed. */
export interface CartItemAssetOut {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
}

export interface CartItemOut {
  id: string;
  asset: CartItemAssetOut;
  license: LicenseOut;
  subtotal: number;
}

/** GET /cart/ — every cart mutation (add/remove/clear) returns this same shape. */
export interface CartOut {
  items: CartItemOut[];
  total: number;
  item_count: number;
}

/** Mirrors OrderItem serializer — same shape in the list, detail, and checkout responses. */
export interface OrderItemOut {
  id: string;
  asset_title_snapshot: string;
  asset: CartItemAssetOut;
  license: LicenseOut;
  /** Frozen at purchase time — immune to later price changes. */
  price_at_purchase: number;
}

/** GET /orders/, GET /orders/{id}/, POST /orders/checkout/ response. */
export interface OrderOut {
  id: string;
  order_number: string;
  status: string;
  notes?: string;
  items: OrderItemOut[];
  item_count: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  created_at: string;
}

/** POST /payments/initiate/ and /payments/{id}/ responses. */
export interface PaymentOut {
  id: string;
  order: string;
  provider: string;
  /** e.g. "pending" | "success" | "failed" — full enum not yet confirmed. */
  status: string;
  /** Not yet confirmed on the response — assumed to mirror the order total. */
  amount?: number;
  /** Present on initiate — the mock gateway's own "Pay Now" test page. */
  simulate_url?: string;
  created_at: string;
}

/** GET /downloads/ — one purchased entitlement per (asset, license) line on a paid order. Flat shape, no nested asset/license objects. */
export interface DownloadOut {
  id: string;
  asset_title: string;
  asset_number: string;
  thumbnail: string;
  license_name: string;
  order_number: string;
  download_count: number;
  max_downloads: number;
  created_at?: string;
}

/** GET /downloads/{id}/link/ — a freshly minted signed URL, expires in 15 min. */
export interface DownloadLinkOut {
  url: string;
  expires_at?: string;
}

/**
 * GET /assets/search/ — enveloped like every other endpoint; `data` carries
 * the DRF pagination fields plus `query`/`match_type`. `match_type` says which
 * engine answered: "meilisearch" (primary), "text"/"fuzzy" (Postgres fallback
 * + typo-correction), or "none" (empty query).
 */
export interface AssetSearchOut {
  count: number;
  next: string | null;
  previous: string | null;
  results: AssetListItem[];
  match_type: "meilisearch" | "text" | "fuzzy" | "none";
  query: string;
}

/** GET /assets/suggest/ — top 8, minimal payload for the live dropdown. */
export interface AssetSuggestionOut {
  id: string;
  asset_number: string;
  title: string;
  thumbnail: string;
  price: number;
}
