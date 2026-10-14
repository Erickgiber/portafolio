import { describe, expect, it } from "vitest";
import { deleteBackward, insertText, moveCaret } from "../../src/lib/gamepad/textEditing";

describe("insertText", () => {
  it("inserts at the caret and moves it forward", () => {
    expect(insertText({ value: "helo", start: 3, end: 3 }, "l")).toEqual({
      value: "hello",
      start: 4,
      end: 4,
    });
  });

  it("replaces the selected range", () => {
    expect(insertText({ value: "hello world", start: 6, end: 11 }, "there")).toEqual({
      value: "hello there",
      start: 11,
      end: 11,
    });
  });
});

describe("deleteBackward", () => {
  it("removes the character before the caret", () => {
    expect(deleteBackward({ value: "abc", start: 2, end: 2 })).toEqual({
      value: "ac",
      start: 1,
      end: 1,
    });
  });

  it("does nothing at the start of the text", () => {
    expect(deleteBackward({ value: "abc", start: 0, end: 0 })).toEqual({
      value: "abc",
      start: 0,
      end: 0,
    });
  });

  it("removes the selection when there is one", () => {
    expect(deleteBackward({ value: "abcdef", start: 1, end: 4 })).toEqual({
      value: "aef",
      start: 1,
      end: 1,
    });
  });

  it("removes characters outside the basic plane as a whole", () => {
    const value = "ok\u{1F600}";
    expect(deleteBackward({ value, start: value.length, end: value.length })).toEqual({
      value: "ok",
      start: 2,
      end: 2,
    });
  });
});

describe("moveCaret", () => {
  it("moves within the bounds of the text", () => {
    expect(moveCaret({ value: "ab", start: 0, end: 0 }, -1).start).toBe(0);
    expect(moveCaret({ value: "ab", start: 2, end: 2 }, 1).start).toBe(2);
    expect(moveCaret({ value: "ab", start: 1, end: 1 }, 1).start).toBe(2);
  });

  it("collapses a selection toward the movement direction", () => {
    expect(moveCaret({ value: "abcd", start: 1, end: 3 }, -1)).toEqual({
      value: "abcd",
      start: 1,
      end: 1,
    });
    expect(moveCaret({ value: "abcd", start: 1, end: 3 }, 1)).toEqual({
      value: "abcd",
      start: 3,
      end: 3,
    });
  });
});
