import { isBibUserTokenValid } from './utils';
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

let routes: Array<RouteRecordRaw> = [
  createRoute('/', () => import('./pages/landing.vue'), '欢迎'),
  createRoute(
    '/dashboard',
    () => import('./pages/dashboard/layout.vue'),
    '工作台',
    {
      requiredAuth: true,
      keepalive: true
    },
    [
      createRoute('', () => import('./pages/dashboard/index.vue'), '工作台'),
      createRoute(
        'thumbs-uped',
        () => import('./pages/dashboard/thumbs-uped.vue'),
        '收藏',
        { keepalive: true }
      ),
      createRoute(
        'recycles',
        () => import('./pages/dashboard/recycles.vue'),
        '回收站',
        { keepalive: true }
      ),
      createRoute(
        'wikis',
        () => import('./pages/dashboard/wikis.vue'),
        '个人知识库',
        { keepalive: true }
      )
    ]
  ),
  createRoute('/login', () => import('./pages/login.vue'), '登录'),
  createRoute('/register', () => import('./pages/register.vue'), '注册'),
  createRoute(
    '/password-retrieve',
    () => import('./pages/password-retrieve.vue'),
    '找回密码'
  ),
  createRoute(
    '/user/:userName',
    () => import('./pages/user-center.vue'),
    '个人中心'
  ),
  createRoute(
    '/user-settings',
    () => import('./pages/user-settings.vue'),
    '账户设置',
    {
      requiredAuth: true
    }
  ),
  createRoute(
    '/doc/:docId',
    () => import('./pages/document/view.vue'),
    '查看文档',
    {
      requiredAuth: true
    }
  ),
  createRoute(
    '/doc/:docId/edit',
    () => import('./pages/document/edit.vue'),
    '编辑文档',
    {
      requiredAuth: true
    }
  ),
  createRoute('/wiki/new', () => import('./pages/wiki/new.vue'), '新建知识库', {
    requiredAuth: true
  }),
  createRoute(
    '/wiki/:wikiId',
    () => import('./pages/wiki/layout.vue'),
    '知识库',
    {
      requireAuth: true
    },
    [
      createRoute('', () => import('./pages/wiki/index.vue'), '知识库目录'),
      createRoute(
        'manage',
        () => import('./pages/wiki/manage.vue'),
        '管理知识库',
        {},
        [
          createRoute(
            'docs',
            () => import('./pages/wiki/docs.vue'),
            '管理知识库文档',
            { tab: 'docs', keepalive: true }
          )
        ]
      )
    ]
  ),
  createRoute('/org/new', () => import('./pages/org/new.vue'), '新建团队', {
    requiredAuth: true
  })
];

// 开发环境下开启的一些 path
if (process.env.NODE_ENV === 'development') {
  routes = routes.concat([
    /** todo */
  ]);
}

// 其余无法找到的都重定向到 not-found
routes = routes.concat([
  createRoute('/not-found', () => import('./pages/not-found.vue'), '404'),
  { path: '/:pathMatch(.*)*', redirect: '/not-found' }
]);

const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach(async (to, from, next) => {
  process.env.NODE_ENV === 'development' &&
    console.log(
      `[Vue Router]: 正在从 ${from.fullPath} --> 前往 --> ${to.fullPath}`
    );
  // 更换页面标题
  document.title = (to.meta?.title as string) || DEFAULT_ROUTE_TITILE;
  // 首页 / 若已登录重定向至工作台
  const logined = isBibUserTokenValid();

  if (logined) {
    if (to.path === '/') {
      next('/dashboard');
    } else if (to.path === '/login') {
      message.warn('您已经登录，若要重新登录请退出当前帐号！');
    } else if (/^\/wiki\/\d+\/manage$/g.test(to.path)) {
      next(to.path + '/docs');
    } else next();
  } else {
    if (to.meta.requiredAuth) {
      message.warning('请您先登录后再操作！', 2);
      next('/login');
    } else next();
  }
});

export default router;
