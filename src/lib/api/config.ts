const rawBaseUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!rawBaseUrl && import.meta.env.DEV) {
  console.warn(
    "VITE_API_URL is not set — falling back to http://localhost:8000/api/v1. Add it to your .env file (see .env.example).",
  );
}

export const API_BASE_URL = (rawBaseUrl ?? "http://localhost:8000/api/v1").replace(/\/+$/, "");
