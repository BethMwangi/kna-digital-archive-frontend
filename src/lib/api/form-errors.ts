import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./client";

/**
 * Maps a failed mutation's ApiError onto react-hook-form fields whose name
 * matches a DRF error key, and returns a leftover top-level message (DRF's
 * non_field_errors, or the envelope's `message` for auth-failure/detail
 * style errors) to show in a banner/alert.
 */
export function applyApiErrorToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  const fieldErrors = error.fieldErrors();
  let topLevelMessage = "";
  let matchedAnyField = false;

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (field === "non_field_errors") {
      topLevelMessage = message;
      continue;
    }
    setError(field as Path<T>, { type: "server", message });
    matchedAnyField = true;
  }

  if (!matchedAnyField && !topLevelMessage) {
    topLevelMessage = error.message;
  }

  return topLevelMessage;
}
