<template>
    <div class="m-entity-select">
        <div class="w-card u-filters">
            <div class="w-card-title">筛选器</div>
            <div class="w-tabs">
                <div
                    class="u-tab"
                    v-for="(filter, index) in filterList"
                    :key="index"
                    :class="{ 'is-active': filters.includes(filter.name) }"
                    @click="switchFilter(filter.name)"
                >
                    {{ filter.title }}
                </div>
            </div>
        </div>
        <div class="w-card u-select">
            <div class="w-card-title">单位列表</div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const filters = ref([]);
const filterList = [
    {
        name: "hideBelong",
        title: "隐藏有归属的单位",
    },
    {
        name: "hideNoName",
        title: "隐藏无名单位",
    },
    {
        name: "showNPC",
        title: "NPC",
    },
    {
        name: "showPlayer",
        title: "玩家",
    },
    {
        name: "hideSameTemplate",
        title: "隐藏同模板单位",
    },
];

const switchFilter = (filter) => {
    if (filters.value.includes(filter)) {
        filters.value = filters.value.filter((f) => f !== filter);
    } else {
        filters.value.push(filter);
    }
};
</script>

<style lang="less" scoped>
.m-entity-select {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 20px;
    width: 360px;

    .w-tabs {
        display: flex;
        flex-wrap: wrap;
        .mt(10px);
        .mb(-10px);

        .u-tab {
            .mb(10px);
        }
    }

    .u-select {
        flex-grow: 1;
    }
}
</style>
