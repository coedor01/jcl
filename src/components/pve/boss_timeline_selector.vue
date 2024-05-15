<template>
    <div class="m-entity-skill-timeline w-card">
        <div class="w-card-title">
            <span class="u-title">技能释放时间轴</span>
            <el-radio-group v-model.number="linetime" size="small">
                <el-radio-button :value="15">每行15s</el-radio-button>
                <el-radio-button :value="30">每行30s</el-radio-button>
                <el-radio-button :value="45">每行45s</el-radio-button>
                <el-radio-button :value="60">每行60s</el-radio-button>
            </el-radio-group>
            <div class="u-setting-trigger">
                <el-icon><Setting /></el-icon>
                选择绘制的内容
                <timeline-selector class="u-setting-popper"></timeline-selector>
            </div>
        </div>
        <div class="u-canvas-wrapper">
            <canvas-timeline :data="data" :time="time" :linetime="linetime"></canvas-timeline>
        </div>
    </div>
</template>

<script setup>
import TimelineSelector from "../pve/timeline_selector";
import CanvasTimeline from "../common/canvas_timeline.vue";

import { computed, toRefs, ref } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { getResource } from "@/utils/common";

const store = useStore();
const { end } = store.result;
const { selectedTimeline } = toRefs(usePve());
const time = computed(() => end.sec + 10);
const linetime = ref(15);
const data = computed(() => {
    const source = store.result.time_line_result;
    if (!source) return [];
    const result = [];
    const idNameMap = {};
    for (let log of source.skills) {
        const key = `${log.skill_id}_${log.skill_level}`;
        if (!idNameMap[key]) {
            const name = getResource("skill:" + key).name;
            if (!name) continue;
            idNameMap[key] = name;
        }
        let name = idNameMap[key];
        let short_name = name;
        // 是否显示
        const skill_key = "skill:" + name;
        const current_timeline = selectedTimeline.value[skill_key];
        if (!current_timeline || !current_timeline.stat.includes("select")) continue;
        if (name.length > 5) short_name = name.charAt(0) + ".." + name.charAt(name.length - 1);
        result.push({
            content: short_name,
            time: log.time,
            extra: {
                tooltip: {
                    技能: name,
                    释放者模板ID: log.templateID,
                    释放者名称: log.name,
                    技能ID: log.skill_id,
                    等级: log.skill_level,
                    施放时间: log.time.toFixed(2) + "s",
                },
                color: current_timeline.color,
            },
        });
    }
    // 喊话部分
    for (let [k, v] of Object.entries(store.result.say)) {
        // 仅处理非系统喊话
        if (k != "_system") {
            const name = store.result.entities[k].name;
            const templateID = store.result.entities[k].templateID;
            for (let value of v) {
                const say_key = "say:" + value.content;
                const current_timeline = selectedTimeline.value[say_key];
                if (!current_timeline || !current_timeline.stat.includes("select")) continue;
                result.push({
                    content: name + "喊话",
                    time: value.time,
                    extra: {
                        tooltip: {
                            内容: value.content,
                            释放者模板ID: templateID,
                            释放者名称: name,
                            施放时间: value.time.toFixed(2) + "s",
                        },
                        color: current_timeline.color,
                    },
                });
            }
        }
    }

    // 模板类部分
    for (let [k, v] of Object.entries(source.templates)) {
        for (let value of v) {
            const template_key = "template:" + value.name;
            const current_timeline = selectedTimeline.value[template_key];
            if (!current_timeline || !current_timeline.stat.includes("select")) continue;
            result.push({
                content: value.name,
                time: value.time,
                extra: {
                    tooltip: {
                        名称: value.name,
                        模板ID: k,
                        数量: value.count,
                        出现时间: value.time.toFixed(2) + "s",
                    },
                    color: current_timeline.color,
                },
            });
        }
    }

    result.unshift({
        extra: {
            tooltip: {
                事件: "战斗开始",
            },
            color: "#ffffff",
        },
        content: "战斗开始",
        time: 0,
    });
    result.push({
        extra: {
            tooltip: {
                事件: "战斗结束",
            },
            color: "#ffffff",
        },
        content: "战斗结束",
        time: end.sec ?? result[result.length - 1].time + 2,
    });

    return result;
});
</script>

<style lang="less">
.m-pve-entity {
    .mt(20px);
    width: 1440px;

    .u-first-section {
        height: 480px;
        display: flex;
        gap: 20px;
    }
    .u-second-section {
        .mt(20px);

        .w-tabs {
            .mb(20px);
        }
    }

    .u-first-section > .u-right {
        display: flex;
        flex-direction: column;
        width: 1060px;
        height: 480px;

        & > .w-card {
            flex-grow: 1;
            display: flex;
            gap: 20px;
        }
    }

    .m-type-tabs {
        display: flex;
        align-items: center;
        gap: 20px;
        .u-tab {
            .x;
            .fz(14px, 40px);
            .size(110px, 40px);
            cursor: pointer;
            border-radius: 20px;
            color: #fff;
            background-color: #252525;
            transition: all 0.3s ease-in-out;
        }

        .u-tab.is-active {
            color: #fff;
            background-color: #0c759e;
        }
    }
}
</style>
