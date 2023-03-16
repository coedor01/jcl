<template>
    <div class="p-mine">
        <div class="u-mine-title">我的数据</div>
        <div class="u-mine-content">
            <div class="u-left">
                <data-list
                    :mine="true"
                    :enable-tab="false"
                    :enable-paginate="true"
                    :enable-search="true"
                    :show-more="false"
                ></data-list>
            </div>
            <div class="u-right">
                <div class="u-title">
                    <p class="u-colorful">我的数据</p>
                    <p>刻骨铭心的战斗回忆</p>
                </div>
                <ac-card></ac-card>
                <jba-card></jba-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import AcCard from "@/components/list/ac_card.vue";
import JbaCard from "@/components/list/jba_card.vue";
import DataList from "@/components/list/data_list.vue";

import { defineComponent } from "vue";

defineComponent({
    name: "MineIndex",
});
</script>

<style lang="less">
@import "@/assets/css/views/mine.less";
</style>
