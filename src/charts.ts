import colors from "./colors";
import {
  DEFAULT_VERTICAL_ALIGN,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
} from "./constants";
import { newElement, newTextElement } from "./element";
import { ExcalidrawElement } from "./element/types";
import { randomId } from "./random";

export interface Spreadsheet {
  title: string | null;
  labels: string[] | null;
  values: number[];
}

export const NOT_SPREADSHEET = "NOT_SPREADSHEET";
export const VALID_SPREADSHEET = "VALID_SPREADSHEET";

type ParseSpreadsheetResult =
  | { type: typeof NOT_SPREADSHEET }
  | { type: typeof VALID_SPREADSHEET; spreadsheet: Spreadsheet };

const tryParseNumber = (s: string): number | null => {
  const match = /^[$€£¥₩]?([0-9]+(\.[0-9]+)?)$/.exec(s);
  if (!match) {
    return null;
  }
  return parseFloat(match[1]);
};

const isNumericColumn = (lines: string[][], columnIndex: number) => {
  return lines
    .slice(1)
    .every((line) => tryParseNumber(line[columnIndex]) !== null);
};

const tryParseCells = (cells: string[][]): ParseSpreadsheetResult => {
  const numCols = cells[0].length;

  if (numCols > 2) {
    return { type: NOT_SPREADSHEET };
  }

  if (numCols === 1) {
    if (!isNumericColumn(cells, 0)) {
      return { type: NOT_SPREADSHEET };
    }

    const hasHeader = tryParseNumber(cells[0][0]) === null;
    const values = (hasHeader ? cells.slice(1) : cells).map((line) =>
      tryParseNumber(line[0]),
    );

    if (values.length < 2) {
      return { type: NOT_SPREADSHEET };
    }

    return {
      type: VALID_SPREADSHEET,
      spreadsheet: {
        title: hasHeader ? cells[0][0] : null,
        labels: null,
        values: values as number[],
      },
    };
  }

  const valueColumnIndex = isNumericColumn(cells, 0) ? 0 : 1;

  if (!isNumericColumn(cells, valueColumnIndex)) {
    return { type: NOT_SPREADSHEET };
  }

  const labelColumnIndex = (valueColumnIndex + 1) % 2;
  const hasHeader = tryParseNumber(cells[0][valueColumnIndex]) === null;
  const rows = hasHeader ? cells.slice(1) : cells;

  if (rows.length < 2) {
    return { type: NOT_SPREADSHEET };
  }

  return {
    type: VALID_SPREADSHEET,
    spreadsheet: {
      title: hasHeader ? cells[0][valueColumnIndex] : null,
      labels: rows.map((row) => row[labelColumnIndex]),
      values: rows.map((row) => tryParseNumber(row[valueColumnIndex])!),
    },
  };
};

const transposeCells = (cells: string[][]) => {
  const nextCells: string[][] = [];
  for (let col = 0; col < cells[0].length; col++) {
    const nextCellRow: string[] = [];
    for (let row = 0; row < cells.length; row++) {
      nextCellRow.push(cells[row][col]);
    }
    nextCells.push(nextCellRow);
  }

  return nextCells;
};

export const tryParseSpreadsheet = (text: string): ParseSpreadsheetResult => {
  // copy/paste from excel, in-browser excel, google sheets is tsv
  // we also check for csv
  // for now we only accept 2 columns with an optional header

  // Check for Tab separeted values
  let lines = text
    .trim()
    .split("\n")
    .map((line) => line.trim().split("\t"));

  // Check for comma separeted files
  if (lines.length !== 0) {
    lines = text
      .trim()
      .split("\n")
      .map((line) => line.trim().split(","));
  }

  if (lines.length === 0) {
    return { type: NOT_SPREADSHEET };
  }

  const numColsFirstLine = lines[0].length;
  const isASpreadsheet = lines.every(
    (line) => line.length === numColsFirstLine,
  );

  if (!isASpreadsheet) {
    return { type: NOT_SPREADSHEET };
  }

  const result = tryParseCells(lines);
  if (result.type !== VALID_SPREADSHEET) {
    const transposedResults = tryParseCells(transposeCells(lines));
    if (transposedResults.type === VALID_SPREADSHEET) {
      return transposedResults;
    }
  }

  return result;
};

const BAR_WIDTH = 32;
const BAR_GAP = 12;
const BAR_HEIGHT = 256;

const ANGLE = 5.87;

// For the maths behind it https://excalidraw.com/#json=6320864370884608,O_5xfD-Agh32tytHpRJx1g
export const renderSpreadsheet = (
  spreadsheet: Spreadsheet,
  x: number,
  y: number,
): ExcalidrawElement[] => {
  const max = Math.max(...spreadsheet.values);
  const groupIds = [randomId()];
  const chartHeight = BAR_HEIGHT + BAR_GAP * 2;
  const chartWidth =
    (BAR_WIDTH + BAR_GAP) * spreadsheet.values.length + BAR_GAP;

  const color = colors.elementBackground[7];

  // Min value label
  const minYLabel = newTextElement({
    x: x - BAR_GAP,
    y: y - BAR_GAP,
    backgroundColor: color,
    fillStyle: "cross-hatch",
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
    groupIds,
    opacity: 100,
    roughness: 1,
    strokeColor: colors.elementStroke[0],
    strokeSharpness: "sharp",
    strokeStyle: "solid",
    strokeWidth: 1,
    text: "0",
    textAlign: "right",
    verticalAlign: "middle",
  });

  // Max value label
  const maxYLabel = newTextElement({
    x: x - BAR_GAP,
    y: y - BAR_HEIGHT - minYLabel.height / 2,
    backgroundColor: color,
    fillStyle: "cross-hatch",
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: DEFAULT_FONT_SIZE,
    groupIds,
    opacity: 100,
    roughness: 1,
    strokeColor: colors.elementStroke[0],
    strokeSharpness: "sharp",
    strokeStyle: "solid",
    strokeWidth: 1,
    text: max.toLocaleString(),
    textAlign: "right",
    verticalAlign: "middle",
  });

  const bars = spreadsheet.values.map((value, index) => {
    const barHeight = (value / max) * BAR_HEIGHT;
    return newElement({
      type: "rectangle",
      x: x + index * (BAR_WIDTH + BAR_GAP) + BAR_GAP,
      y: y - barHeight - BAR_GAP,
      width: BAR_WIDTH,
      height: barHeight,

      backgroundColor: color,
      fillStyle: "hachure",
      groupIds,
      opacity: 100,
      roughness: 1,
      strokeColor: colors.elementStroke[0],
      strokeSharpness: "sharp",
      strokeStyle: "solid",
      strokeWidth: 1,
    });
  });

  const xLabels =
    spreadsheet.labels?.map((label, index) => {
      return newTextElement({
        text: label.length > 8 ? `${label.slice(0, 5)}...` : label,
        x: x + index * (BAR_WIDTH + BAR_GAP) + BAR_GAP * 2,
        y: y + BAR_GAP / 2,

        angle: ANGLE,
        backgroundColor: color,
        fillStyle: "hachure",
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: 16,
        groupIds,
        opacity: 100,
        roughness: 1,
        strokeColor: colors.elementStroke[0],
        strokeSharpness: "sharp",
        strokeStyle: "solid",
        strokeWidth: 1,
        textAlign: "center",
        verticalAlign: DEFAULT_VERTICAL_ALIGN,
        width: BAR_WIDTH,
      });
    }) || [];

  // Title on top of the chart in the middle
  const title = spreadsheet.title
    ? newTextElement({
        text: spreadsheet.title,
        x: x + chartWidth / 2,
        y: y - BAR_HEIGHT - BAR_GAP * 3 - maxYLabel.height,

        backgroundColor: color,
        fillStyle: "cross-hatch",
        fontFamily: DEFAULT_FONT_FAMILY,
        fontSize: DEFAULT_FONT_SIZE,
        groupIds,
        opacity: 100,
        roughness: 1,
        strokeColor: colors.elementStroke[0],
        strokeSharpness: "sharp",
        strokeStyle: "solid",
        strokeWidth: 1,
        textAlign: "center",
        verticalAlign: DEFAULT_VERTICAL_ALIGN,
      })
    : null;

  const testRect = newElement({
    type: "rectangle",
    x,
    y: y - chartHeight,
    width: chartWidth,
    height: chartHeight,
    strokeColor: colors.elementStroke[0],
    backgroundColor: colors.elementBackground[3],
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 8,
    strokeSharpness: "sharp",
    groupIds,
  });

  return [...bars, title, minYLabel, maxYLabel, ...xLabels, testRect].filter(
    (element) => element !== null,
  ) as ExcalidrawElement[];
};
