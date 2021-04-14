import {
  DocContentElement,
  DocHeading,
  DocTableOfContentsUnit
} from '../typings';

/** 获取 doc 文档的目录 */
export const useTableOfContents = (
  doc: DocContentElement
): DocTableOfContentsUnit[] => {
  const headings: DocHeading[] = [];

  const getHeadingBlock = (content: DocContentElement[]) => {
    content.forEach((e) => {
      if (e.type === 'heading') {
        headings.push(e as DocHeading);
        return;
      }
      if (e.content) {
        getHeadingBlock(e.content);
      }
    });
  };
  const _text = (h: DocHeading) => h.content[0].text;
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

  headings.slice(1).forEach((h) => {
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

export const decodeContentJSON = (content: string): DocContentElement => {
  return JSON.parse(content) as DocContentElement;
};
