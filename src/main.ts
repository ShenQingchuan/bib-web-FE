import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "ant-design-vue/dist/antd.less";
import "codemirror/lib/codemirror.css";
import "./less/global.less";

// CodeMirror Language Modes
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/php/php.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/clike/clike.js";
import "codemirror/mode/swift/swift.js";
import "codemirror/mode/go/go.js";
import "codemirror/mode/dart/dart.js";
import "codemirror/mode/dockerfile/dockerfile.js";
import "codemirror/mode/jsx/jsx.js";
import "codemirror/mode/lua/lua.js";
import "codemirror/mode/shell/shell.js";
import "codemirror/mode/css/css.js";
import "codemirror/mode/sass/sass.js";
import "codemirror/mode/rust/rust.js";

import {
  Space,
  Input,
  Button,
  AutoComplete,
  Dropdown,
  Popover,
  Card,
  Menu,
  Tabs,
  Avatar,
  Divider,
  Form,
  Tooltip,
  Radio,
  Switch,
  Layout,
  Row,
  Col,
} from "ant-design-vue";

createApp(App)
  .use(store)
  .use(router)
  // Use Antd components:
  .use(Space)
  .use(Button)
  .use(Input)
  .use(AutoComplete)
  .use(Dropdown)
  .use(Popover)
  .use(Card)
  .use(Menu)
  .use(Tabs)
  .use(Avatar)
  .use(Divider)
  .use(Form)
  .use(Tooltip)
  .use(Radio)
  .use(Row)
  .use(Col)
  .use(Switch)
  .use(Layout)
  .use(Divider)
  .mount("#app");
