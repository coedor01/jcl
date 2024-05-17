<template>
    <div class="m-pve-entity">
        <div class="u-first-section">
            <!-- 左上角筛选单位/将单位加入候选列表的部分 -->
            <BlameEntitySelector></BlameEntitySelector>
            <div class="u-right">
                <!-- 候选列表，切换当前选择单位的组件 -->
                <entity-tabs></entity-tabs>
                <div class="u-second-section">
                    <template v-if="entityTab">
                        <!-- 技能详情统计方式切换 -->
                        <div class="w-tabs">
                            <div
                                class="u-tab"
                                :class="{ 'is-active': viewType == 'target' }"
                                @click="viewType = 'target'"
                            >
                                按目标显示
                            </div>
                        </div>
                        <keep-alive>
                            <component :is="typeComponent[viewType]"></component>
                        </keep-alive>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toRefs } from "vue";
import { usePve } from "@/store/pve";

import EntityTabs from "./entity_tabs.vue";
import BlameEntitySelector from "./blame_entity_selector.vue";

import BlameDeathCard from "./blame_death_card.vue";

const typeComponent = {
    target: BlameDeathCard,
};
const { viewType, entityTab } = toRefs(usePve());
viewType.value = "target";
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
