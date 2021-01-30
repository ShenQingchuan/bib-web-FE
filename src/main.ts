import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "ant-design-vue/dist/antd.less";
import "codemirror/lib/codemirror.css";
import "./less/global.less";

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
  .mount("#app");
