<template>
    <div class="p-jcl">
        <common-header></common-header>
        <router-view />
    </div>
</template>

<script>
import CommonHeader from "./components/common/common_header.vue";
export default {
    name: "App",
    components: { CommonHeader },
    data: function () {
        return {};
    },
};
</script>
