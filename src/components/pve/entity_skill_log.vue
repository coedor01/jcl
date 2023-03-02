<template>
    <div class="m-entity-skill-log w-card">
        <div v-if="target" class="w-card-title">目标为 {{ titleName }} 的技能列表</div>
        <div v-else-if="effect" class="w-card-title">招式 {{ titleName }} 的结算记录</div>
        <div v-else class="w-card-title">-</div>
        <el-table class="u-table" :data="currentData" :border="false" :row-class-name="rowClass" @row-click="selectLog">
            <el-table-column prop="index" label="#" width="36" align="center"></el-table-column>
            <el-table-column label="时间" width="60">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.micro / 1000) + "s" }}</span>
                </template>
            </el-table-column>
            <el-table-column label="图标" align="center" width="36">
                <template #default="{ row }">
                    <div class="u-effect-icon">
                        <img :src="getResourceIcon(row.effect)" alt="" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="招式" width="240">
                <template #default="{ row }">
                    <span>{{ getResourceName(row.effect) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="实际数值" width="112">
                <template #default="{ row }">
                    <span>{{ row.value }}</span>
                </template>
            </el-table-column>
            <el-table-column label="会心" width="64">
                <template #default="{ row }">
                    <span>{{ row.isCritical ? "会心" : "" }}</span>
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
import { inject, computed, ref } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";

// data
const target = inject("target", null);
const effect = inject("effect", null);

const logs = inject("logs", null);
const detail = inject("detail", null);
// computed
const type = computed(() => {
    if (target) return "target";
    else if (effect) return "effect";
    else return "";
});
const titleName = computed(() => {
    if (type.value === "target") {
        return `${getEntityName(target.value)}`;
    } else if (type.value === "effect") {
        const resource = getResource(target.value);
        return `${resource.name ?? resource.remark}`;
    } else return "";
});
const data = computed(() => {
    if (!logs || !logs.value) return [];
    let index = 0;
    for (let log of logs.value) {
        log.index = ++index;
    }
    return logs.value;
});
const pageSize = ref(25);
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
