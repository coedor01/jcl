<template>
    <div class="p-home">
        <div class="m-home">
            <home-slogan></home-slogan>
            <hr class="u-hr" />
            <file-select></file-select>
            <hr class="u-hr" />
            <data-view></data-view>
        </div>
        <div class="m-big-battle">
            <img src="@/assets/img/battle.svg" alt="" />
        </div>
        <nav-helper></nav-helper>
    </div>
</template>

<script setup>
import { defineComponent } from "vue";
import NavHelper from "@/components/nav_helper.vue";
import HomeSlogan from "@/components/home/home_slogan.vue";
import FileSelect from "@/components/home/subject_list.vue";
import DataView from "@/components/home/data_view.vue";

defineComponent({
    name: "HomeIndex",
});
</script>

<style lang="less">
@import "@/assets/css/views/home.less";
</style>
