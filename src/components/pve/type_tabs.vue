<template>
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
</template>

<script setup>
import { toRefs, computed } from "vue";
import { useGlobal } from "@/store/global";

const global = useGlobal();
const { statType } = toRefs(global);
const props = defineProps({
    extra: {
        type: Boolean,
        default: false,
    },
});
const { extra } = toRefs(props);

const baseTabs = [
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
const extraTabs = [
    {
        name: "buff",
        title: "BUFF分析",
    },
    {
        name: "skill",
        title: "技能分析",
    },
];

const tabs = computed(() => {
    if (extra.value) {
        return [...baseTabs, ...extraTabs];
    }
    return baseTabs;
});

const switchType = (tab) => {
    if (tab === statType.value) return;
    statType.value = tab;
};
</script>

<style lang="less" scoped>
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

        &.is-active {
            color: #fff;
            background-color: #0c759e;
        }
    }
}
</style>
