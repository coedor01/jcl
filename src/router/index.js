// 1.Dependency
import {
    createRouter,
    createWebHistory,
    // createWebHashHistory,
} from "vue-router";

// 2.Routes
const routes = [
    { name: "home", path: "/", component: () => import("@/views/HomePage.vue") },
    { name: "pve", path: "/pve", component: () => import("@/views/PveResult.vue") },
    { name: "pvp", path: "/pvp", component: () => import("@/views/PvpResult.vue") },
    { name: "activity", path: "/activity", component: () => import("@/views/Activity.vue") },
    { name: "rank", path: "/rank", component: () => import("@/views/Rank.vue") },
    { name: "analysis", path: "/analysis", component: () => import("@/views/Analysis.vue") },
    { name: "mine", path: "/mine", component: () => import("@/views/Mine.vue") },
    { name: "public", path: "/public", component: () => import("@/views/Public.vue") },
];

// 3.Build An Instance
const router = createRouter({
    history: createWebHistory(), //history api
    base: "/jcl",
    routes,
});

export default router;
