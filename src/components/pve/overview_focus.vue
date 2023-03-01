<template>
    <div class="m-overview-focus">
        <div class="u-entity">
            <img class="u-entity-icon" :src="getMountIcon(entityID)" alt="" />
            <div class="u-entity-name">{{ getEntityName(entityID) }}</div>
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
import { ref, toRefs, watch } from "vue";
import { getMountIcon, getEntityName, getResource, displayPercent } from "@/utils/common";
import { useStore } from "@/store";
const store = useStore();
// props
const props = defineProps({
    entityID: {
        type: Number,
        required: true,
    },
    statType: {
        type: String,
        required: true,
    },
});
const { entityID, statType } = toRefs(props);

const data = ref([]);

watch(
    [() => statType.value, () => entityID.value],
    () => {
        const source = store.result.stats?.[statType.value]?.[entityID.value]?.all?.details;
        if (!source) return [];
        let result = {};
        let total = 0;
        for (let log of source) {
            const key = log.effect;
            if (!result[key]) {
                const resource = getResource(key);
                const name = resource.name ?? resource.remark ?? key;
                result[key] = {
                    name,
                    value: 0,
                    count: 0,
                    criticalCount: 0,
                    rate: 0,
                };
            }
            total += log.value;
            result[key].count += 1;
            result[key].value += log.value;
            result[key].criticalCount += log.isCritical ? 1 : 0;
        }
        for (let key in result) {
            result[key].rate = (result[key].value / total) * 100;
        }
        data.value = Object.values(result);
        data.value.sort((a, b) => b.value - a.value);
    },
    { immediate: true }
);
</script>

<style lang="less" scoped>
.m-overview-focus {
    background: #131517;
    border-radius: 20px;
    .size(420px, 420px);
    padding: 20px;
    .u-entity {
        display: flex;
        align-items: center;
        .u-entity-icon {
            .size(32px, 32px);
            .mr(6px);
        }
        .u-entity-name {
            .bold;
            color: white;
        }
    }

    .u-table {
        height: 340px;
        .mt(8px);
    }
}
</style>
