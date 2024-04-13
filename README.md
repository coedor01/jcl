# JCL

## 架构

一个 vue3 项目，基本都是使用 setup 语法的，可能跟传统 vue2 区别比较大。  
但是除了 vue 文件以外其他的地方基本还是跟 vue2 一样的。  
见 [vue3 文档](https://cn.vuejs.org/guide/introduction.html#api-styles): `Composition API`

### 项目文件结构

```plain
.
├── README.md             # 项目自述文件，部署步骤等需要声明
├── babel.config.js       # babel配置文件
├── jsconfig.json         # vscode或者其他IDE会使用到的配置文件
├── package-lock.json     # 依赖包版本lock文件，确保每次安装的依赖版本一致
├── package.json          # 包管理文件，包含项目依赖、脚本等信息
├── pnpm-lock.yaml        # 非官方的包管理器 pnpm 的 lock 文件，跟package-lock.json是一样的
├── public                # 静态资源，对vue项目来说基本不用动
├── setting.json          # 项目配置（实际上根本用不到）
├── src                   # 项目实际代码仓库
│   ├── App.vue           # 项目入口模板文件
│   ├── main.js           # 项目入口
│   ├── assets            # 会用到的资源，主要是样式表，图片，图标等
│   ├── components        # 组件模板
│   ├── router            # 前端路由配置
│   ├── services          # 接口调用相关
│   ├── store             # 状态管理
│   ├── utils             # 工具方法
│   └── views             # 主要的页面，也是vue模板，层级比components大一级
└── vue.config.js         # vue 项目配置，这里会配一些webpack以及vue入口之类的
```

### 前端结构

按照之前的设计前端会分成 PVE 和 PVP，侧重点不同。但是之前比较忙，现在也只搓了 PVE 的一部分，PVP 则是根本没动。

-   PVE
    -   战斗总览
    -   单位详情
    -   单位对比
    -   技能数/释放时间
    -   BUFF 覆盖
    -   详细日志
    -   首领分析（更有效率的时间轴，关键信息）
    -   第三方插件（比如分析奶秀上元覆盖率等可以由用户自己提供 `js` 代码操作的）
-   PVP
    -   装备查看
    -   战斗复盘（一个 2D 播放器的打算）`pixi.js WebGL`绘图的打算
    -   异常检测（比如秒打断等基本可以鉴挂的操作）
    -   关键技能时间轴（控制、大加、减伤等）
    -   详细日志

按照上面的模块对应 view 下的 Pvp.vue 和 Pvp.vue。  
具体的前端结构，则可以从 vue 模板的 import 来源一点一点往里面摸。

### 解析流程

主要内容在`utils/analyzer.js`最好是 O(n)的复杂度可以遍历完整个 jcl 文件，因为 jcl 文件可能会很大。比如一个 25 人的 yx 一场下来可能就上百 M，这个时候对用户的内容负担会比较大，以及会需要比较久的解析时间。 所以现在的实际是逐行读取慢慢更新数据的。当然不一定是最佳实现，有更好的想法随时更新。

### 解析器相关结构

> 下面是模板介绍，基本上魔盒的 vue3 项目都遵循这个模板  
> 但是不知道是不是最新的，因为 jcl 是挺久之前从模板生成的

## Vue3 Boilerplate

### 初始化

-   `package.json`修改 name 字段为项目标识名

### 静态资源

-   `.env`指定静态资源模式，`setting.json`指定静态资源路径
-   `.github/workflows`指定 oss 路径
-   配置 secrets：`ACCESS_TOKEN`，仓库写+包读取权限
-   配置 secrets：`ACCESSKEY_ID`和`ACCESS_KEY_SECRET`，oss 读写权限

### 私有包

-   `.github/workflows`指定包私有域`@org`
-   `.npmrc`修改`@org`为对应的组织名

### 其它

-   public/index.html 添加统计代码

### 开发

-   `npm install` 安装依赖
-   `npm run serve` 启动本地服务
-   `npm run build` 构建
