import { Node } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { EditorSchema } from "@editor/editor-schema";

export class TaskItemView implements NodeView {
  dom: HTMLElement;
  contentDOM?: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: any;
  textAlign: string = "";
  checked: boolean = false;
  checkbox?: HTMLInputElement;

  constructor(node: Node, view: EditorView, getPos: any) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    const listItem = document.createElement("li");
    listItem.dataset.type = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.contentEditable = "false";
    checkbox.tabIndex = -1;
    checkbox.addEventListener("change", event => {
      const { checked } = event.target as any;

      if (typeof getPos === "function") {
        view.dispatch(
          view.state.tr.setNodeMarkup(getPos(), undefined, {
            checked
          })
        );
      }
    });
    checkbox.dataset.checked = `${node.attrs.checked}`;

    const content = document.createElement("div");
    content.classList.add("task-content");

    listItem.style.textAlign = node.attrs.textAlign;
    listItem.append(checkbox, content);
    this.dom = listItem;
    this.contentDOM = content;
    this.checkbox = checkbox;
  }

  update(updatedNode: Node) {
    if (updatedNode.type !== EditorSchema.nodes.task_item) {
      return false;
    }

    this.checkbox!.dataset.checked = updatedNode.attrs.checked;
    this.dom.style.textAlign = updatedNode.attrs.textAlign;
    return true;
  }

  stopEvent() {
    return true;
  }
}
