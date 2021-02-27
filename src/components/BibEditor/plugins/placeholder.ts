import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export default function placeholderPlugin(text: string) {
  return new Plugin({
    props: {
      decorations(state) {
        let doc = state.doc;
        if (
          doc.childCount == 1 &&
          doc.firstChild?.isTextblock &&
          doc.firstChild?.content.size == 0
        ) {
          const innerTextNode = document.createElement("div");
          innerTextNode.innerText = text;
          innerTextNode.style.color = "#bbbfc4";
          innerTextNode.style.display = "inline-block";
          return DecorationSet.create(doc, [
            Decoration.widget(1, innerTextNode),
          ]);
        }
      },
    },
  });
}
