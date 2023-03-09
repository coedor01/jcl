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
import CompareOption from "./compare_option.vue";
import CompareChart from "./compare_chart.vue";
import CompareView from "./compare_view.vue";
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
