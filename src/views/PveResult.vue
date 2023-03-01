<template>
    <div class="m-pve-result">
        <pve-header @switch="switchTab"></pve-header>
        <div class="m-pve-content">
            <keep-alive>
                <component :is="mainComponents[mainTab]"></component>
            </keep-alive>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

import PveHeader from "@/components/pve/pve_header.vue";
import PveOverview from "@/components/pve/pve_overview.vue";
// data
const mainTab = ref("overview");
const mainComponents = {
    overview: PveOverview,
};
//methods
const switchTab = (tab) => {
    mainTab.value = tab;
};
</script>

<style lang="less" scoped>
.m-pve-result {
    .flex-center;
    flex-direction: column;

    .m-pve-content {
        padding-bottom: 40px;
    }
}
</style>
