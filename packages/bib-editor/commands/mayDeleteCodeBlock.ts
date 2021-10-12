import { Command } from "prosemirror-commands";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorSchema } from "@editor/schemas";
import { overlayClassName as codeBlockOverlayClassName } from "@editor/node-views";

const codeBlockContainerSelector = (uuid: string) =>
  `.bib-editor__code-block-container[uuid=${uuid}]`;

export const mayDeleteCodeBlock: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  const codeBlockEnd = state.selection.from;
  const maybeCodeBlockPos = state.doc.resolve(
    codeBlockEnd - 2 /* pos offset */
  );
  const maybeCodeBlockNode = maybeCodeBlockPos.parent;
  if (maybeCodeBlockNode.type.name === "code_block") {
    const uuid = maybeCodeBlockNode.attrs.uuid;
    const codeBlockStart =
      codeBlockEnd - 3 - maybeCodeBlockNode.textContent.length;
    const dom = document.querySelector(codeBlockContainerSelector(uuid));
    const tryDeleting = dom?.classList.contains(codeBlockOverlayClassName);

    if (tryDeleting) {
      dom?.classList.remove(codeBlockOverlayClassName);
      dispatch?.(state.tr.delete(codeBlockStart, codeBlockEnd));
    } else {
      dom?.classList.add(codeBlockOverlayClassName);
      dispatch?.(
        state.tr
          .setNodeMarkup(codeBlockStart, EditorSchema.nodes.code_block, {
            ...maybeCodeBlockNode.attrs,
            tryDeleting: true
          })
          .setMeta("addToHistory", false)
      );
    }
    return true;
  }
  return false;
};
