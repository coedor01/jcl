<template>
    <div class="p-index">
        Index
        {{ client }}
        <img src="@/assets/img/test.png" style="width: 32px" />
        <img src="@/assets/img/test.svg" svg-inline style="width: 32px" />
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
