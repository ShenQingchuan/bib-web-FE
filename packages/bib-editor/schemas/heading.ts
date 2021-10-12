import { getTextBlockStyleAttrs } from "./common";

export const getHeadingLevelAttr = (dom: HTMLHeadElement) => ({
  level: parseInt(dom.tagName.slice(-1), 10)
});
export const getHeadingIdAttr = (dom: HTMLHeadElement) => ({
  uuid: dom.id || ""
});
export const getHeadingAttrs = getTextBlockStyleAttrs(
  getHeadingLevelAttr,
  getHeadingIdAttr
);
