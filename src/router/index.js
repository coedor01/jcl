// 1.Dependency
import {
    createRouter,
    createWebHistory,
    // createWebHashHistory,
} from "vue-router";

// 2.Components
const HomePage = () => import("../views/HomePage.vue");

// 3.Routes
const routes = [{ path: "/", component: HomePage }];

// 4.Build An Instance
const router = createRouter({
    // history: createWebHashHistory(), //hash
    history: createWebHistory(), //history api
    base: "/jcl",
    routes,
});

export default router;
