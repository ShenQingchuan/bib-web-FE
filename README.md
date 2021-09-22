# Bib 在线云文档

<img style="display: block; margin: 20px auto;" width="160" src="https://user-images.githubusercontent.com/46062972/134302970-ac6930cc-6982-4b8c-baaf-571628e99d2a.png">

本项目是一个支持协同编辑的在线云文档项目。采用 Vue 3 + TypeScript + Vite 构建，项目共分为三个仓库：

1. 前端（本仓库）
2. [后端 -- 基于 SpringBoot + MariaDB + Redis](https://github.com/KahraLab/bib-web-BE)
3. 使用 [Y.js](https://github.com/yjs/yjs) 实现的 [协同服务器](https://github.com/KahraLab/bib-web-yjs-server)

## 上手开发

### 启动前端

建议将三个仓库克隆到一个工作空间内，方便管理：
```bash
# 创建工作空间、克隆代码
mkdir bib
cd bib
git clone https://github.com/KahraLab/bib-web-FE
git clone https://github.com/KahraLab/bib-web-BE
git clone https://github.com/KahraLab/bib-web-yjs-server

# 安装前端依赖
cd bib-web-FE
pnpm i

# 安装协同编辑 Node.js 服务器依赖
cd ../bib-web-yjs-server
pnpm i
# 将 bib-web-yjs-server 全局链接
pnpm link

cd ../bib-web-FE
pnpm dev # Vite 开发服务器启动！🚀
```

### 启动后端

只启动前端是无法正常运行整个项目的，你还需要启动后端，而这依赖环境中含有：
- 正在运行的 MariaDB
- 正在运行的 Redis

推荐采用 docker-compose 直接启动，一键部署非常开心 🎉！

> Tips：这里的数据库 DevOps 相关配置没有严格遵循更安全的规范，如果您有这方面的经验可以分享，欢迎提出 issue 帮助改进此流程。

```yaml
version: '3.7'
services:
  bibserverMariadb:
    image: mariadb:latest
    container_name: bibserverMariadb
    hostname: bibserverMariadb
    restart: always
    ports: 
      - 3306:3306
    volumes: 
      - ~/data/mysql/:/var/lib/mysql
    environment: 
      - MYSQL_ROOT_PASSWORD=在这里设置数据库服务器密码
  bibserverRedis:
    restart: always
    image: redis:latest
    container_name: bibserverRedis
    hostname: bibserverRedis
    ports: 
      - 6379:6379
    volumes: 
      - ~/data/redis:/data
```

后台模式来启动数据库组件运行：

```bash
docker-compose up -d
```

以开发者姿态启动后端，推荐（甚至可以说必须）采用 IntelliJ IDEA 打开项目来运行。

在 IDEA 解析、同步与构建项目完成后，右上角会自动生成启动配置：

<img style="display: block; margin: 20px auto;" width="400" src="https://user-images.githubusercontent.com/46062972/134305598-7d6568fd-69bd-42e8-93e8-931cc56792e7.png">

点击配置下拉菜单进行编辑，找到环境变量配置：

<img style="display: block; margin: 20px auto;" width="500" src="https://user-images.githubusercontent.com/46062972/134305807-1fee592f-2bcb-44a5-839e-ba9c79ddc3b6.png">

由于项目依赖一些腾讯云的服务，必须要配置的环境变量罗列如下：

```bash
DATABASE_PORT     = 数据库端口;

# 腾讯云控制台密钥管理 https://console.cloud.tencent.com/cam/capi
TC_SECRETID       = 腾讯云 SecretID;
TC_SECRETKEY      = 腾讯云 SecretKey;

# 腾讯云 SMS 短信服务（国内）文档：https://cloud.tencent.com/document/product/382/37745
TC_SMSSDKAPPID    = 腾讯云 SMS 短信服务 AppID;

# 腾讯云 对象存储入门文档：https://cloud.tencent.com/document/product/436/10199
TC_COSREGION      = 腾讯云 对象存储区域;
TC_COSBUCKET      = 腾讯云 对象存储桶名称;
```

🔧 添加好所有环境变量，大功告成，启动 Spring Boot 应用吧！

### 如何体验协同编辑

本地开发时，要想在自己的电脑上体验 Bib 的协同编辑功能，可以采用 Chrome 浏览器的访客模式。添加多个访客账号，并分别用这些账号打开多个 Chrome 浏览器窗口，登录不同的用户账号，即可体验协同编辑：

<img style="display: block; margin: 20px auto;" width="380" src="https://user-images.githubusercontent.com/46062972/134308377-36a1e9c2-3176-4c87-a428-6db5c26a703d.png">
