import { ref } from "vue";
import { Modal, Form, Input } from "ant-design-vue";
import { Transaction } from "prosemirror-state";
import { EditorSchema } from "../editor-schema";
import { trKeyInsertImage } from "../trKeys";

export function insertOnlineImage(
  tr: Transaction,
  dispatch: (tr: Transaction) => void
) {
  const src = ref("");

  Modal.confirm({
    title: "插入在线图片",
    cancelText: "取消",
    okText: "确认",
    content: (
      <Form>
        <Form.Item
          label="图片地址："
          labelCol={{ span: 5 }}
          wrapperCol={{
            span: 19
          }}
        >
          <Input
            value={src.value}
            onInput={e => {
              src.value = e.target.value;
            }}
          ></Input>
        </Form.Item>
      </Form>
    ),
    onOk: () => {
      tr.replaceSelectionWith(
        EditorSchema.nodes.image.create({
          src: src.value
        })
      );
      tr.setMeta("trKey", trKeyInsertImage);
      dispatch(tr);
    }
  });
}
