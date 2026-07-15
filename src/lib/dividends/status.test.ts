import { describe, expect, it } from "vitest";
import { determineEventStatus } from "./status";

describe("determineEventStatus", () => {
  const today = new Date("2026-03-15T00:00:00Z");

  it("is upcoming when both dates are missing", () => {
    expect(determineEventStatus(null, null, today)).toBe("upcoming");
  });

  it("is upcoming when ex-dividend date is in the future", () => {
    expect(determineEventStatus("2026-03-20", "2026-04-01", today)).toBe("upcoming");
  });

  it("is qualified when ex-dividend date has passed but pay date hasn't", () => {
    expect(determineEventStatus("2026-03-10", "2026-03-20", today)).toBe("qualified");
  });

  it("is qualified when ex-dividend date has passed and pay date is missing", () => {
    expect(determineEventStatus("2026-03-10", null, today)).toBe("qualified");
  });

  it("is confirmed when pay date is today", () => {
    expect(determineEventStatus("2026-03-01", "2026-03-15", today)).toBe("confirmed");
  });

  it("is confirmed when pay date is in the past", () => {
    expect(determineEventStatus("2026-02-15", "2026-03-01", today)).toBe("confirmed");
  });

  it("is confirmed when pay date has passed even without an ex-dividend date", () => {
    expect(determineEventStatus(null, "2026-03-01", today)).toBe("confirmed");
  });
});
