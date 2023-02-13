import clsx from "clsx";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SHADE_INDEX,
  Palette,
  activeColorPickerSectionAtom,
  colorPickerHotkeyBindings,
  getColorNameAndShadeFromHex,
} from "./colorPickerUtils";

interface PickerColorListProps {
  palette: Palette;
  color: string | null;
  onChange: (color: string) => void;
  label: string;
}

const PickerColorList = ({
  palette,
  color,
  onChange,
  label,
}: PickerColorListProps) => {
  const colorObj = getColorNameAndShadeFromHex({
    hex: color || "transparent",
    palette,
  });
  const [activeColorPickerSection, setActiveColorPickerSection] = useAtom(
    activeColorPickerSectionAtom,
  );

  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (btnRef.current && activeColorPickerSection === "default") {
      btnRef.current.focus();
    }
  }, [colorObj?.colorName, activeColorPickerSection]);

  const initialShade =
    colorObj && colorObj.shade >= 0 ? colorObj.shade : DEFAULT_SHADE_INDEX;

  const [activeShade, setActiveShade] = useState(initialShade);

  useEffect(() => {
    if (colorObj && colorObj.shade >= 0) {
      setActiveShade(colorObj.shade);
    }
  }, [colorObj]);

  return (
    <div className="color-picker-content--default">
      {Object.entries(palette).map(([key, value], index) => {
        const color =
          (Array.isArray(value) ? value[activeShade] : value) || "transparent";

        return (
          <button
            ref={colorObj?.colorName === key ? btnRef : undefined}
            tabIndex={-1}
            type="button"
            className={clsx(
              "color-picker__button color-picker__button--large",
              {
                active: colorObj?.colorName === key,
                "is-transparent": color === "transparent" || !color,
                "with-border":
                  color === "#ffffff" || color === "transparent" || !color,
              },
            )}
            onClick={() => {
              onChange(color);
              setActiveColorPickerSection("default");
            }}
            onFocus={() => {
              onChange(color);
              setActiveColorPickerSection("default");
            }}
            title={`${label} — ${key}`}
            aria-label={label}
            style={color ? { "--swatch-color": color } : undefined}
            key={key}
          >
            <div className="color-picker__button__hotkey-label">
              {colorPickerHotkeyBindings[index]}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PickerColorList;
