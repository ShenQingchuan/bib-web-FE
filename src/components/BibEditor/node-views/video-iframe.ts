import { Node } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';

export default class VideoIframeView implements NodeView {
  dom: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: any;

  constructor(node: Node, view: EditorView, getPos: any) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    const iframe = document.createElement('iframe');
    iframe.classList.add('prosemirror-video-iframe');
    iframe.src = node.attrs.src || '';
    iframe.style.border = '0';
    iframe.allowFullscreen = true;

    this.dom = iframe;
  }
}
