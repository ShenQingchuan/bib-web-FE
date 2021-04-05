import {
  wrapIn,
  setBlockType,
  chainCommands,
  toggleMark,
  exitCode,
  joinUp,
  joinDown,
  lift,
  selectParentNode,
  Command,
  deleteSelection,
  selectNodeBackward,
  joinBackward
} from 'prosemirror-commands';
import {
  wrapInList,
  splitListItem,
  liftListItem,
  sinkListItem
} from 'prosemirror-schema-list';
import { Schema, NodeType, MarkType } from 'prosemirror-model';
import { undo, redo } from 'y-prosemirror';
import { undoInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { mathBackspaceCmd } from '@benrbray/prosemirror-math';

const mac =
  typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

// :: (Schema, ?Object) → Object
// Inspect the given schema looking for marks and nodes from the
// basic schema, and if found, add key bindings related to them.
// This will add:
//
// * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
// * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
// * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
// * **Ctrl-Shift-0** for making the current textblock a paragraph
// * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
//   textblock a heading of the corresponding level
// * **Ctrl-Shift-Backslash** to make the current textblock a code block
// * **Ctrl-Shift-8** to wrap the selection in an ordered list
// * **Ctrl-Shift-9** to wrap the selection in a bullet list
// * **Ctrl->** to wrap the selection in a block quote
// * **Enter** to split a non-empty textblock in a list item while at
//   the same time splitting the list item
// * **Mod-Enter** to insert a hard break
// * **Mod-_** to insert a horizontal rule
// * **Backspace** to undo an input rule
// * **Alt-ArrowUp** to `joinUp`
// * **Alt-ArrowDown** to `joinDown`
// * **Mod-BracketLeft** to `lift`
// * **Escape** to `selectParentNode`
//
// You can suppress or map these bindings by passing a `mapKeys`
// argument, which maps key names (say `"Mod-B"` to either `false`, to
// remove the binding, or a new key name string.
export function addBibKeymap(schema: Schema, mapKeys?: any) {
  let keys: any = {},
    type: NodeType | MarkType;
  function bind(key: string, cmd: Command) {
    if (mapKeys) {
      let mapped = mapKeys[key];
      if (mapped === false) return;
      if (mapped) key = mapped;
    }
    keys[key] = cmd;
  }

  bind('Mod-z', undo);
  bind('Shift-Mod-z', redo);
  bind(
    'Backspace',
    chainCommands(
      undoInputRule,
      deleteSelection,
      mathBackspaceCmd,
      joinBackward,
      selectNodeBackward
    )
  );
  if (!mac) bind('Mod-y', redo);

  bind('Alt-ArrowUp', joinUp);
  bind('Alt-ArrowDown', joinDown);
  bind('Mod-BracketLeft', lift);
  bind('Escape', selectParentNode);

  if ((type = schema.marks.strong)) bind('Mod-b', toggleMark(type));
  if ((type = schema.marks.em)) bind('Mod-i', toggleMark(type));
  if ((type = schema.marks.code)) bind('Mod-`', toggleMark(type));

  if ((type = schema.nodes.bullet_list)) bind('Shift-Ctrl-8', wrapInList(type));
  if ((type = schema.nodes.ordered_list))
    bind('Shift-Ctrl-9', wrapInList(type));
  if ((type = schema.nodes.blockquote)) bind('Ctrl->', wrapIn(type));
  if ((type = schema.nodes.hard_break)) {
    let br = type,
      cmd = chainCommands(exitCode, (state, dispatch) => {
        dispatch!(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
        return true;
      });
    bind('Mod-Enter', cmd);
    bind('Shift-Enter', cmd);
    if (mac) bind('Ctrl-Enter', cmd);
  }
  if ((type = schema.nodes.list_item)) {
    bind('Mod-[', liftListItem(type));
    bind('Mod-]', sinkListItem(type));
    bind('Tab', sinkListItem(type));
  }
  bind(
    'Enter',
    chainCommands(
      splitListItem(schema.nodes.task_item),
      splitListItem(schema.nodes.list_item)
    )
  );
  if ((type = schema.nodes.paragraph)) bind('Shift-Ctrl-0', setBlockType(type));
  if ((type = schema.nodes.code_block))
    bind('Shift-Ctrl-\\', setBlockType(type));
  if ((type = schema.nodes.heading))
    for (let i = 1; i <= 6; i++)
      bind('Shift-Ctrl-' + i, setBlockType(type, { level: i }));

  return keymap(keys);
}
