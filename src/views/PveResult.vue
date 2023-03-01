<template>
    <div class="m-pve-result">
        <pve-header @switch="switchTab"></pve-header>
    </div>
</template>

<script setup>
import { ref } from "vue";

import PveHeader from "@/components/pve/pve_header.vue";

// data
const mainTab = ref("overview");

//methods
const switchTab = (tab) => {
    mainTab.value = tab;
};
</script>

<style lang="less" scoped>
.m-pve-result {
    .flex-center;
    flex-direction: column;
}
</style>
