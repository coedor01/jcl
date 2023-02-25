<template>
    <jcl-header></jcl-header>
    <router-view />
</template>

<script>
import JclHeader from "./components/common/jcl_header.vue";
export default {
    name: "App",
    props: [],
    components: { JclHeader },
    data: function () {
        return {};
    },
    computed: {},
    watch: {},
    methods: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style lang="less">
@import "@/assets/css/app.less";
</style>
