import { extend, omit } from "underscore";
import { Node } from "prosemirror-model";

export type GetAttrsFunc = (_dom: HTMLElement) => Record<string, any>;

export const extendsTextBlockAttrs = (
  others: Record<string, any> = {},
  excludes?: string[]
) => {
  let textBlockAttrs: Record<string, any> = extend(
    {
      textAlign: { default: "" },
      textIndent: { default: 0 }
    },
    others
  );
  if (excludes) {
    textBlockAttrs = omit(textBlockAttrs, ...excludes);
  }
  return textBlockAttrs;
};

export const stylesOfTextBlock = (
  node: Node,
  append?: (node: Node) => string
) => {
  let style = "";
  if (node.attrs.textAlign) {
    style += `text-align:${node.attrs.textAlign};`;
  }
  if (node.attrs.textIndent > 0) {
    style += `padding-left:${node.attrs.textIndent}em;`;
  }
  // ... more styles

  if (append) {
    style = style + append(node);
  }
  return style;
};

export const getTextBlockStyleAttrs = (...computeOther: GetAttrsFunc[]) => (
  dom: HTMLElement
) => {
  const textBlockStylesAttrs: Record<string, any> = {};

  // 对其方向
  if (dom.style.textAlign) {
    textBlockStylesAttrs.textAlign = dom.style.textAlign;
  }

  // 缩进
  if (dom.style.paddingLeft) {
    if (dom.style.paddingLeft.endsWith("px")) {
      const paddingNumber = Number(dom.style.paddingLeft.slice(0, -2));
      textBlockStylesAttrs.textIndent = paddingNumber;
    }
  }

  const otherAttrs = computeOther
    ? computeOther
        .map(computeFn => computeFn(dom))
        .reduce((prev, next) => extend(prev, next), {})
    : {};
  return {
    ...otherAttrs,
    ...textBlockStylesAttrs
  };
};
