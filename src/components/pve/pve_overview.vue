<template>
    <div class="m-pve-overview">
        <div class="u-overview-charts">
            <div class="u-left">
                <div class="m-type-tabs">
                    <div
                        class="u-tab"
                        v-for="(tab, index) in tabs"
                        :key="index"
                        :class="{ 'is-active': statType == tab.name }"
                        @click="switchType(tab.name)"
                    >
                        <span>{{ tab.title }}</span>
                    </div>
                </div>
                <overview-chart></overview-chart>
            </div>
            <overview-pie></overview-pie>
        </div>
        <div class="u-overview-tables">
            <overview-list></overview-list>
            <el-scrollbar max-height="1000px">
                <div class="u-focus-list">
                    <TransitionGroup name="u-focus" tag="div">
                        <div class="u-focus-empty" v-if="focusEntities.length === 0">
                            <empty-guide
                                :rotate="-90"
                                :tips="['在左侧选择一个实体后', '此处会展示该实体的详细技能数']"
                            ></empty-guide>
                        </div>
                        <div class="u-focus" v-for="(entity, index) in focusEntities" :key="index">
                            <overview-focus :entityID="entity"></overview-focus>
                        </div>
                    </TransitionGroup>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup>
import OverviewChart from "./overview_chart.vue";
import OverviewPie from "./overview_pie.vue";
import OverviewList from "./overview_list.vue";
import OverviewFocus from "./overview_focus.vue";
import EmptyGuide from "@/components/common/empty_guide.vue";

import { toRefs } from "vue";
import { usePve } from "@/store/pve";

const { focusEntities, statType } = toRefs(usePve());

// tab切换相关逻辑
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
];
const switchType = (tab) => {
    if (tab === statType.value) return;
    focusEntities.value = [];
    statType.value = tab;
};
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
            .size(960px, 380px);

            .u-left-options {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .u-time {
                flex-grow: 1;
                display: flex;
                align-items: center;
                gap: 12px;
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

                    &.is-active {
                        color: #fff;
                        background-color: #0c759e;
                    }
                }
            }
        }
        height: 420px;
    }
    .u-overview-tables {
        height: 1000px;
        .u-focus-list {
            width: 100%;
            overflow-x: hidden;

            .u-focus-empty {
                .flex-center;
                .size(420px);
                .r(20px);
                background: #131517;
            }

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
