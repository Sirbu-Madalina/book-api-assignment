import { describe, it, expect } from "vitest";
import { getProgressPercent } from "../../../src/util/progress";

describe("getProgressPercent", () => {
  it("returns 0 when totalPages is 0", () => {
    expect(getProgressPercent(10, 0)).toBe(0);
  });

  it("returns 0 when currentPage is 0", () => {
    expect(getProgressPercent(0, 200)).toBe(0);
  });

  it("calculates the correct percentage", () => {
    expect(getProgressPercent(50, 200)).toBe(25);
  });

  it("caps the result at 100", () => {
    expect(getProgressPercent(500, 300)).toBe(100);
  });
});