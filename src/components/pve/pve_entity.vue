<template>
    <div class="m-pve-entity">
        <div class="u-first-section">
            <entity-select></entity-select>
            <div class="u-right">
                <entity-tabs></entity-tabs>
                <div class="w-card">
                    <type-tabs></type-tabs>
                    <entity-chart></entity-chart>
                </div>
            </div>
        </div>
        <div class="u-second-section">
            <div class="w-tabs">
                <div class="u-tab" :class="{ 'is-active': viewType == 'skill' }" @click="viewType = 'skill'">
                    按技能显示
                </div>
                <div class="u-tab" :class="{ 'is-active': viewType == 'target' }" @click="viewType = 'target'">
                    按目标显示
                </div>
            </div>
            <keep-alive>
                <component :is="typeComponent[viewType]"></component>
            </keep-alive>
        </div>
    </div>
</template>

<script setup>
import { provide, ref } from "vue";

import TypeTabs from "./type_tabs.vue";
import EntityTabs from "./entity_tabs.vue";
import EntitySelect from "./entity_select.vue";
import EntityChart from "./entity_chart.vue";
import EntityViewSkill from "./entity_view_skill.vue";
import EntityViewTarget from "./entity_view_target.vue";

const typeComponent = {
    skill: EntityViewSkill,
    target: EntityViewTarget,
};
const statType = ref("damage");
const viewType = ref("skill");
provide("statType", statType);
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
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            width: 1060px;

            & > .w-card {
                flex-grow: 1;
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
