<template>
    <div class="m-pve-compare">
        <div class="u-first-section">
            <compare-option></compare-option>
            <compare-chart></compare-chart>
        </div>
        <div class="u-second-section">
            <el-row :gutter="20">
                <el-col :span="12">
                    <compare-view :index="1"></compare-view>
                </el-col>
                <el-col :span="12">
                    <compare-view :index="2"></compare-view>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup>
import { toRefs, watch /* defineAsyncComponent */ } from "vue";
import { useRouter } from "vue-router";
import { usePve } from "@/store/pve";
import { useStore } from "@/store/index";

import CompareOption from "./compare_option.vue";
import CompareChart from "./compare_chart.vue";
import CompareView from "./compare_view.vue";
// const CompareOption = defineAsyncComponent(() => import("./compare_option.vue"));
// const CompareChart = defineAsyncComponent(() => import("./compare_chart.vue"));
// const CompareView = defineAsyncComponent(() => import("./compare_view.vue"));

const router = useRouter();
const store = useStore();
const { compareMode, compareEntity } = toRefs(usePve());
watch(
    [compareMode, compareEntity],
    () => {
        const id = store.info?.id;
        if (!id) return;
        const query = {
            id,
            tab: "compare",
        };
        if (compareMode.value) query.compareMode = compareMode.value;
        if (compareEntity.value[0]) query.entity1 = compareEntity.value[0];
        if (compareEntity.value[1]) query.entity2 = compareEntity.value[1];
        router.replace({ query });
    },
    { deep: true }
);
</script>

<style lang="less">
.m-pve-compare {
    .mt(20px);
    width: 1440px;

    .u-first-section {
        display: flex;
        gap: 20px;
    }

    .u-second-section {
        .mt(20px);
    }
}
</style>
