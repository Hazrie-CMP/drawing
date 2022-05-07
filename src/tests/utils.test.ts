import { API } from "./helpers/api";
import * as utils from "../utils";

describe("Test isTransparent", () => {
  it("should return true when color is rgb transparent", () => {
    expect(utils.isTransparent("#ff00")).toEqual(true);
    expect(utils.isTransparent("#fff00000")).toEqual(true);
    expect(utils.isTransparent("transparent")).toEqual(true);
  });

  it("should return false when color is not transparent", () => {
    expect(utils.isTransparent("#ced4da")).toEqual(false);
  });
});

describe("getLineGroupedRanges", () => {
  it.each([1, 2, 3])(
    "given N lines where N=%i, should return N+1 ranges",
    (numberOfNewLines) => {
      const text = Array.from(
        { length: numberOfNewLines + 1 },
        (_, i) => `line ${i + 1}`,
      ).join("\n");

      expect(
        utils.getLineGroupedRanges(API.createElement({ type: "text", text })),
      ).toHaveLength(numberOfNewLines + 1);
    },
  );

  it("should span color range correctly across newline", () => {
    expect(
      utils.getLineGroupedRanges(
        API.createElement({
          type: "text",
          text: "a\na",
          colorRanges: { 0: "#fff", 1: "#fff" },
          strokeColor: "#000",
        }),
      ),
    ).toEqual<utils.LineGroupedRanges>([
      [{ color: "#fff", text: "a" }],
      [{ color: "#000", text: "a" }],
    ]);
  });

  it("should span color range correctly across carriage return", () => {
    expect(
      utils.getLineGroupedRanges(
        API.createElement({
          type: "text",
          text: "a\r\na",
          colorRanges: { 0: "#fff", 1: "#fff", 2: "#fff" },
          strokeColor: "#000",
        }),
      ),
    ).toEqual<utils.LineGroupedRanges>([
      [{ color: "#fff", text: "a" }],
      [{ color: "#000", text: "a" }],
    ]);
  });

  it("handles emoji within a range", () => {
    const element = API.createElement({
      type: "text",
      text: "aa😀aa😀aa",
      // colorRanges stores the color of all codepoints in a character.
      // Emoji are made up of two codepoints so we store two key/values.
      colorRanges: { 2: "#fff", 3: "#fff", 6: "#fff", 7: "#fff" },
      strokeColor: "#000",
    });

    expect(
      utils.getLineGroupedRanges(element),
    ).toEqual<utils.LineGroupedRanges>([
      [
        { color: "#000", text: "a" },
        { color: "#000", text: "a" },
        // The range should apply to just the emoji
        { color: "#fff", text: "😀" },
        { color: "#000", text: "a" },
        { color: "#000", text: "a" },
        { color: "#fff", text: "😀" },
        { color: "#000", text: "a" },
        { color: "#000", text: "a" },
      ],
    ]);
  });

  it.skip("handles multi codepoint unicode", () => {
    expect(
      utils.getLineGroupedRanges(
        API.createElement({
          type: "text",
          text: "🤌🏼👌🏿",
          strokeColor: "#000",
        }),
      ),
    ).toEqual<utils.LineGroupedRanges>([
      [
        { color: "#000", text: "🤌🏼" },
        { color: "#000", text: "👌🏿" },
      ],
    ]);
  });
});
