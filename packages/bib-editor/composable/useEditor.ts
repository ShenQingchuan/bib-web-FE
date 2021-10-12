import { ref } from "vue";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, NodeType, Schema } from "prosemirror-model";
import { Command, lift, setBlockType, wrapIn } from "prosemirror-commands";
import {
  liftListItem,
  sinkListItem,
  wrapInList
} from "prosemirror-schema-list";
import * as pmutils from "prosemirror-utils";
import { mathSerializer } from "@benrbray/prosemirror-math";
import { EditorSchema } from "@editor/schemas";
import {
  BibEditorOptions,
  DispatchHook,
  EditorCompose,
  EditorInstance,
  CanToggleMark,
  InsertImageType,
  OnlineUser,
  TableCommand,
  DocContentElement,
  DocTableOfContentsUnit
} from "@editor/typings";
import {
  trKeyToggleMark,
  trKeyHeading,
  trKeyAlign,
  trKeyList,
  trKeyTextColor,
  trKeyQuote,
  trKeyHr,
  trKeyFontSize,
  trKeyIndent
} from "@editor/trKeys";
import {
  VideoIframeView,
  CodeBlockView,
  TaskItemView
} from "@editor/node-views";
import {
  importBasePlugins,
  useYjs,
  removeCodeBlockOverlay
} from "@editor/plugins";
import { insertTableCommand, clearNodes, toggleMark } from "@editor/commands";
import {
  execTableCommand as execTableCommandFn,
  insertVideoIframe,
  insertOnlineImage,
  createToggleColorCommand
} from "@editor/helpers";
import { pipeBibEditorDispatch } from "@editor/utils";
import { useTableOfContents } from "./useTableOfContents";
import { Keys } from "@/utils";
import { message } from "ant-design-vue";
import { bibEditorHeadingSelector } from "../constants";

function isListNodeType(node: Node, schema: Schema) {
  return (
    node.type === schema.nodes.bullet_list ||
    node.type === schema.nodes.ordered_list ||
    node.type === schema.nodes.task_list
  );
}

export function useEditor(options: BibEditorOptions) {
  const onlineOtherUsers = ref<OnlineUser[]>([]);
  const cursorColor = ref("");
  const tableOfContents = ref<DocTableOfContentsUnit[]>([]);

  /** 初始化 EditorView 方法（可通过 ref hook） */
  const initEditor = (el: any) => {
    let initState: EditorState;
    const plugins = importBasePlugins(options);
    const [yjsPlugins, provider] = useYjs(options, {
      cursorColor,
      onlineOtherUsers
    });

    // 编辑模式 启用协同相关插件
    if (!options.readonly) {
      initState = EditorState.create({
        schema: EditorSchema,
        plugins: plugins.concat(yjsPlugins)
      });
      (el as HTMLElement).addEventListener("keydown", (e: KeyboardEvent) => {
        if (
          (e.metaKey || e.ctrlKey) &&
          e.key === Keys.Key_S.keyName.toLowerCase()
        ) {
          e.preventDefault(); // 阻止浏览器保存网页
          message.success({
            content: "文档内容已经实时保存",
            key: "doc-already-auto-saved-msg",
            duration: 1
          });
        }
      });
    }
    // 只读模式
    else {
      const docJSON = JSON.parse(options.contentForViewRender!);
      initState = EditorState.create({
        doc: Node.fromJSON(EditorSchema, docJSON),
        schema: EditorSchema,
        plugins
      });
      tableOfContents.value = useTableOfContents(docJSON);
    }

    const view = new EditorView(el as HTMLDivElement, {
      state: initState,
      dispatchTransaction(tr) {
        try {
          const newState = view.state.apply(tr);
          view.updateState(newState);
          editorInstance.dispatchHooks.forEach(hook => {
            hook(tr, hook.hookMeta);
          });
        } catch (err) {
          console.log("[BibEditor ProseMirror Error]: ", err);
        }
      },
      nodeViews: {
        code_block(node, view, getPos) {
          return new CodeBlockView(node, view, getPos);
        },
        task_item(node, view, getPos) {
          return new TaskItemView(node, view, getPos);
        },
        video_iframe(node, view, getPos) {
          return new VideoIframeView(node, view, getPos);
        }
      },
      // @ts-ignore
      editable() {
        return !options.readonly;
      },
      clipboardTextSerializer: slice => {
        return mathSerializer.serializeSlice(slice);
      }
    });

    const editorInstance: EditorInstance = {
      dispatchHooks: [],
      view,
      options,
      tableOfContents,
      /** 强制聚焦该编辑器 */
      focus() {
        view.focus();
      },
      /** 切换 标题级别 */
      toggleHeading(attrs: { level: number }) {
        view.focus();
        const { level } = attrs;
        setBlockType(EditorSchema.nodes.heading, attrs)(view.state, tr =>
          pipeBibEditorDispatch(view.dispatch, tr, {
            trKey: trKeyHeading,
            level
          })
        );
      },
      /** 切换 字体大小 */
      toggleFontSize(size: number) {
        view.focus();
        const { state, dispatch } = view;
        const { selection, tr } = state;
        const { from, to, empty } = selection;

        const sizeMark = EditorSchema.marks.fontSizeMark.create({
          size
        });
        // 是选区状态
        if (!empty) {
          tr.addMark(from, to, sizeMark);
        }
        // 是光标状态
        else {
          tr.addStoredMark(sizeMark);
        }

        tr.setMeta("trKey", trKeyFontSize);
        dispatch(tr);
      },
      /** 切换 文字对齐方向 */
      toggleAlign(direction: string) {
        view.focus();
        const { selection, tr } = view.state;
        // 选区是范围状态
        if (!selection.empty) {
          const { from, to } = view.state.selection;
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
          const selection = view.state.selection;
          const { from, to } = selection;
          const parent = pmutils.findParentNode(
            node => node.type.name === "list_item"
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

        tr.setMeta("trKey", trKeyAlign);
        view.dispatch(tr);
      },
      /** 增加/减少缩进 */
      updateIndent(t: "+" | "-") {
        view.focus();
        const { state, dispatch } = view;
        const { selection, tr, doc } = state;
        const { from, to } = selection;

        const listParent = pmutils.findParentNode(node =>
          ["bullet_list", "ordered_list", "task_list"].includes(node.type.name)
        )(selection);
        // 对于在 List 里的情况，特殊化处理：
        if (listParent) {
          const listItemType = EditorSchema.nodes.list_item,
            taskItemType = EditorSchema.nodes.task_item;
          const runCommandForListCases = (cmd: Command) => {
            cmd(state, tr =>
              pipeBibEditorDispatch(view.dispatch, tr, {
                trKey: trKeyIndent
              })
            );
          };
          if (
            listParent.node.type === EditorSchema.nodes.ordered_list ||
            listParent.node.type === EditorSchema.nodes.bullet_list
          ) {
            t === "+"
              ? runCommandForListCases(sinkListItem(listItemType))
              : runCommandForListCases(liftListItem(listItemType));
          } else if (listParent.node.type === EditorSchema.nodes.task_list) {
            t === "+"
              ? runCommandForListCases(sinkListItem(taskItemType))
              : runCommandForListCases(liftListItem(taskItemType));
          }
        }
        // 其他：则必须是含 textIndent 的 textBlock 类型节点
        else {
          doc.nodesBetween(from, to, (node, pos) => {
            if (!node.type.spec.attrs?.textIndent) {
              return;
            }
            let textIndent = node.attrs?.textIndent;
            t === "+" ? (textIndent += 1) : (textIndent -= 1);
            tr.setNodeMarkup(pos, null as any, {
              ...node.attrs,
              textIndent
            });
            tr.setMeta("trKey", trKeyIndent);
            dispatch(tr);
          });
        }
      },
      /** 切换 列表类型 */
      toggleList(listType: NodeType, itemType: NodeType) {
        let { state } = view;
        const { dispatch } = view;
        const { schema, selection, tr } = state;
        const { $from, $to } = selection;
        const range = $from.blockRange($to);
        if (!range) {
          return;
        }
        const parentList = pmutils.findParentNode(node =>
          isListNodeType(node, schema)
        )(selection);
        if (
          range.depth >= 1 &&
          parentList &&
          range.depth - parentList.depth <= 1
        ) {
          // turn-off this kind of list when it's already active
          if (parentList.node.type === listType) {
            liftListItem(itemType)(state, dispatch);
            return;
          }

          // if editor can switch list type between the two
          // ( ol <-> ul )
          if (isListNodeType(parentList.node, schema) && dispatch) {
            if (listType.validContent(parentList.node.content)) {
              tr.setNodeMarkup(parentList.pos, listType);
              tr.setMeta("trKey", trKeyList);
              return dispatch(tr);
            } else {
              clearNodes()(state, dispatch);
              // state has changed, so it needs an update
              state = view.state;
              wrapInList(listType)(state, dispatch);
              return;
            }
          }
        }

        // just wrap in list
        wrapInList(listType)(state, dispatch);
      },
      /** 切换 mark */
      toggleMark(markName: CanToggleMark) {
        view.focus();
        toggleMark(markName, {
          trKey: trKeyToggleMark,
          mark: markName
        })(view.state, view.dispatch);
      },
      /** 切换 文字颜色 */
      toggleTextColor: createToggleColorCommand(
        view,
        EditorSchema.marks.colored,
        trKeyTextColor
      ),
      /** 切换 文字背景高亮颜色 */
      toggleTextBgColor: createToggleColorCommand(
        view,
        EditorSchema.marks.hightlighted,
        trKeyTextColor
      ),
      /** 切换 文字引用块 */
      toggleQuoteBlock() {
        view.focus();
        const { selection } = view.state;
        const parentHasQuote = pmutils.findParentNode(node => {
          return ["blockquote"].includes(node.type.name);
        })(selection);
        const command = parentHasQuote
          ? lift
          : wrapIn(EditorSchema.nodes.blockquote);
        command(view.state, tr =>
          pipeBibEditorDispatch(view.dispatch, tr, {
            trKey: trKeyQuote
          })
        );
      },
      /** 插入 分割线 */
      insertHorizontalRuleLine() {
        const { tr } = view.state;
        tr.replaceSelectionWith(
          EditorSchema.nodes.horizontal_line.create()
        ).scrollIntoView();
        tr.setMeta("trKey", trKeyHr);
        view.dispatch(tr);
        view.focus();
      },
      /** 插入 图片 */
      insertImage(insertType: InsertImageType) {
        view.focus();
        if (insertType === "local") {
          const inputer: HTMLInputElement | null = document.querySelector(
            ".bib-editor__local-image-inputer"
          );
          inputer?.click();
          // 呼出文件上传窗口，后续由 input 的 @change 事件接管
        } else {
          const { state, dispatch } = view;
          const { tr } = state;
          insertOnlineImage(tr, dispatch);
        }
      },
      /** 插入 视频 */
      insertVideo(icon: string, label: string) {
        view.focus();
        const { state, dispatch } = view;
        const { tr } = state;
        insertVideoIframe(icon, label, tr, dispatch);
      },
      /** 插入 表格 */
      insertTable(rowsCount: number, colsCount: number) {
        view.focus();
        insertTableCommand({ rowsCount, colsCount })(view.state, view.dispatch);
      },
      /** 表格工具集：execTableCommand */
      execTableCommand(cmdName: TableCommand) {
        execTableCommandFn(view.state, view.dispatch, cmdName);
        view.focus();
      },
      /** 注册 Dispatch 回调钩子 */
      onEditorDispatched(fn: DispatchHook, meta?: Record<string, any>) {
        fn.hookMeta = meta;
        this.dispatchHooks.push(fn);
      },
      /** 将 fn 回调函数应用于当前光标处的所有 node */
      applyForNodesAtCursor(fn: (node: Node, pos: number) => void) {
        const { from, to, empty } = view.state.selection;
        if (empty) {
          view.state.doc.nodesBetween(from, to, fn);
        }
      },
      /** 将文档 doc 输出为 JSON 字符串 */
      toJSON() {
        return view.state.doc.toJSON();
      },
      getTableOfContents() {
        this.tableOfContents.value = useTableOfContents(
          this.view.state.doc.toJSON() as DocContentElement
        );
      },
      /** 退出编辑 */
      quitEditor(callback?: (...innerArgs: any[]) => void, ...args: any[]) {
        provider.disconnect();
        callback?.(...args);
      }
    };

    // onViewCreated Hook
    options.onViewCreated?.(view);

    editorInstance.onEditorDispatched(tr => {
      // editor pointer trasaction handle
      if (tr.getMeta("pointer") === true) {
        removeCodeBlockOverlay(); // 清除代码块的全选状态
      } else if (tr.getMeta("y-sync$")) {
        editorInstance.getTableOfContents();
      }
    });
    return editorInstance;
  };

  return {
    initEditor,
    onlineOtherUsers,
    cursorColor
  } as EditorCompose;
}
