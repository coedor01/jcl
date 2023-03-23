<template>
    <div class="p-jcl">
        <jcl-header></jcl-header>
        <router-view />
        <nav-helper></nav-helper>
        <Footer></Footer>
    </div>
</template>

<script>
import NavHelper from "@/components/nav_helper.vue";
import JclHeader from "@/components/header/jcl_header.vue";
export default {
    name: "App",
    components: { JclHeader, NavHelper },
    data: function () {
        return {};
    },
};
</script>
