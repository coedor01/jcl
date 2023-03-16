<template>
    <div class="p-jcl">
        <common-header></common-header>
        <router-view />
        <nav-helper></nav-helper>
    </div>
</template>

<script>
import NavHelper from "@/components/nav_helper.vue";
import CommonHeader from "@/components/common/common_header.vue";
export default {
    name: "App",
    components: { CommonHeader, NavHelper },
    data: function () {
        return {};
    },
};
</script>
