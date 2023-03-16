<template>
    <div class="p-activity">
        <div class="m-activity-null">暂时还没有任何活动</div>
        <nav-helper></nav-helper>
    </div>
</template>

<script setup>
import NavHelper from "@/components/nav_helper.vue";
import { defineComponent } from "vue";

defineComponent({
    name: "ActivityIndex",
});
</script>

<style lang="less">
@import "@/assets/css/views/activity.less";
</style>
