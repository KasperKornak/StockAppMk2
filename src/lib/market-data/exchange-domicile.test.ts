import { describe, expect, it } from "vitest";
import { guessDomicileFromExchange } from "./exchange-domicile";

describe("guessDomicileFromExchange", () => {
  it("maps known US exchanges to USA", () => {
    expect(guessDomicileFromExchange("XNAS")).toBe("USA");
    expect(guessDomicileFromExchange("XNYS")).toBe("USA");
  });

  it("maps known foreign exchanges to their country", () => {
    expect(guessDomicileFromExchange("XLON")).toBe("GBR");
    expect(guessDomicileFromExchange("XWAR")).toBe("POL");
  });

  it("returns null for unknown or missing exchange codes", () => {
    expect(guessDomicileFromExchange("XXXX")).toBeNull();
    expect(guessDomicileFromExchange(null)).toBeNull();
  });
});
