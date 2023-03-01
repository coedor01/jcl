<template>
    <div class="m-overview-tabs">
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
</template>

<script setup>
import { inject } from "vue";
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

const statType = inject("statType");
const switchType = (tab) => {
    if (tab === statType.value) return;
    statType.value = tab;
};
</script>

<style lang="less" scoped>
.m-overview-tabs {
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
        opacity: 0.5;
        transition: all 0.3s ease-in-out;

        &.is-active {
            opacity: 1;
            color: #fff;
            background-color: #0c759e;
        }
    }
}
</style>
