<template>
    <div class="p-index">
        Index
        {{ client }}
    </div>
</template>
<script>
import { mapState } from "pinia";
import { useStore } from "@/store";
export default {
    name: "IndexPage",
    props: [],
    data: function () {
        return {};
    },
    computed: {
        ...mapState(useStore, ["client"]),
    },
    methods: {},
    created: function () {},
    components: {},
};
</script>

<style scoped lang="less">
@import "@/assets/css/index.less";
</style>
