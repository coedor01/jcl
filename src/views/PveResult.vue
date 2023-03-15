<template>
    <div class="p-pve-result">
        <pve-header></pve-header>
        <div class="m-pve-content">
            <component :is="mainComponents[mainTab]"></component>
        </div>
    </div>
</template>

<script setup>
import { toRefs, onMounted } from "vue";
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";
import { useRouter } from "vue-router";

import PveHeader from "@/components/pve/pve_header.vue";
import PveOverview from "@/components/pve/pve_overview.vue";
import PveEntity from "@/components/pve/pve_entity.vue";
import PveCompare from "@/components/pve/pve_compare.vue";
import PveLogs from "@/components/pve/pve_logs.vue";
import UploadCard from "@/components/upload_card.vue";

const store = useStore();
const router = useRouter();
const { mainTab } = toRefs(useGlobal());
// data
const mainComponents = {
    overview: PveOverview,
    detail: PveEntity,
    compare: PveCompare,
    logs: PveLogs,
    upload: UploadCard,
};

onMounted(() => {
    if (!store.result) {
        router.push({ name: "home" });
    }
});
</script>

<style lang="less">
.p-pve-result {
    .flex-center;
    flex-direction: column;

    .m-pve-content {
        .mb(80px);
    }
}
</style>
