import * as pmutils from 'prosemirror-utils';
import * as Y from 'yjs';
import randomColor from 'randomcolor';
import TaskItemView from '../node-views/task-item-view';
import clearNodes from '../commands/clearNodes';
import placeholder from '../plugins/placeholder';
import handleLinkClick from '../plugins/handle-link-click';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node, NodeType, MarkType, Schema } from 'prosemirror-model';
import { addBibKeymap } from '../helpers/add-bib-keymap';
import { buildInputRules, buildPasteRules } from '../input-rules';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import { EditorSchema } from '../editor-schema';
import { shallowRef, ref } from 'vue';
import {
  liftListItem,
  sinkListItem,
  wrapInList
} from 'prosemirror-schema-list';
import { WebsocketProvider } from 'y-websocket';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, prosemirrorToYDoc } from 'y-prosemirror';
import { keymap } from 'prosemirror-keymap';
import {
  baseKeymap,
  Command,
  lift,
  setBlockType,
  toggleMark as _tm,
  wrapIn
} from 'prosemirror-commands';
import CodeBlockView, {
  arrowHandlersInCodeBlock
} from '../node-views/code-block-view';
import type {
  BibEditorOptions,
  DispatchHook,
  EditorComposition,
  EditorInstance,
  EditorToggleCategories,
  InsertImageType,
  OnlineUser,
  TableCommand
} from '../typings';
import { insertOnlineImage } from '../helpers/insert-online-img';
import {
  trKeyMark,
  trKeyHeading,
  trKeyAlign,
  trKeyList,
  trKeyTextColor,
  trKeyQuote,
  trKeyHr,
  trKeyFontSize,
  trKeyIndent
} from '../trKeys';
import { mathPlugin, mathSerializer } from '@benrbray/prosemirror-math';
import VideoIframeView from '../node-views/video-iframe';
import { insertVideoIframe } from '../helpers/insert-video-iframe';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import insertTableCommand from '../commands/insertTable';
import execTableCommandFn from '../helpers/exec-table-command';
import { userDetailsStorageRef } from '@/utils';

function isListNodeType(node: Node, schema: Schema) {
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

export function useEditor(options: BibEditorOptions) {
  const onlineOtherUsers = ref<OnlineUser[]>([]);
  let cursorColor = ref('');

  // inner helper: 创建切换颜色的 Command，分别用于文字颜色和高亮颜色
  const createToggleColorCommand = (view: EditorView, markType: MarkType, trKey: string) => {
    return (color: string) => {
      const { state, dispatch } = view;
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

  /** 初始化 EditorView 方法（可通过 ref hook） */
  const initEditor = (el: any) => {
    let initState: EditorState, provider: WebsocketProvider;
    let plugins = [
      history(),
      buildInputRules(EditorSchema),
      ...buildPasteRules(EditorSchema),
      addBibKeymap(EditorSchema),
      keymap(baseKeymap),
      keymap({
        Tab: goToNextCell(1),
        'Shift-Tab': goToNextCell(-1)
      }),
      // @ts-ignore :: 此处 prosemirror-tables 类型定义存疑
      columnResizing(),
      tableEditing(),
      dropCursor(),
      gapCursor(),
      placeholder(
        !options.readonly
          ? (options.placeholder || '写点什么吧 ...')
          : '文章还没有任何内容...'
      ),
      arrowHandlersInCodeBlock,
      handleLinkClick,
      mathPlugin,
    ];

    // 编辑模式 启用协同相关插件
    if (!options.readonly) {
      let ydoc = new Y.Doc();
      // Y.js 协同配置：
      provider = new WebsocketProvider(
        'ws://localhost:2048',
        options.docName,
        ydoc
      );
      const credential = options.credential;
      plugins = plugins.concat([
        ySyncPlugin(ydoc.getXmlFragment(options.docName)),
        // @ts-ignore :: 此处该库类型定义存疑
        yCursorPlugin(provider.awareness, {
          cursorBuilder: (user) => {
            const cursor = document.createElement('span');
            cursor.classList.add('ProseMirror-yjs-cursor');
            cursor.style.borderColor = user.color;

            const dot = document.createElement('div');
            dot.classList.add('ProseMirror-yjs-cursor__dot');
            dot.style.backgroundColor = user.color;

            const userDiv = document.createElement('div');
            userDiv.classList.add('ProseMirror-yjs-cursor__user-name');
            userDiv.style.backgroundColor = user.color;
            userDiv.insertBefore(document.createTextNode(user.name), null);

            cursor.insertBefore(dot, null);
            cursor.insertBefore(userDiv, null);
            return cursor;
          }
        }),
        yUndoPlugin()
      ]);

      // 更新本文档在线的其他用户
      // @ts-ignore
      provider.awareness.on('update', () => {
        onlineOtherUsers.value = [...provider.awareness.getStates().entries()]
          .filter((s) => s[0] !== provider.awareness.clientID)
          .map((s) => ({
            userId: s[1].user.uid,
            userName: s[1].user.name,
            avatarURL: s[1].user.avatarURL,
            color: s[1].user.color
          }));
      });

      cursorColor.value = randomColor({
        luminosity: 'dark'
      });
      provider.awareness.setLocalStateField('user', {
        color: cursorColor.value,
        name: credential?.userName,
        uid: credential?.userId,
        avatarURL: userDetailsStorageRef.value?.avatarURL || credential?.avatarURL || ''
      });

      initState = EditorState.create({
        schema: EditorSchema,
        plugins
      });
    } else {
      initState = EditorState.create({
        doc: Node.fromJSON(EditorSchema, JSON.parse(options.contentForViewRender!)),
        schema: EditorSchema,
        plugins
      });
    }

    const view = new EditorView(el as HTMLDivElement, {
      state: initState,
      dispatchTransaction(tr) {
        try {
          const newState = view.state.apply(tr);
          view.updateState(newState);
          editorInstance.dispatchHooks.forEach((hook) => {
            hook(tr, hook.hookMeta);
          });
        } catch (err) {
          console.log('[BibEditor ProseMirror Error]: ', err);
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
      clipboardTextSerializer: (slice) => {
        return mathSerializer.serializeSlice(slice);
      }
    });

    const editorInstance: EditorInstance = {
      dispatchHooks: [],
      view,
      options,
      /** 强制聚焦该编辑器 */
      focus() {
        view.focus();
      },
      /** 切换 标题级别 */
      toggleHeading(attrs: { level: number }) {
        view.focus();
        const { level } = attrs;
        setBlockType(EditorSchema.nodes.heading, attrs)(
          view.state,
          (tr) =>
            useViewDispatch(view, tr, {
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

        tr.setMeta('trKey', trKeyFontSize);
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
            (node) => node.type.name === 'list_item'
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
        view.dispatch(tr);
      },
      /** 增加/减少缩进 */
      updateIndent(t: '+' | '-') {
        view.focus();
        const { state, dispatch } = view;
        const { selection, tr, doc } = state;
        const { from, to } = selection;

        const listParent = pmutils.findParentNode((node) =>
          ['bullet_list', 'ordered_list', 'task_list'].includes(node.type.name)
        )(selection);
        // 对于在 List 里的情况，特殊化处理：
        if (listParent) {
          const listItemType = EditorSchema.nodes.list_item,
            taskItemType = EditorSchema.nodes.task_item;
          const runCommandForListCases = (cmd: Command) => {
            cmd(state, ($tr) =>
              useViewDispatch(view, $tr, {
                trKey: trKeyIndent
              })
            );
          };
          if (
            listParent.node.type === EditorSchema.nodes.ordered_list ||
            listParent.node.type === EditorSchema.nodes.bullet_list
          ) {
            t === '+'
              ? runCommandForListCases(sinkListItem(listItemType))
              : runCommandForListCases(liftListItem(listItemType));
          } else if (listParent.node.type === EditorSchema.nodes.task_list) {
            t === '+'
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
            t === '+' ? (textIndent += 1) : (textIndent -= 1);
            tr.setNodeMarkup(pos, null as any, {
              ...node.attrs,
              textIndent
            });
            tr.setMeta('trKey', trKeyIndent);
            dispatch(tr);
          });
        }
      },
      /** 切换 列表类型 */
      toggleList(listType: NodeType, itemType: NodeType) {
        let { state, dispatch } = view;
        const { schema, selection, tr } = state;
        const { $from, $to } = selection;
        const range = $from.blockRange($to);
        if (!range) {
          return;
        }
        const parentList = pmutils.findParentNode((node) =>
          isListNodeType(node, schema)
        )(selection);
        if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
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
              tr.setMeta('trKey', trKeyList);
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
      toggleMark(markName: EditorToggleCategories) {
        view.focus();
        _tm(EditorSchema.marks[markName])(view.state, (tr) =>
          useViewDispatch(view, tr, {
            trKey: trKeyMark,
            mark: markName
          })
        );
      },
      /** 切换 文字颜色 */
      toggleTextColor: createToggleColorCommand(
        view,
        EditorSchema.marks.colored,
        trKeyTextColor,
      ),
      /** 切换 文字背景高亮颜色 */
      toggleTextBgColor: createToggleColorCommand(
        view,
        EditorSchema.marks.hightlighted,
        trKeyTextColor,
      ),
      /** 切换 文字引用块 */
      toggleQuoteBlock() {
        view.focus();
        const { selection } = view.state;
        const parentHasQuote = pmutils.findParentNode((node) => {
          console.log(node.type.name);
          return ['blockquote'].includes(node.type.name);
        })(selection);
        let command = parentHasQuote ? lift : wrapIn(EditorSchema.nodes.blockquote);
        command(view.state, (tr) =>
          useViewDispatch(view, tr, {
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
        tr.setMeta('trKey', trKeyHr);
        view.dispatch(tr);
        view.focus();
      },
      /** 插入 图片 */
      insertImage(insertType: InsertImageType) {
        view.focus();
        if (insertType === 'local') {
          const inputer: HTMLInputElement | null = document.querySelector(
            '.bib-editor__local-image-inputer'
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
        insertTableCommand(view.state, view.dispatch, { rowsCount, colsCount });
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
      /** 退出编辑 */
      quitEditor(callback?: (...innerArgs: any[]) => void, ...args: any[]) {
        provider.disconnect();
        callback?.(...args);
      }
    };

    // onViewCreated Hook
    options.onViewCreated?.(view);
    return editorInstance;
  };
  

  return {
    initEditor,
    onlineOtherUsers,
    cursorColor
  } as EditorComposition;
}
