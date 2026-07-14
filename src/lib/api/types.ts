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

/** Mirrors apps/assets/serializers.py CategorySerializer. */
export interface CategoryOut {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/** Mirrors apps/assets/serializers.py CollectionSerializer. */
export interface CollectionOut {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/** Mirrors apps/assets/serializers.py TagSerializer. */
export interface TagOut {
  id: string;
  name: string;
  slug: string;
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
  /** Watermarked preview, large — detail page hero. */
  image: string;
  updated_at: string;
}

/** GET /licenses/ — 4 fixed license types (Editorial/Commercial/Educational/Government). */
export interface LicenseOut {
  id: string;
  name: string;
  slug: string;
  description: string;
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
