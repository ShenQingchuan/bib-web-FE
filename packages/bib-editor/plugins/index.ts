import { Plugin } from "prosemirror-state";
import { history } from "prosemirror-history";
import { EditorSchema } from "../editor-schema";
import { buildInputRules, buildPasteRules } from "../input-rules";
import { addBibKeymap } from "@editor/helpers";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { goToNextCell, tableEditing, columnResizing } from "prosemirror-tables";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { arrowHandlersInCodeBlock } from "../node-views/code-block-view";
import { BibEditorOptions, OnlineUser } from "../typings";
import { mathPlugin } from "@benrbray/prosemirror-math";
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror";
import { userDetailsStorageRef } from "@/utils";
import * as Y from "yjs";
import randomColor from "randomcolor";
import placeholder from "./placeholder";
import handleLinkClick from "./handle-link-click";
import codeBlockPlugin from "./code-view-plugin";
import { WebsocketProvider } from "y-websocket";
import { Ref } from "vue";

export * from "./placeholder";
export * from "./code-view-plugin";
export * from "./handle-link-click";

interface YjsPluginContext {
  cursorColor: Ref<string>;
  onlineOtherUsers: Ref<OnlineUser[]>;
}

export function useYjs(
  options: BibEditorOptions,
  { cursorColor, onlineOtherUsers }: YjsPluginContext
): [Plugin<any, any>[], WebsocketProvider] {
  const ydoc = new Y.Doc();
  // Y.js 协同配置：
  const provider = new WebsocketProvider(
    process.env.NODE_ENV === "production"
      ? "wss://bibyjs.techdict.pro"
      : "ws://localhost:2048",
    options.docName,
    ydoc
  );
  const credential = options.credential;
  const yjsPlugins: Plugin<any, any>[] = [
    ySyncPlugin(ydoc.getXmlFragment(options.docName)),
    // @ts-ignore :: 此处该库类型定义存疑
    yCursorPlugin(provider.awareness, {
      cursorBuilder: user => {
        const cursor = document.createElement("span");
        cursor.classList.add("ProseMirror-yjs-cursor");
        cursor.style.borderColor = user.color;

        const dot = document.createElement("div");
        dot.classList.add("ProseMirror-yjs-cursor__dot");
        dot.style.backgroundColor = user.color;

        const userDiv = document.createElement("div");
        userDiv.classList.add("ProseMirror-yjs-cursor__user-name");
        userDiv.style.backgroundColor = user.color;
        userDiv.insertBefore(document.createTextNode(user.name), null);

        cursor.insertBefore(dot, null);
        cursor.insertBefore(userDiv, null);
        return cursor;
      }
    }),
    yUndoPlugin()
  ];

  // 更新本文档在线的其他用户
  // @ts-ignore
  provider.awareness.on("update", () => {
    onlineOtherUsers.value = [...provider.awareness.getStates().entries()]
      .filter(s => s[0] !== provider.awareness.clientID)
      .map(s => ({
        userId: s[1].user.uid,
        userName: s[1].user.name,
        avatarURL: s[1].user.avatarURL,
        color: s[1].user.color
      }));
  });

  cursorColor.value = randomColor({
    luminosity: "dark"
  });
  provider.awareness.setLocalStateField("user", {
    color: cursorColor.value,
    name: credential?.userName,
    uid: credential?.userId,
    avatarURL:
      userDetailsStorageRef.value?.avatarURL || credential?.avatarURL || ""
  });

  return [yjsPlugins, provider];
}

export function importBasePlugins(options: BibEditorOptions) {
  const allPlugins: Plugin<any, any>[] = [
    history(),
    buildInputRules(EditorSchema),
    ...buildPasteRules(EditorSchema),
    addBibKeymap(EditorSchema),
    keymap(baseKeymap),
    keymap({
      Tab: goToNextCell(1),
      "Shift-Tab": goToNextCell(-1)
    }),
    // @ts-ignore :: 此处 prosemirror-tables 类型定义存疑
    columnResizing(),
    tableEditing(),
    dropCursor(),
    gapCursor(),
    placeholder(
      !options.readonly
        ? options.placeholder || "写点什么吧 ..."
        : "文章还没有任何内容..."
    ),
    arrowHandlersInCodeBlock,
    handleLinkClick,
    mathPlugin,
    codeBlockPlugin()
  ];

  return allPlugins;
}
