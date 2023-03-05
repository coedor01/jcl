import { defineStore } from "pinia";

export const useGlobal = defineStore({
    id: "global",
    state: () => ({
        mainTab: "overview", // 当前页面的主tab
        statType: "damage", // 当前统计的类型，伤害/承伤/治疗/承疗/buff/喊话等
        // 当前选中的单位们
        focusEntities: [],

        // === 单位详情
        entity: 0, //当前统计的目标
        entityList: [], // 待选单位列表
        currentWindow: null, // 当前统计窗口
        viewType: "effect", // 单位数值统计，根据目标/技能
        effect: "",
        target: 0,
        logs: [], // 单位数值相关日志
        log: null, // 单位某个日志详情
    }),
    getters: {},
    actions: {},
});
