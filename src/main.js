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

// element-plus
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "@/assets/css/element-override.less";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// echarts相关
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart, CustomChart } from "echarts/charts";
import { TooltipComponent, LegendComponent, GridComponent, DataZoomComponent } from "echarts/components";
use([
    CanvasRenderer,
    LineChart,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DataZoomComponent,
    BarChart,
    CustomChart,
]);

app.use(ElementPlus, {
    locale: zhCn,
});

// jx3box-vue3-ui
import { install } from "@jx3box/jx3box-vue3-ui";
install(app);

import "@/assets/css/app.less";
// 3.Mount DOM
app.mount("#app");
