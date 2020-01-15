import { newElement } from "./newElement";

export type ExcalidrawElement = ReturnType<typeof newElement>;
export type ExcalidrawTextElement = ExcalidrawElement & {
  type: "text";
  font: string;
  text: string;
  // for backward compatibility
  actualBoundingBoxAscent?: number;
  baseline: number;
};

export type ExcalidrawArrowElement = ExcalidrawElement & {
  type: "arrow";
  angle: number;
};

export type ExcalidrawLineElement = ExcalidrawElement & {
  type: "line";
  angle: number;
};
