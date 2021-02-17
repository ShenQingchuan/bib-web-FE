import { Node } from 'prosemirror-model';
import { findParentNode, findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';
import { EditorSchema } from '../editor-schema';

export default class ListItemView {
  dom: HTMLElement;
  contentDOM?: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: any;
  textAlign: string = '';
  isTaskItem: boolean;
  checked: boolean = false;
  checkbox?: HTMLInputElement;

  constructor(node: Node, view: EditorView, getPos: (() => number) | boolean) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    const listItem = document.createElement('li');
    const hasTaskListParent = findParentNode(
      (node) => node.type === EditorSchema.nodes.task_list
    )(view.state.selection);
    this.isTaskItem = !!hasTaskListParent;

    if (this.isTaskItem) {
      listItem.dataset.type = 'task-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.contentEditable = 'false';
      checkbox.tabIndex = -1;
      checkbox.addEventListener('change', (event) => {
        const { checked } = event.target as any;

        if (typeof getPos === 'function') {
          view.dispatch(
            view.state.tr.setNodeMarkup(getPos(), undefined, {
              checked
            })
          );
          // view.focus();
        }
      });
      if (node.attrs.checked) {
        checkbox.setAttribute('checked', 'checked');
      }

      const content = document.createElement('p');
      content.classList.add('task-content');

      listItem.style.textAlign = node.attrs.textAlign;
      listItem.append(checkbox, content);
      this.dom = listItem;
      this.contentDOM = content;
      this.checkbox = checkbox;
    } else {
      listItem.style.textAlign = node.attrs.textAlign;
      this.dom = listItem;
      this.contentDOM = listItem;
    }
  }

  update(updatedNode: Node) {
    if (updatedNode.type !== EditorSchema.nodes.list_item) {
      return false;
    }

    if (updatedNode.attrs.checked) {
      this.checkbox?.setAttribute('checked', 'checked');
    } else {
      this.checkbox?.removeAttribute('checked');
    }

    return true;
  }
}
