import { Command } from "prosemirror-commands";
import { EditorState, Transaction } from "prosemirror-state";
import { liftTarget } from "prosemirror-transform";

const clearNodes: () => Command = () => (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  const { tr } = state;
  const { selection } = tr;
  const { from, to } = selection;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.type.isText) {
      const fromPos = tr.doc.resolve(tr.mapping.map(pos + 1));
      const toPos = tr.doc.resolve(tr.mapping.map(pos + node.nodeSize - 1));
      const nodeRange = fromPos.blockRange(toPos);

      if (nodeRange) {
        const targetLiftDepth = liftTarget(nodeRange);

        if (node.type.isTextblock && dispatch) {
          tr.setNodeMarkup(
            nodeRange.start,
            state.doc.type.contentMatch.defaultType
          );
        }

        if ((targetLiftDepth || targetLiftDepth === 0) && dispatch) {
          tr.lift(nodeRange, targetLiftDepth);
        }
      }
    }
  });

  dispatch?.(tr);
  return false;
};

export { clearNodes };
