<template>
    <div class="m-ac-card w-card-home">
        <p class="u-card-title">郑重声明</p>
        <div v-html="ac"></div>
    </div>
</template>

<script setup>
import { getBattleAc as _getBattleAc } from "@/services/helper";
import { ref, onMounted } from "vue";

const getBattleAc = () => {
    _getBattleAc().then((res) => {
        if (res.data?.code === 200) {
            ac.value = res.data.data.breadcrumb.html;
        }
    });
};

const ac = ref("");
onMounted(() => {
    getBattleAc();
});
</script>

<style lang="less" scoped></style>
