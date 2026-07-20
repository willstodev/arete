import { describe, expect, it } from "vitest";
import { EnvironmentError, ValidationError, formatError } from "../../src/diagnostics/errors.js";

describe("formatError", () => {
  it("formats Arete errors with stable codes", () => {
    expect(formatError(new ValidationError("Bad source"))).toBe("VALIDATION_ERROR: Bad source");
    expect(formatError(new EnvironmentError("Missing tool"))).toBe(
      "ENVIRONMENT_ERROR: Missing tool"
    );
  });

  it("formats generic unknown errors", () => {
    expect(formatError(new Error("Generic"))).toBe("Generic");
    expect(formatError("plain")).toBe("plain");
  });
});
