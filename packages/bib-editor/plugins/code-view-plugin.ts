import { Plugin } from "prosemirror-state";
import { overlayClassName as codeBlockOverlayClassName } from "../node-views/code-block-view";

export const removeCodeBlockOverlay = () => {
  const allOverlays = Array.from(
    document.querySelectorAll(`.${codeBlockOverlayClassName}`)
  );
  allOverlays.length > 0 &&
    allOverlays.forEach(block => {
      block.classList.remove(codeBlockOverlayClassName);
    });
};

export default function codeBlockPlugin() {
  return new Plugin({
    props: {
      handleClick: (view, e) => {
        removeCodeBlockOverlay();
        return false;
      }
    }
  });
}
