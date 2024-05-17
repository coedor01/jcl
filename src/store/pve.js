import { defineStore } from "pinia";

export const usePve = defineStore({
    id: "pve",
    state: () => ({
        mainTab: "overview", // 当前页面的主tab
        // overview
        statType: "damage", // 当前统计的类型，伤害/承伤/治疗/承疗/buff/喊话等
        timeRange: [0, 0], // 列表的时间范围
        focusEntities: [], // 全局总览选中的单位们

        // entity
        entityTab: "damage", // 单位详情tab
        entity: null, //当前统计的目标
        entityList: [], // 待选单位列表
        entityTimeRange: {}, // 单位详情的时间范围
        viewType: "effect", // 单位数值统计，根据目标/技能
        blameType: "buff_blame",
        effect: "", // 选中的技能效果
        effectLogs: [], // 选中的技能效果相关日志
        effectLog: null, // 选中的技能效果某个日志详情
        target: 0, // 选中的目标
        targetLogs: [], // 选中的目标相关日志
        targetLog: null, // 选中的目标某个日志详情
        selectedBuffs: [], // 选中的buff
        selectedSkills: {}, // 参与统计的技能
        selectedTimeline: {}, // 参与时间轴选项卡计算
        blame_death_detail: [],
        blame_death_buff: [],

        // compare
        compareMode: "damage", // 比较tab
        compareTimeRange: [0, 0], // 比较的时间范围
        compareEntity: [null, null], // 参与比较的单位
        comparePin: [], // 比较时置顶的技能

        // logs
        logs: [], // 日志列表
        logFilter: {
            hideReact: true,
            hideNoValue: false,
            timeRange: [-5, 0],
            keyword: null,
            hideKeyword: null,
            entities: [],
            selectOnlyName: true,
            selectOnlyNoSon: true,
            selectOnlyNoRepeat: true,
            onlySource: true,
            showTypes: ["say", "skill", "skillCast", "skillResult", "buff", "kill", "scene"],
        }, // 日志过滤器
        logAutoApply: false, // 自动应用过滤
        logDebug: false, // 日志调试模式
    }),
    getters: {},
    actions: {},
});
