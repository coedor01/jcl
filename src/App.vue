<template>
    <el-scrollbar height="100vh" class="v-app">
        <jcl-header></jcl-header>
        <router-view />
    </el-scrollbar>
</template>

<script>
import JclHeader from "./components/jcl_header.vue";
export default {
    name: "App",
    components: { JclHeader },
    data: function () {
        return {};
    },
};
</script>

<style lang="less">
@import "@/assets/css/app.less";
</style>
