<template>
    <div class="m-pve-result">
        <pve-header></pve-header>
        <div class="m-pve-content">
            <component :is="mainComponents[mainTab]"></component>
        </div>
    </div>
</template>

<script setup>
import { ref, provide, onMounted } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";

import PveHeader from "@/components/pve/pve_header.vue";
import PveOverview from "@/components/pve/pve_overview.vue";
import PveEntity from "@/components/pve/pve_entity.vue";

const store = useStore();
const router = useRouter();
// data
const mainTab = ref("overview");
const mainComponents = {
    overview: PveOverview,
    detail: PveEntity,
};
provide("mainTab", mainTab);

onMounted(() => {
    if (!store.result) {
        router.push({ name: "home" });
    }
});
</script>

<style lang="less" scoped>
.m-pve-result {
    .flex-center;
    flex-direction: column;

    .m-pve-content {
        .mb(80px);
    }
}
</style>
