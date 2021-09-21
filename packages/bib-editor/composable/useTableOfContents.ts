import {
  DocContentElement,
  DocHeading,
  DocTableOfContentsUnit
} from "@editor/typings";
import { Ref } from "vue";

const activeHighlightClassName = "bib__active-highlight-heading";
const decodeContentJSON = (content: string): DocContentElement => {
  return JSON.parse(content) as DocContentElement;
};
/** 获取 doc 文档的目录
 * @param _doc 文档最终导出的 docJSON 字符串或原始 JSON 对象
 */
export const useTableOfContents = (
  _doc: string | DocContentElement
): DocTableOfContentsUnit[] => {
  const headings: DocHeading[] = [];
  const doc: DocContentElement =
    typeof _doc === "string" ? decodeContentJSON(_doc) : _doc;

  const getHeadingBlock = (content: DocContentElement[]) => {
    content.forEach(e => {
      if (e.type === "heading") {
        headings.push(e as DocHeading);
        return;
      }
      if (e.content) {
        getHeadingBlock(e.content);
      }
    });
  };
  const _text = (h: DocHeading) => h.content?.[0].text || "";
  const _level = (h: DocHeading) => h.attrs.level;

  doc.content && getHeadingBlock(doc.content);

  // 如果没有找到任何一个 heading 则返回空
  if (!headings.length) return [];

  const generateTocUnit = (h: DocHeading): DocTableOfContentsUnit => ({
    title: _text(h),
    level: _level(h),
    children: []
  });
  const toc: DocTableOfContentsUnit[] = [],
    stack = [generateTocUnit(headings[0])];
  let stackTop,
    tail = stack[stack.length - 1];

  headings.slice(1).forEach(h => {
    stackTop = stack[stack.length - 1];
    if (_level(h) > stackTop.level) {
      const g = generateTocUnit(h);
      if (_level(h) > tail.level) {
        tail.children.push(g);
      } else {
        stackTop.children.push(g);
      }
      tail = g;
    } else {
      toc.push(stack.pop()!);
      stack.push(generateTocUnit(h));
    }
  });
  if (stack.length > 0) {
    while (stack.length > 0) {
      toc.push(stack.pop()!);
    }
  }

  return toc;
};
export const bindClickScrollHandler = (
  headingRefs: Ref<HTMLHeadingElement[]>,
  tocItemRefs: Ref<HTMLElement[]>
) => {
  tocItemRefs.value = Array.from(
    document.querySelectorAll(".doc-side-toc__item")
  );
  tocItemRefs.value.forEach((tocItem, i) => {
    tocItem.onclick = e => {
      const target = headingRefs.value[i];
      window.scrollTo({
        top: target.offsetTop - target.clientHeight,
        behavior: "smooth"
      });
      target.classList.add(activeHighlightClassName);
      setTimeout(() => {
        target.classList.remove(activeHighlightClassName);
      }, 1000);
      e.stopPropagation();
    };
  });
};
