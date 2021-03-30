import getMarkAttributes from '../helpers/get-mark-attributes';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Modal, Form, Input } from 'ant-design-vue';
import { Node, Mark } from 'prosemirror-model';
import { ref } from 'vue';
import { EditorSchema } from '../editor-schema';
import { trKeyLinkChange } from '../composable/useEditor';
import { EditorView } from 'prosemirror-view';
import { URL_REGEX } from '../../../utils';

const {
  marks: { link: linkMarkType }
} = EditorSchema;

export function updateLinkWithRange(
  view: EditorView,
  text: string,
  marks: Mark[],
  from: number,
  to: number
) {
  const { tr } = view.state;
  tr.replaceRangeWith(from, to, EditorSchema.text(text, marks));
  tr.setMeta('trKey', trKeyLinkChange);
  view.dispatch(tr);
}

export function updateLinkWithPos(
  view: EditorView,
  text: string,
  marks: Mark[],
  stored: boolean,
  pos: number,
  end?: number
) {
  const { doc, tr } = view.state;
  if (!stored) {
    const resolvedPos = doc.resolve(pos);
    tr.replaceWith(
      resolvedPos.start(),
      end || resolvedPos.end(),
      EditorSchema.text(text, marks)
    );
  } else {
    // 如果是需要 stored Mark
    // 那么之前 addToSet 必然是添加到 [] 中
    // 所以 marks 仅一个元素，就是 linkMark
    const [linkMark] = marks;
    tr.addStoredMark(linkMark);
    tr.insertText(text);
  }
  tr.setMeta('trKey', trKeyLinkChange);
  view.dispatch(tr);
}

export function showUpdateLinkModal(
  view: EditorView,
  pos: number,
  currentTextNode: Node,
  attrs?: {
    text: string;
    href: string;
  }
) {
  const text = ref<string>(attrs?.text || currentTextNode?.textContent || ''),
    href = ref<string>(
      attrs?.href ||
        (URL_REGEX.test(currentTextNode?.textContent)
          ? currentTextNode?.textContent
          : 'https://')
    );

  Modal.confirm({
    title: '更改链接',
    cancelText: '取消',
    okText: '确认',
    content: (
      <Form>
        <Form.Item
          label='链接文本：'
          labelCol={{ span: 5 }}
          wrapperCol={{
            span: 19
          }}
        >
          <Input
            value={text.value}
            onInput={(e) => {
              text.value = e.target.value;
            }}
          ></Input>
        </Form.Item>
        <Form.Item
          label='链接地址：'
          labelCol={{ span: 5 }}
          wrapperCol={{
            span: 19
          }}
        >
          <Input
            value={href.value}
            onInput={(e) => {
              href.value = e.target.value;
            }}
          ></Input>
        </Form.Item>
      </Form>
    ),
    onOk: () => {
      const marks = linkMarkType
        .create({
          href: href.value,
          text: text.value
        })
        .addToSet(currentTextNode?.marks || []);
      if (!view.state.selection.empty) {
        const { from, to } = view.state.selection;
        updateLinkWithRange(view, text.value, marks, from, to);
      } else
        updateLinkWithPos(
          view,
          text.value,
          marks,
          currentTextNode === null,
          pos
        );
    }
  });
}

export default new Plugin({
  key: new PluginKey('handleLinkClick'),
  props: {
    handleClick(view, pos, event) {
      const { doc } = view.state;
      const currentTextNode = doc.nodeAt(pos);
      if (!currentTextNode) return true;
      const attrs = getMarkAttributes(view.state, 'link');

      if (attrs.href && event.target instanceof HTMLAnchorElement) {
        showUpdateLinkModal(view, pos, currentTextNode, {
          href: attrs.href,
          text: attrs.text
        });

        return false;
      }

      return true;
    }
  }
});
