<template>
    <div class="m-pve-entity">
        <div class="u-first-section">
            <!-- 左上角筛选单位/将单位加入候选列表的部分 -->
            <entity-select></entity-select>
            <div class="u-right">
                <!-- 候选列表，切换当前选择单位的组件 -->
                <entity-tabs></entity-tabs>
                <div class="u-right-bottom">
                    <div class="w-card">
                        <!-- 切换伤害/治疗/BUFF分析 -->
                        <div class="m-type-tabs">
                            <div
                                class="u-tab"
                                v-for="(tab, index) in tabs"
                                :key="index"
                                :class="{ 'is-active': entityTab == tab.name }"
                                @click="switchTab(tab.name)"
                            >
                                <span>{{ tab.title }}</span>
                            </div>
                        </div>
                        <template v-if="entityTab === 'buff'">
                            <entity-buff-table></entity-buff-table>
                        </template>
                        <template v-else-if="entityTab === 'skill'">
                            <entity-skill-chart></entity-skill-chart>
                        </template>
                        <template v-else>
                            <!-- 单位图表以及总览 -->
                            <entity-chart></entity-chart>
                        </template>
                    </div>
                    <entity-skill-filter v-if="entityTab === 'skill'"></entity-skill-filter>
                </div>
            </div>
        </div>
        <div class="u-second-section">
            <template v-if="entityTab === 'buff'">
                <!-- BUFF时间轴 -->
                <entity-buff-chart></entity-buff-chart>
            </template>
            <template v-else-if="entityTab === 'skill'">
                <!-- BUFF时间轴 -->
                <entity-skill-timeline></entity-skill-timeline>
            </template>
            <template v-else>
                <!-- 技能详情统计方式切换 -->
                <div class="w-tabs">
                    <div class="u-tab" :class="{ 'is-active': viewType == 'effect' }" @click="viewType = 'effect'">
                        按技能显示
                    </div>
                    <div class="u-tab" :class="{ 'is-active': viewType == 'target' }" @click="viewType = 'target'">
                        按目标显示
                    </div>
                </div>
                <!-- 下面的面板 -->
                <keep-alive>
                    <component :is="typeComponent[viewType]"></component>
                </keep-alive>
            </template>
        </div>
    </div>
</template>

<script setup>
import { toRefs } from "vue";
import { useGlobal } from "@/store/global";

import EntityTabs from "./entity_tabs.vue";
import EntitySelect from "./entity_select.vue";
import EntityChart from "./entity_view_chart.vue";
import EntityViewSkill from "./entity_view_effect.vue";
import EntityViewTarget from "./entity_view_target.vue";
import EntityBuffTable from "./entity_buff_table.vue";
import EntityBuffChart from "./entity_buff_chart.vue";
import EntitySkillChart from "./entity_skill_chart.vue";
import EntitySkillTimeline from "./entity_skill_timeline.vue";
import EntitySkillFilter from "./entity_skill_filter.vue";

const typeComponent = {
    effect: EntityViewSkill,
    target: EntityViewTarget,
};
const { viewType, entityTab } = toRefs(useGlobal());

const tabs = [
    {
        name: "damage",
        title: "伤害总览",
    },
    {
        name: "treat",
        title: "治疗总览",
    },
    {
        name: "beDamaged",
        title: "承伤总览",
    },
    {
        name: "beTreated",
        title: "承疗总览",
    },
    {
        name: "buff",
        title: "BUFF分析",
    },
    {
        name: "skill",
        title: "技能分析",
    },
    {
        name: "say",
        title: "喊话分析",
    },
    {
        name: "scene",
        title: "场景分析",
    },
];
const switchTab = (tab) => {
    if (tab === entityTab.value) return;
    entityTab.value = tab;
};
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
    }

    .u-right-bottom {
        flex-grow: 1;
        display: flex;
        gap: 20px;

        & > .w-card:first-of-type {
            flex-grow: 1;
            gap: 10px;
            min-width: 0;
        }
    }

    .m-type-tabs {
        display: flex;
        align-items: center;
        gap: 20px;
        .u-tab {
            .x(center);
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
