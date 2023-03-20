<template>
    <div class="m-entity-tabs">
        <el-scrollbar width="100%">
            <div class="w-tabs">
                <div
                    class="u-tab"
                    v-for="(id, index) in entityList"
                    :key="index"
                    :class="{ 'is-active': id === entity }"
                    @click="switchEntity(id)"
                >
                    {{ getEntityName(id) }}
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { usePve } from "@/store/pve";
import { getEntityName } from "@/utils/common";
import { toRefs } from "vue";

const { entityList, entity } = toRefs(usePve());

const switchEntity = (id) => {
    if (entity.value === id) return;
    entity.value = id;
};
</script>

<style lang="less" scoped>
.m-entity-tabs {
    .mb(20px);
    height: 48px;

    .w-tabs {
        display: flex;
        white-space: nowrap;
    }
}
</style>
