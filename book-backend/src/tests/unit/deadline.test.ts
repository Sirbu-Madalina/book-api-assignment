import { describe, it, expect } from "vitest";
import { getDeadlineText } from "../../../src/util/deadline";

describe("getDeadlineText", () => {
  it("returns 'Due today' when target date is today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(getDeadlineText(today)).toBe("Due today");
  });

  it("returns 'Overdue' when target date is in the past", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const date = yesterday.toISOString().split("T")[0];
    expect(getDeadlineText(date)).toBe("Overdue");
  });

  it("returns '1 day left' when target date is tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = tomorrow.toISOString().split("T")[0];
    expect(getDeadlineText(date)).toBe("1 day left");
  });

  it("returns 'X days left' when target date is several days ahead", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);

    const date = future.toISOString().split("T")[0];
    expect(getDeadlineText(date)).toBe("5 days left");
  });
});