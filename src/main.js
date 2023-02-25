// 1.Create APP
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);

// 2.Components
import { createHead } from "@vueuse/head";
const head = createHead();
app.use(head);

// 路由
import router from "./router/index";
app.use(router);

// 状态管理
import { createPinia } from "pinia";
app.use(createPinia());

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";

app.use(ElementPlus, {
    locale: zhCn,
});

// 3.Mount DOM
app.mount("#app");
