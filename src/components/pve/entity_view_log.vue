<template>
    <div class="m-entity-skill-log w-card">
        <div v-if="target" class="w-card-title">目标为 {{ titleName }} 的技能列表</div>
        <div v-else-if="effect" class="w-card-title">招式 {{ titleName }} 的结算记录</div>
        <div v-else class="w-card-title">-</div>
        <el-table class="u-table" :data="currentData" :border="false" :row-class-name="rowClass" @row-click="selectLog">
            <el-table-column prop="index" label="#" align="center" :width="columnWidth[0]"></el-table-column>
            <el-table-column label="时间" :width="columnWidth[1]">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.micro / 1000) + "s" }}</span>
                </template>
            </el-table-column>
            <el-table-column v-if="viewType === 'target'" label="图标" align="center" :width="columnWidth[2]">
                <template #default="{ row }">
                    <div class="u-effect-icon">
                        <img :src="getResourceIcon(row.effect)" alt="" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column v-if="viewType === 'effect'" label="目标" :width="columnWidth[2]">
                <template #default="{ row }">
                    <span>{{ getEntityName(row.target) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="招式" :width="columnWidth[3]">
                <template #default="{ row }">
                    <span>{{ getResourceName(row.effect, { showID: true }) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="实际数值" :width="columnWidth[4]">
                <template #default="{ row }">
                    <span>{{ row.value }}</span>
                </template>
            </el-table-column>
            <el-table-column label="会心" :width="columnWidth[5]">
                <template #default="{ row }">
                    <span>{{ row.isCritical ? "会心" : "-" }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            class="w-pagination"
            small
            background
            layout="pager"
            :page-size="pageSize"
            :total="total"
            :hide-on-single-page="true"
            :current-page="currentPage"
            @update:currentPage="currentPage = $event"
        ></el-pagination>
    </div>
</template>

<script setup>
import { getResource, getEntityName, displayDigits, getResourceIcon, getResourceName } from "@/utils/common";
import { computed, toRefs } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
import { useGlobal } from "@/store/global";
// data
const { viewType, target, effect, logs, log: detail } = toRefs(useGlobal());

// computed
const titleName = computed(() => {
    if (viewType.value === "target") {
        return `${getEntityName(target.value)}`;
    } else if (viewType.value === "effect") {
        const resource = getResource(effect.value);
        return `${resource.name ?? resource.remark}`;
    } else return "";
});
const data = computed(() => {
    if (!logs.value) return [];
    let index = 0;
    for (let log of logs.value) {
        log.index = ++index;
    }
    return logs.value;
});
const pageSize = computed(() => {
    if (viewType.value === "target") return 25;
    return 11;
});
const columnWidth = computed(() => {
    if (viewType.value === "target") return [48, 60, 36, 240, 112, 64];
    return [42, 54, 120, 120, 90, 36];
});
const { total, currentPage, currentData } = usePaginate(data, { pageSize: pageSize.value });

const selectLog = (row) => {
    detail.value = row;
};
const rowClass = ({ row }) => {
    if (row.index === detail.value?.index) return "is-focus";
};
</script>

<style lang="less" scoped>
.m-entity-skill-log {
    height: 100%;

    .u-effect-icon {
        .size(18px);
        .db;
        margin: auto;
    }

    .u-table {
        flex-grow: 1;
    }
}
</style>
