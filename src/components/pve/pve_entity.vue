<template>
    <div class="m-pve-entity">
        <div class="u-first-section">
            <!-- 左上角筛选单位/将单位加入候选列表的部分 -->
            <entity-select></entity-select>
            <div class="u-right">
                <!-- 候选列表，切换当前选择单位的组件 -->
                <entity-tabs></entity-tabs>
                <div class="w-card">
                    <!-- 切换伤害/治疗组件 -->
                    <type-tabs :extra="true"></type-tabs>
                    <!-- 单位图表以及总览 -->
                    <entity-chart></entity-chart>
                </div>
            </div>
        </div>
        <div class="u-second-section">
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
        </div>
    </div>
</template>

<script setup>
import { toRefs } from "vue";
import { useGlobal } from "@/store/global";

import TypeTabs from "./type_tabs.vue";
import EntityTabs from "./entity_tabs.vue";
import EntitySelect from "./entity_select.vue";
import EntityChart from "./entity_chart.vue";
import EntityViewSkill from "./entity_view_effect.vue";
import EntityViewTarget from "./entity_view_target.vue";

const typeComponent = {
    effect: EntityViewSkill,
    target: EntityViewTarget,
};
const { viewType } = toRefs(useGlobal());
</script>

<style lang="less">
.m-pve-entity {
    .mt(20px);
    width: 1440px;

    .u-first-section {
        height: 480px;
        display: flex;
        gap: 20px;

        .u-right {
            display: flex;
            flex-direction: column;
            width: 1060px;
            height: 480px;

            & > .w-card {
                flex-grow: 1;
                gap: 0;
            }
        }
    }
    .u-second-section {
        .mt(20px);

        .w-tabs {
            .mb(20px);
        }
    }
}
</style>
