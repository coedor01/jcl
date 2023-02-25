// 1.Dependency
import { defineStore } from "pinia";

// 2.Create Store
export const useStore = defineStore({
    id: "store",
    state: () => ({
        client: location.pathname.includes("origin") ? "origin" : "std",
        subject: "",
        // 原文件对象
        file: "",
        // 读取文件解码后内容
        raw: "",

        // 数据库信息
        info: {
            subject: "stat", //分析主题
            type: "tinymins", //文件数据类型
            file_name: "", //原始文件名称
            file_size: 0, //原始文件大小
            // 更多数据内部提取的重要信息
        },
        //当前查看的单页的数据
        current: "",
        // 统计分析tab
        type: "damage",
    }),
    getters: {},
    actions: {},
});
