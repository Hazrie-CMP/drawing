import React from "react";
import {
  menu,
  palette,
  fullScreenOn,
  fullScreenOff,
} from "../components/icons";
import { ToolButton } from "../components/ToolButton";
import { t } from "../i18n";
import { showSelectedShapeActions } from "../element";
import { register } from "./register";
import { allowFullScreen, exitFullScreen, isFullScreen } from "../utils";

export const actionToggleCanvasMenu = register({
  name: "toggleCanvasMenu",
  perform: (_, appState) => ({
    appState: {
      ...appState,
      openMenu: appState.openMenu === "canvas" ? null : "canvas",
    },
    commitToHistory: false,
  }),
  PanelComponent: ({ appState, updateData }) => (
    <ToolButton
      type="button"
      icon={menu}
      aria-label={t("buttons.menu")}
      onClick={updateData}
      selected={appState.openMenu === "canvas"}
    />
  ),
});

export const actionToggleEditMenu = register({
  name: "toggleEditMenu",
  perform: (_elements, appState) => ({
    appState: {
      ...appState,
      openMenu: appState.openMenu === "shape" ? null : "shape",
    },
    commitToHistory: false,
  }),
  PanelComponent: ({ elements, appState, updateData }) => (
    <ToolButton
      visible={showSelectedShapeActions(appState, elements)}
      type="button"
      icon={palette}
      aria-label={t("buttons.edit")}
      onClick={updateData}
      selected={appState.openMenu === "shape"}
    />
  ),
});

export const actionFullScreen = register({
  name: "fullScreen",
  perform: () => {
    if (!isFullScreen()) {
      allowFullScreen();
    }
    if (isFullScreen()) {
      exitFullScreen();
    }
    return {
      commitToHistory: false,
    };
  },
  PanelComponent: ({ updateData }) => (
    <ToolButton
      type="button"
      icon={isFullScreen() ? fullScreenOff : fullScreenOn}
      aria-label={t("buttons.fullScreen")}
      title={`${t("buttons.fullScreen")} ${getShortcutKey("F")}`}
      onClick={updateData}
    />
  ),
  keyTest: (event) => event.keyCode === 70,
});
