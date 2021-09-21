import { ref } from "vue";
import { Modal, Form, Input } from "ant-design-vue";
import { Transaction } from "prosemirror-state";
import { EditorSchema } from "@editor/editor-schema";
import { trKeyInsertVideo } from "@editor/trKeys";
import { getIframeSrc } from "./get-iframe-src";

export function insertVideoIframe(
  icon: string,
  label: string,
  tr: Transaction,
  dispatch: (tr: Transaction) => void
) {
  const html = ref("");

  Modal.confirm({
    title: `插入${label}`,
    cancelText: "取消",
    okText: "确认",
    icon: <img src={icon} width={32} />,
    content: (
      <Form>
        <Form.Item
          label="请粘贴 iframe 代码："
          labelCol={{ span: 9 }}
          colon
          wrapperCol={{
            span: 19
          }}
        >
          <Input
            value={html.value}
            onInput={e => {
              html.value = e.target.value;
            }}
          ></Input>
        </Form.Item>
      </Form>
    ),
    onOk: () => {
      const src = getIframeSrc(html.value);

      tr.replaceSelectionWith(EditorSchema.nodes.video_iframe.create({ src }));
      tr.setMeta("trKey", trKeyInsertVideo);
      dispatch(tr);
    }
  });
}
