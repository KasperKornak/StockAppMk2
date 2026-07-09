import { describe, expect, it } from "vitest";
import { determineEventStatus } from "./status";

describe("determineEventStatus", () => {
  const today = new Date("2026-03-15T00:00:00Z");

  it("is upcoming when pay date is missing", () => {
    expect(determineEventStatus(null, today)).toBe("upcoming");
  });

  it("is upcoming when pay date is in the future", () => {
    expect(determineEventStatus("2026-03-20", today)).toBe("upcoming");
  });

  it("is confirmed when pay date is today", () => {
    expect(determineEventStatus("2026-03-15", today)).toBe("confirmed");
  });

  it("is confirmed when pay date is in the past", () => {
    expect(determineEventStatus("2026-03-01", today)).toBe("confirmed");
  });
});
