// 1.Dependency
import { defineStore } from "pinia";

// 2.Create Store
export const useStore = defineStore({
    id: "store",
    state: () => ({
        client: location.pathname.includes("origin") ? "origin" : "std",

        subject: "",
        // 用户选择的文件
        file: "",
        // 读取文件解码后内容
        raw: "",

        // 数据库信息
        info: "",

        // 分析结果相关
        worker: "",
        result: "",
        // UI相关
    }),
    getters: {},
    actions: {},
});
