import { isBibUserTokenValid } from "./utils/user-token-validation";
import { message } from "ant-design-vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const DEFAULT_ROUTE_TITILE = "Bib · 打造你的云上知识库";
const $title = (title: string) => `${title} | ${DEFAULT_ROUTE_TITILE}`;

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("./pages/landing.vue"),
  },
  {
    path: "/dashboard",
    component: () => import("./pages/dashboard.vue"),
    meta: {
      title: $title("工作台"),
      requiredAuth: true,
    },
  },
  {
    path: "/login",
    component: () => import("./pages/login.vue"),
    meta: {
      title: $title("登录"),
    },
  },
  {
    path: "/register",
    component: () => import("./pages/register.vue"),
    meta: {
      title: $title("注册"),
    },
  },
  {
    path: "/password-reset",
    component: () => import("./pages/password-reset.vue"),
    meta: {
      title: $title("忘记密码"),
    },
  },
  {
    path: "/not-found",
    component: () => import("./pages/not-found.vue"),
    meta: {
      title: $title("404"),
    },
  },
  { path: "/:pathMatch(.*)*", redirect: "/not-found" },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
router.beforeEach(async (to, from, next) => {
  // 更换页面标题
  document.title = to.meta?.title || DEFAULT_ROUTE_TITILE;
  // 首页 / 若已登录重定向至工作台
  const logined = isBibUserTokenValid();
  if (to.path === "/" && logined) {
    next("/dashboard");
  }
  if (to.path === "/login" && logined) {
    message.warn("您已经登录，若要重新登录请退出当前帐号！");
    next("/dashboard");
  }
  // 若未登录则重定向至登录页
  if (to.meta.requiredAuth && !logined) {
    message.warning("请您先登录后再操作！", 2);
    next("/login");
  } else next();
});

export default router;
