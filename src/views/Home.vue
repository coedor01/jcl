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
    name: "HomePage",
});
</script>

<style lang="less">
.p-home {
    .m-home {
        width: 1440px;
        margin: auto;
        padding-top: 197px;

        color: #fff;

        .u-hr {
            width: 1440px;
            margin: 60px auto 60px;
            border: 1px solid rgba(255, 255, 255);
            opacity: 10%;
        }
    }

    .m-big-battle {
        .flex-center;
        & > img {
            opacity: 0.3;
            width: 420px;
            height: 490px;
            display: block;
            margin: auto;
        }
    }
}
</style>
