import type { ElementsMap, ExcalidrawElement } from "../../element/types";
import { rotate } from "../../math";
import Scene from "../../scene/Scene";
import StatsDragInput from "./DragInput";
import type { DragInputCallbackType } from "./DragInput";
import { moveElement } from "./Position";
import { getStepSizedValue } from "./utils";

interface MultiPositionProps {
  property: "x" | "y";
  elements: ExcalidrawElement[];
  elementsMap: ElementsMap;
}

const STEP_SIZE = 10;

const moveElements = (
  property: MultiPositionProps["property"],
  changeInTopX: number,
  changeInTopY: number,
  elements: ExcalidrawElement[],
  originalElements: ExcalidrawElement[],
  elementsMap: ElementsMap,
  originalElementsMap: ElementsMap,
) => {
  for (let i = 0; i < elements.length; i++) {
    const origElement = originalElements[i];
    const latestElement = elements[i];

    const [cx, cy] = [
      origElement.x + origElement.width / 2,
      origElement.y + origElement.height / 2,
    ];
    const [topLeftX, topLeftY] = rotate(
      origElement.x,
      origElement.y,
      cx,
      cy,
      origElement.angle,
    );

    const newTopLeftX =
      property === "x" ? Math.round(topLeftX + changeInTopX) : topLeftX;

    const newTopLeftY =
      property === "y" ? Math.round(topLeftY + changeInTopY) : topLeftY;

    moveElement(
      newTopLeftX,
      newTopLeftY,
      latestElement,
      origElement,
      elementsMap,
      originalElementsMap,
      false,
    );
  }
};

const MultiPosition = ({
  property,
  elements,
  elementsMap,
}: MultiPositionProps) => {
  const positions = elements.map((el) => {
    const [cx, cy] = [el.x + el.width / 2, el.y + el.height / 2];

    const [topLeftX, topLeftY] = rotate(el.x, el.y, cx, cy, el.angle);

    return Math.round((property === "x" ? topLeftX : topLeftY) * 100) / 100;
  });

  const value = new Set(positions).size === 1 ? positions[0] : "Mixed";

  const handlePositionChange: DragInputCallbackType = ({
    accumulatedChange,
    originalElements,
    originalElementsMap,
    shouldChangeByStepSize,
    nextValue,
  }) => {
    if (nextValue) {
      for (let i = 0; i < elements.length; i++) {
        const origElement = originalElements[i];
        const latestElement = elements[i];
        const [cx, cy] = [
          origElement.x + origElement.width / 2,
          origElement.y + origElement.height / 2,
        ];
        const [topLeftX, topLeftY] = rotate(
          origElement.x,
          origElement.y,
          cx,
          cy,
          origElement.angle,
        );

        const newTopLeftX = property === "x" ? nextValue : topLeftX;
        const newTopLeftY = property === "y" ? nextValue : topLeftY;
        moveElement(
          newTopLeftX,
          newTopLeftY,
          latestElement,
          origElement,
          elementsMap,
          originalElementsMap,
          false,
        );
      }

      Scene.getScene(elements[0])?.triggerUpdate();
      return;
    }

    const change = shouldChangeByStepSize
      ? getStepSizedValue(accumulatedChange, STEP_SIZE)
      : accumulatedChange;

    const changeInTopX = property === "x" ? change : 0;
    const changeInTopY = property === "y" ? change : 0;

    moveElements(
      property,
      changeInTopX,
      changeInTopY,
      elements,
      originalElements,
      elementsMap,
      originalElementsMap,
    );

    Scene.getScene(elements[0])?.triggerUpdate();
  };

  return (
    <StatsDragInput
      label={property === "x" ? "X" : "Y"}
      elements={elements}
      dragInputCallback={handlePositionChange}
      value={value}
    />
  );
};

export default MultiPosition;
