<template>
    <div class="m-pve-overview">
        <div class="u-overview-charts">
            <div class="u-left">
                <type-tabs></type-tabs>
                <overview-chart></overview-chart>
            </div>
            <overview-pie></overview-pie>
        </div>
        <div class="u-overview-tables">
            <overview-list></overview-list>
            <el-scrollbar max-height="1000px">
                <div class="u-focus-list">
                    <TransitionGroup name="u-focus" tag="div">
                        <div class="u-focus" v-for="(entity, index) in focusEntities" :key="index">
                            <overview-focus :stat-type="statType" :entityID="entity"></overview-focus>
                        </div>
                    </TransitionGroup>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup>
import TypeTabs from "./type_tabs.vue";
import OverviewChart from "./overview_chart.vue";
import OverviewPie from "./overview_pie.vue";
import OverviewList from "./overview_list.vue";
import OverviewFocus from "./overview_focus.vue";

import { ref, provide } from "vue";
const statType = ref("damage");
const focusEntities = ref([]);

provide("statType", statType);
provide("focusEntities", focusEntities);
</script>

<style lang="less">
.m-pve-overview {
    display: flex;
    flex-direction: column;
    width: 1440px;

    & > div {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
    }

    .u-overview-charts {
        .u-left {
            display: flex;
            flex-direction: column;
            background: #131517;
            border-radius: 20px;
            padding: 20px;
            .size(1000px, 420px);
        }
        height: 420px;
    }
    .u-overview-tables {
        height: 1000px;
        .u-focus-list {
            width: 100%;
            overflow-x: hidden;

            .u-focus:not(:first-of-type) {
                margin-top: 20px;
            }

            .u-focus-move,
            .u-focus-enter-active,
            .u-focus-leave-active {
                transition: all 0.5s ease;
            }

            .u-focus-enter-from,
            .u-focus-leave-to {
                opacity: 0;
                transform: translateX(30px);
            }
        }
    }
}
</style>
