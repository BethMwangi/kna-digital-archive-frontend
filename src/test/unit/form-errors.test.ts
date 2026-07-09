import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

function makeError(
  status: number,
  errors: Record<string, string[]> = {},
  message = "Validation failed.",
) {
  return new ApiError(status, {
    success: false,
    code: "VALIDATION_ERROR",
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
}

describe("ApiError.fieldErrors", () => {
  it("joins multi-message arrays into a single string per field", () => {
    const error = makeError(400, { password: ["Too short.", "Too common."] });
    expect(error.fieldErrors()).toEqual({ password: "Too short. Too common." });
  });

  it("returns an empty object when errors is an array (non-field DRF error) or empty", () => {
    expect(makeError(429, {}).fieldErrors()).toEqual({});
  });
});

describe("applyApiErrorToForm", () => {
  it("maps field errors onto the form and returns no top-level message", () => {
    const setError = vi.fn();
    const error = makeError(400, { email: ["An account with this email already exists."] });

    const topLevel = applyApiErrorToForm(error, setError);

    expect(setError).toHaveBeenCalledWith("email", {
      type: "server",
      message: "An account with this email already exists.",
    });
    expect(topLevel).toBe("");
  });

  it("surfaces non_field_errors as a top-level message instead of setting a field", () => {
    const setError = vi.fn();
    const error = makeError(400, { non_field_errors: ["This account has been suspended."] });

    const topLevel = applyApiErrorToForm(error, setError);

    expect(setError).not.toHaveBeenCalled();
    expect(topLevel).toBe("This account has been suspended.");
  });

  it("falls back to error.message when there are no field errors at all (e.g. auth failures)", () => {
    const setError = vi.fn();
    const error = makeError(401, {}, "No active account found with the given credentials");

    const topLevel = applyApiErrorToForm(error, setError);

    expect(setError).not.toHaveBeenCalled();
    expect(topLevel).toBe("No active account found with the given credentials");
  });

  it("returns a generic message for non-ApiError failures (e.g. network errors)", () => {
    const setError = vi.fn();
    const topLevel = applyApiErrorToForm(new TypeError("Failed to fetch"), setError);

    expect(setError).not.toHaveBeenCalled();
    expect(topLevel).toBe("Something went wrong. Please try again.");
  });
});
