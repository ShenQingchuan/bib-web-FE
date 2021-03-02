import { isBibUserTokenValid } from './utils/user-token-validation';
import { message } from 'ant-design-vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { Component } from 'vue';
const DEFAULT_ROUTE_TITILE = 'Bib · 打造你的云上知识库';
const $title = (title: string) => `${title} | ${DEFAULT_ROUTE_TITILE}`;

/**
 * 路由项工厂函数
 * @param path URL 路径名
 * @param component 组件 ()=>import()
 * @param title 路由相应页面标题
 * @param meta 元信息
 * @param children 嵌套子路由
 */
const createRoute = (
  path: string,
  component: () => Promise<Component>,
  title: string = 'Bib',
  meta: Record<string | number | symbol, any> = {},
  children?: RouteRecordRaw[]
): RouteRecordRaw => {
  return {
    path,
    component,
    children,
    meta: {
      title: $title(title),
      ...meta
    }
  };
};

const dynamicViewsModules = import.meta.glob('./pages/**/*.{vue,tsx}');

const routes: Array<RouteRecordRaw> = [
  createRoute('/', dynamicViewsModules['./pages/landing.vue'], '欢迎'),
  createRoute(
    '/dashboard',
    dynamicViewsModules['./pages/dashboard/layout.vue'],
    '工作台',
    {
      requiredAuth: true
    },
    [
      createRoute(
        '',
        dynamicViewsModules['./pages/dashboard/index.vue'],
        '工作台'
      ),
      createRoute(
        'collections',
        dynamicViewsModules['./pages/dashboard/collections.vue'],
        '收藏'
      ),
      createRoute(
        'recycles',
        dynamicViewsModules['./pages/dashboard/recycles.vue'],
        '回收站'
      )
    ]
  ),
  createRoute('/login', dynamicViewsModules['./pages/login.vue'], '登录'),
  createRoute('/register', dynamicViewsModules['./pages/register.vue'], '注册'),
  createRoute(
    '/password-retrieve',
    dynamicViewsModules['./pages/password-retrieve.vue'],
    '找回密码'
  ),
  createRoute(
    '/user/:userName',
    dynamicViewsModules['./pages/user-center.vue'],
    '个人中心'
  ),
  createRoute(
    '/editor-playground',
    dynamicViewsModules['./pages/editor-playground.vue'],
    '编辑器预览'
  ),

  createRoute(
    '/not-found',
    dynamicViewsModules['./pages/not-found.vue'],
    '404'
  ),
  { path: '/:pathMatch(.*)*', redirect: '/not-found' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach(async (to, from, next) => {
  console.log(
    `[Vue Router]: 正在从 ${from.fullPath} --> 前往 --> ${to.fullPath}`
  );
  // 更换页面标题
  document.title = to.meta?.title || DEFAULT_ROUTE_TITILE;
  // 首页 / 若已登录重定向至工作台
  const logined = isBibUserTokenValid();
  if (to.path === '/' && logined) {
    next('/dashboard');
  }
  if (to.path === '/login' && logined) {
    message.warn('您已经登录，若要重新登录请退出当前帐号！');
    next('/dashboard');
  }
  // 若未登录则重定向至登录页
  if (to.meta.requiredAuth && !logined) {
    message.warning('请您先登录后再操作！', 2);
    next('/login');
  } else next();
});

export default router;
