import { describe, expect, it } from "vitest";
import { parseDecimal } from "./format";

describe("parseDecimal", () => {
  it("parses a plain integer", () => {
    expect(parseDecimal("10")).toBe(10);
  });

  it("parses a dot decimal", () => {
    expect(parseDecimal("12.5")).toBe(12.5);
  });

  it("parses a comma decimal", () => {
    expect(parseDecimal("12,5")).toBe(12.5);
  });

  it("strips a thousands separator before the decimal comma", () => {
    expect(parseDecimal("1.234,56")).toBe(1234.56);
  });

  it("strips a thousands separator before the decimal dot", () => {
    expect(parseDecimal("1,234.56")).toBe(1234.56);
  });

  it("handles surrounding whitespace", () => {
    expect(parseDecimal("  42,10  ")).toBe(42.1);
  });

  it("returns NaN for garbage input", () => {
    expect(parseDecimal("abc")).toBeNaN();
  });
});
