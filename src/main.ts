import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./less/global.less";
import "ant-design-vue/dist/antd.less";

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
  .use(Switch)
  .use(Layout)
  .mount("#app");
