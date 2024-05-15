<template>
    <div class="p-pve-result">
        <pve-header></pve-header>
        <div class="m-pve-content">
            <component :is="mainComponents[mainTab]"></component>
        </div>
        <div class="u-comment-area" v-if="!!store.info.id">
            <Thx
                class="m-thx"
                mode="dark"
                :postId="store.info.id"
                postType="battle"
                :postTitle="store.info.title"
                :adminBoxcoinEnable="true"
                :userBoxcoinEnable="true"
            />
            <Comment class="m-comment" mode="dark" :id="store.info.id" category="battle" />
        </div>
    </div>
</template>

<script setup>
import { toRefs, onMounted, defineComponent, watchPostEffect } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { useRouter } from "vue-router";

import PveHeader from "@/components/pve/pve_header.vue";
import PveOverview from "@/components/pve/pve_overview.vue";
import PveEntity from "@/components/pve/pve_entity.vue";
import PveCompare from "@/components/pve/pve_compare.vue";
import PveLogs from "@/components/pve/pve_logs.vue";
import UploadCard from "@/components/upload_card.vue";
import VideoCard from "@/components/video_card.vue";
import BossTimeLine from "@/components/pve/boss_timeline_selector.vue";

import Thx from "@jx3box/jx3box-vue3-ui/src/single/Thx.vue";
import Comment from "@jx3box/jx3box-vue3-ui/src/single/Comment.vue";

const store = useStore();
const router = useRouter();
const { mainTab, statType, focusEntities, entityTab, viewType, entityList, entity, compareMode, compareEntity } =
    toRefs(usePve());

// data
const mainComponents = {
    overview: PveOverview,
    detail: PveEntity,
    // blame: PveEntity, // TODO:这部分还没写，随便找个界面先跑
    time_line: BossTimeLine,
    compare: PveCompare,
    logs: PveLogs,
    upload: UploadCard,
    video: VideoCard,
};

onMounted(() => {
    const query = router.currentRoute.value.query;
    // 初始化，带着结果来的，如果有路由
    if (store.result) {
        if (query.tab) mainTab.value = query.tab;
        if (query.statType) statType.value = query.statType;
        if (query.focusEntities) focusEntities.value = query.entity.split(",").map(Number);
        if (query.entityTab) entityTab.value = query.entityTab;
        if (query.viewType) viewType.value = query.viewType;
        if (query.entity) {
            if (!entityList.value.includes(query.entity)) entityList.value.push(Number(query.entity));
            entity.value = Number(query.entity);
        }
        if (query.compareMode) compareMode.value = query.compareMode;
        if (query.entity1 || query.entity2) compareEntity.value = [Number(query.entity1), Number(query.entity2)];
        return;
    }
    // 初始化的时候，没有结果，但是带了ID，带着query跳去view
    if (query.id) {
        router.push({ name: "view", query });
        return;
    }
    // 没有id，跳回home
    router.push({ name: "home" });
});
// 用户切换各种tab、选择玩家的时候修改路由
watchPostEffect(() => {
    const id = store.info?.id;
    if (!id) return;
    const query = {
        id,
        tab: mainTab.value,
    };
    if (mainTab.value === "overview") {
        if (statType.value) query.statType = statType.value;
        if (focusEntities.value.length) query.entity = focusEntities.value.join(",");
    }
    if (mainTab.value === "detail") {
        if (entityTab.value) query.entityTab = entityTab.value;
        if (viewType.value) query.viewType = viewType.value;
        if (entity.value) query.entity = entity.value;
    }
    if (mainTab.value === "compare") {
        if (compareMode.value) query.compareMode = compareMode.value;
        if (compareEntity.value[0]) query.entity1 = compareEntity.value[0];
        if (compareEntity.value[1]) query.entity2 = compareEntity.value[1];
    }
    router.replace({ query });
});

defineComponent({
    name: "PveIndex",
});
</script>

<style lang="less">
@import "@/assets/css/views/pve.less";
</style>
