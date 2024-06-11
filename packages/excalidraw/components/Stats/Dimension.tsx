import type { ElementsMap, ExcalidrawElement } from "../../element/types";
import DragInput from "./DragInput";
import type { DragInputCallbackType } from "./DragInput";
import { getStepSizedValue, isPropertyEditable, resizeElement } from "./utils";

interface DimensionDragInputProps {
  property: "width" | "height";
  element: ExcalidrawElement;
  elementsMap: ElementsMap;
}

const STEP_SIZE = 10;
const _shouldKeepAspectRatio = (element: ExcalidrawElement) => {
  return element.type === "image";
};

const DimensionDragInput = ({
  property,
  element,
  elementsMap,
}: DimensionDragInputProps) => {
  const handleDimensionChange: DragInputCallbackType = ({
    accumulatedChange,
    originalElements,
    originalElementsMap,
    shouldKeepAspectRatio,
    shouldChangeByStepSize,
    nextValue,
  }) => {
    const origElement = originalElements[0];
    if (origElement) {
      const keepAspectRatio =
        shouldKeepAspectRatio || _shouldKeepAspectRatio(element);
      const aspectRatio = origElement.width / origElement.height;

      if (nextValue !== undefined) {
        const nextWidth = Math.max(
          property === "width"
            ? nextValue
            : keepAspectRatio
            ? nextValue * aspectRatio
            : origElement.width,
          0,
        );
        const nextHeight = Math.max(
          property === "height"
            ? nextValue
            : keepAspectRatio
            ? nextValue / aspectRatio
            : origElement.height,
          0,
        );

        resizeElement(
          nextWidth,
          nextHeight,
          keepAspectRatio,
          element,
          origElement,
          elementsMap,
          originalElementsMap,
        );

        return;
      }
      const changeInWidth = property === "width" ? accumulatedChange : 0;
      const changeInHeight = property === "height" ? accumulatedChange : 0;

      let nextWidth = Math.max(0, origElement.width + changeInWidth);
      if (property === "width") {
        if (shouldChangeByStepSize) {
          nextWidth = getStepSizedValue(nextWidth, STEP_SIZE);
        } else {
          nextWidth = Math.round(nextWidth);
        }
      }

      let nextHeight = Math.max(0, origElement.height + changeInHeight);
      if (property === "height") {
        if (shouldChangeByStepSize) {
          nextHeight = getStepSizedValue(nextHeight, STEP_SIZE);
        } else {
          nextHeight = Math.round(nextHeight);
        }
      }

      if (keepAspectRatio) {
        if (property === "width") {
          nextHeight = Math.round((nextWidth / aspectRatio) * 100) / 100;
        } else {
          nextWidth = Math.round(nextHeight * aspectRatio * 100) / 100;
        }
      }

      resizeElement(
        nextWidth,
        nextHeight,
        keepAspectRatio,
        element,
        origElement,
        elementsMap,
        originalElementsMap,
      );
    }
  };

  const value =
    Math.round((property === "width" ? element.width : element.height) * 100) /
    100;

  return (
    <DragInput
      label={property === "width" ? "W" : "H"}
      elements={[element]}
      dragInputCallback={handleDimensionChange}
      value={value}
      editable={isPropertyEditable(element, property)}
    />
  );
};

export default DimensionDragInput;