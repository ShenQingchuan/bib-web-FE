import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'ant-design-vue/dist/antd.less';
import 'prosemirror-view/style/prosemirror.css';
import 'codemirror/lib/codemirror.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

// project scoped
import './less/global.less';

// CodeMirror Language Modes
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/php/php.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/swift/swift.js';
import 'codemirror/mode/go/go.js';
import 'codemirror/mode/dart/dart.js';
import 'codemirror/mode/dockerfile/dockerfile.js';
import 'codemirror/mode/jsx/jsx.js';
import 'codemirror/mode/lua/lua.js';
import 'codemirror/mode/shell/shell.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/sass/sass.js';
import 'codemirror/mode/rust/rust.js';

import colorPicker from 'vue3-colorpicker';
import 'vue3-colorpicker/bundle.css';

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
  ConfigProvider,
  Empty,
  Skeleton,
  Breadcrumb,
  Timeline,
  Spin
} from 'ant-design-vue';

createApp(App)
  .use(store)
  .use(router)
  // Use Antd components:
  .use(AutoComplete)
  .use(Avatar)
  .use(Button)
  .use(Card)
  .use(Col)
  .use(ConfigProvider)
  .use(Divider)
  .use(Dropdown)
  .use(Form)
  .use(Input)
  .use(Layout)
  .use(Menu)
  .use(Popover)
  .use(Radio)
  .use(Row)
  .use(Space)
  .use(Switch)
  .use(Tabs)
  .use(Tooltip)
  .use(Empty)
  .use(Skeleton)
  .use(Breadcrumb)
  .use(Timeline)
  .use(Spin)
  .use(Tabs)
  // for vue3-colorpicker
  .use(colorPicker)
  .mount('#app');
