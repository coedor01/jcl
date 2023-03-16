<template>
    <div class="p-public">
        <div class="u-public-title">公开数据大厅</div>
        <div class="u-public-content">
            <div class="u-left">
                <data-list
                    :mine="false"
                    :enable-tab="true"
                    :enable-paginate="true"
                    :enable-search="true"
                    :show-more="false"
                    :page-size="10"
                ></data-list>
            </div>
            <div class="u-right">
                <div class="u-title">
                    <p class="u-colorful">数据大厅</p>
                    <p>各路豪杰的战斗记录</p>
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
    name: "PublicIndex",
});
</script>

<style lang="less">
@import "@/assets/css/views/public.less";
</style>
