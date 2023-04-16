<template>
    <div class="m-overview-focus" v-loading="loading">
        <div class="u-entity">
            <img class="u-entity-icon" :src="getMountIcon(entityID)" alt="" />
            <div class="u-entity-name">{{ getEntityName(entityID) }}</div>
            <el-button link class="u-close" @click="close">×</el-button>
        </div>
        <el-table class="u-table" :data="data" :border="false">
            <el-table-column label="招式" width="100" :align="'left'">
                <template #default="{ row }">{{ row.name }}</template>
            </el-table-column>
            <el-table-column prop="count" label="命中" width="80"></el-table-column>
            <el-table-column prop="criticalCount" label="会心" width="80"></el-table-column>
            <el-table-column label="占比" width="80">
                <template #default="{ row }">{{ displayPercent(row.rate) }}</template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, toRefs, watchPostEffect } from "vue";
import { getMountIcon, getEntityName } from "@/utils/common";
import { displayPercent } from "@/utils/commonNoStore";
import { usePve } from "@/store/pve";
import getWorkerResponse from "@/utils/worker";

const global = usePve();
// props
const props = defineProps({
    entityID: {
        type: Number,
        required: true,
    },
});
const { entityID } = toRefs(props);
const { statType, focusEntities } = toRefs(global);

const close = () => {
    focusEntities.value = focusEntities.value.filter((x) => {
        return x !== entityID.value;
    });
};
const loading = ref(false);
const data = ref([]);

const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_pve_overview_focus", {
        statType: statType.value,
        entityID: entityID.value,
    }).then((result) => {
        data.value = result;
        loading.value = false;
    });
};
watchPostEffect(updateData);
</script>

<style lang="less" scoped>
.m-overview-focus {
    background: #131517;
    border-radius: 20px;
    .size(380px, 380px);
    padding: 20px;
    .pr;
    .u-entity {
        display: flex;
        align-items: center;
        .u-entity-icon {
            .size(32px, 32px);
            .mr(6px);
        }
        .u-entity-name {
            .bold;
            flex-grow: 1;
            color: white;
        }
        .u-close {
            .fz(24px);
            .size(24px, 24px);
            color: #717273;
            &:hover {
                color: #fff;
            }
        }
    }

    .u-table {
        height: 340px;
        .mt(8px);
    }
}
</style>
