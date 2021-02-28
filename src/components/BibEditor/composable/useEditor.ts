import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node, NodeType, MarkType, Schema } from 'prosemirror-model';
import { buildKeymap } from 'prosemirror-example-setup';
import { buildInputRules, buildPasteRules } from '../input-rules';
import { keymap } from 'prosemirror-keymap';
import {
  baseKeymap,
  lift,
  setBlockType,
  toggleMark as _tm,
  wrapIn
} from 'prosemirror-commands';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import CodeBlockView, {
  arrowHandlersInCodeBlock
} from '../node-views/code-block-view';
import placeholder from '../plugins/placeholder';
import handleLinkClick from '../plugins/handle-link-click';
import {
  BibEditorOptions,
  DispatchHook,
  EditorComposable,
  EditorToggleCategories
} from '../typings';
import { EditorSchema } from '../editor-schema';
import { onUnmounted, shallowRef, ref } from 'vue';
import * as pmutils from 'prosemirror-utils';
import {
  liftListItem,
  sinkListItem,
  wrapInList
} from 'prosemirror-schema-list';
import ListItemView from '../node-views/list-item-view';

const sampleInitDocJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      text: ''
    }
  ]
};
function createInitDoc(schema: Schema, initContent: string) {
  try {
    const parseFromOptions = JSON.parse(initContent);
    const doc = Node.fromJSON(schema, parseFromOptions);
    return doc;
  } catch (err) {
    return Node.fromJSON(schema, sampleInitDocJSON);
  }
}

function isList(node: Node, schema: Schema) {
  return (
    node.type === schema.nodes.bullet_list ||
    node.type === schema.nodes.ordered_list ||
    node.type === schema.nodes.task_list
  );
}

export function useViewDispatch(
  view: EditorView,
  tr: Transaction,
  meta?: { [key: string]: any },
  callback?: (tr: Transaction) => void
) {
  if (meta) {
    for (let key in meta) {
      key && tr.setMeta(key, meta[key]);
    }
  }
  callback && callback(tr);
  return view.dispatch(tr);
}
export const trKeyMark = 'tr-mark';
export const trKeyHeading = 'tr-heading';
export const trKeyAlign = 'tr-align';
export const trKeyList = 'tr-list';
export const trKeyTextColor = 'tr-textColor';
export const trKeyTextBgColor = 'tr-textBgColor';
export const trKeyLinkChange = 'tr-linkChange';
export const trKeyQuote = 'tr-quote';

export function useEditor(options: BibEditorOptions) {
  let editorView = shallowRef({} as EditorView);
  const updateHooks = ref<DispatchHook[]>([]);

  /** 通过 ref hook 初始化 EditorView */
  const initEditor = (el: any) => {
    editorView.value = new EditorView(el as HTMLDivElement, {
      state: EditorState.create({
        doc: createInitDoc(EditorSchema, options.initContent),
        plugins: [
          history(),
          keymap({
            ...buildKeymap(EditorSchema),
            Tab: sinkListItem(EditorSchema.nodes.list_item)
          }),
          buildInputRules(EditorSchema),
          ...buildPasteRules(EditorSchema),
          keymap(baseKeymap),
          dropCursor(),
          gapCursor(),
          arrowHandlersInCodeBlock,
          placeholder(options.placeholder || '写点什么吧 ...'),
          handleLinkClick
        ]
      }),
      dispatchTransaction(tr) {
        try {
          const newState = editorView.value.state.apply(tr);
          editorView.value.updateState(newState);
        } catch (err) {
          console.log('[BibEditor ProseMirror Error]: ', err);
        }
        updateHooks.value.forEach((hook) => {
          hook(tr, hook.hookMeta);
        });
      },
      nodeViews: {
        code_block(node, view, getPos) {
          return new CodeBlockView(node, view, getPos);
        },
        list_item(node, view, getPos) {
          return new ListItemView(node, view, getPos);
        }
      }
    });
  };

  /** 卸载 EditorView */
  onUnmounted(() => {
    editorView.value.destroy();
  });

  /** 将文档 doc 输出为 JSON 字符串 */
  const toJSON = () => {
    return editorView.value.state.doc.toJSON();
  };

  /** 聚焦该编辑器 */
  const focus = () => {
    !editorView.value.hasFocus() &&
      editorView.value.state.selection.empty &&
      editorView.value.focus();
  };

  /** 切换 mark */
  const toggleMark = (markName: EditorToggleCategories) => {
    focus();
    _tm(EditorSchema.marks[markName])(editorView.value.state, (tr) =>
      useViewDispatch(editorView.value, tr, {
        trKey: trKeyMark,
        mark: markName
      })
    );
  };
  /** 切换 标题级别 */
  const toggleHeading = (attrs: { level: number }) => {
    focus();
    const { level } = attrs;
    setBlockType(EditorSchema.nodes.heading, attrs)(
      editorView.value.state,
      (tr) =>
        useViewDispatch(editorView.value, tr, {
          trKey: trKeyHeading,
          level
        })
    );
  };
  /** 切换 文字对齐方向 */
  const toggleAlign = (direction: string) => {
    focus();
    const { selection, tr } = editorView.value.state;
    // 选区是范围状态
    if (!selection.empty) {
      const { from, to } = editorView.value.state.selection;
      tr.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.type.spec.attrs?.textAlign) {
          return;
        }

        tr.setNodeMarkup(pos, null as any, {
          ...node.attrs,
          textAlign: direction
        });
      });
    }
    // 是光标状态
    else {
      const selection = editorView.value.state.selection;
      const { from, to } = selection;
      const parent = pmutils.findParentNode((node) =>
        ['list_item'].includes(node.type.name)
      )(selection);
      if (parent) {
        const newAttrs = {
          ...parent.node.attrs,
          textAlign: direction
        };
        tr.setNodeMarkup(parent.pos, null as any, newAttrs);
      }
      tr.doc.nodesBetween(from, to, (node, pos) => {
        tr.setNodeMarkup(pos, null as any, {
          ...node.attrs,
          textAlign: direction
        });
      });
    }

    tr.setMeta('trKey', trKeyAlign);
    editorView.value.dispatch(tr);
  };
  /** 切换 列表类型 */
  const toggleList = (listType: NodeType, itemType?: NodeType) => {
    const { state, dispatch } = editorView.value;
    const { schema, selection } = state;
    const { $from, $to } = selection;
    const range = $from.blockRange($to);
    if (!range) {
      return false;
    }

    if (!itemType) {
      itemType = EditorSchema.nodes.list_item;
    }

    const parentList = pmutils.findParentNode((node) => isList(node, schema))(
      selection
    );

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      if (parentList.node.type === listType) {
        return liftListItem(itemType)(state, dispatch);
      }

      if (
        isList(parentList.node, schema) &&
        listType.validContent(parentList.node.content)
      ) {
        const { tr } = state;
        tr.setNodeMarkup(parentList.pos, listType);
        tr.setMeta('trKey', trKeyList);

        if (dispatch) {
          dispatch(tr);
        }

        return false;
      }
    }

    return wrapInList(listType)(state, dispatch);
  };
  const createToggleColorCommand = (markType: MarkType, trKey: string) => {
    return (color: string) => {
      const { state, dispatch } = editorView.value;
      const { selection, tr } = state;
      const { from, to, empty } = selection;

      const colorMark = markType.create({
        color
      });
      // 是选区状态
      if (!empty) {
        tr.addMark(from, to, colorMark);
      }
      // 是光标状态
      else {
        tr.addStoredMark(colorMark);
      }

      tr.setMeta('trKey', trKey);
      dispatch(tr);
    };
  };
  /** 切换 文字颜色 */
  const toggleTextColor = createToggleColorCommand(
    EditorSchema.marks.colored,
    trKeyTextColor
  );
  /** 切换 文字背景高亮颜色 */
  const toggleTextBgColor = createToggleColorCommand(
    EditorSchema.marks.hightlighted,
    trKeyTextColor
  );
  /** 切换 文字引用块 */
  const toggleQuoteBlock = () => {
    focus();
    const { selection, tr } = editorView.value.state;
    const parentHasQuote = pmutils.findParentNode((node) => {
      console.log(node.type.name);
      return ['blockquote'].includes(node.type.name);
    })(selection);
    let command = parentHasQuote ? lift : wrapIn(EditorSchema.nodes.blockquote);
    command(editorView.value.state, (tr) =>
      useViewDispatch(editorView.value, tr, {
        trKey: trKeyQuote
      })
    );
  };

  /** 注册 Dispatch 回调钩子 */
  const onEditorDispatched = (fn: DispatchHook, meta?: Record<string, any>) => {
    fn.hookMeta = meta;
    updateHooks.value.push(fn);
  };

  /** 获取当前光标处的 node */
  const applyForNodesAtCursor = (fn: (node: Node, pos: number) => void) => {
    const { from, to, empty } = editorView.value.state.selection;
    if (empty) {
      editorView.value.state.doc.nodesBetween(from, to, fn);
    }
  };

  const editorCompose: EditorComposable = {
    view: editorView,
    options,
    toggleHeading,
    toggleAlign,
    toggleList,
    toggleMark,
    toggleTextColor,
    toggleTextBgColor,
    toggleQuoteBlock,
    toJSON,
    focus,
    onEditorDispatched,
    applyForNodesAtCursor
  };

  return {
    initEditor,
    editorCompose
  };
}
