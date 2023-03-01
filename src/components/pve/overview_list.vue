<template>
    <div class="m-overview-list">
        <p class="u-title">单位详情</p>
        <el-table
            class="u-table"
            :data="pageData"
            :border="false"
            :fit="false"
            @sort-change="sort"
            @row-click="click"
            :row-class-name="rowClass"
        >
            <el-table-column label="职业" width="32">
                <template #default="{ row }">
                    <img class="u-mount-icon" :src="getMountIcon(row.id)" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="单位" width="112">
                <template #default="{ row }">
                    <span>{{ getEntityName(row.id) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="value" label="总数值" width="112" sortable="custom"></el-table-column>
            <el-table-column label="秒数值" width="112">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.vps) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="count" label="招式次数" width="100"></el-table-column>
            <el-table-column prop="criticalCount" label="会心数" width="100"></el-table-column>
            <el-table-column prop="min" label="单次最小" width="100"></el-table-column>
            <el-table-column prop="max" label="单次最大" width="100"></el-table-column>
            <el-table-column label="占比" width="164">
                <template #default="{ row }">
                    <div class="u-rate-wrapper">
                        <div class="u-rate-value">{{ displayPercent(row.rate) }}</div>
                        <div class="u-rate-outer" v-if="row.length">
                            <div class="u-rate-inner" :style="{ width: row.length + '%' }"></div>
                        </div>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            class="u-pagination"
            small
            background
            layout="pager"
            :page-size="25"
            :total="total"
            :hide-on-single-page="true"
            :current-page="currentPage"
            @update:currentPage="currentPage = $event"
        />
    </div>
</template>

<script setup>
import { useStore } from "@/store";
import { getMountIcon, getEntityName, displayDigits, displayPercent } from "@/utils/common";

import { computed, ref, watch, inject } from "vue";
import { pick, sortBy } from "lodash-es";
// inject
const focusEntities = inject("focusEntities");
const statType = inject("statType");
// 数据
const store = useStore();
const data = ref([]);
const pageData = computed(() => {
    return data.value.slice((currentPage.value - 1) * 25, currentPage.value * 25);
}, [data]);
// 分页
const currentPage = ref(1);
const total = computed(() => {
    const { stats } = store.result;
    if (!stats) return 0;
    return Object.keys(stats[statType.value]).length;
});
// methods
const sort = ({ prop, order }) => {
    data.value = data.value.sort((a, b) => {
        if (order === "ascending") {
            return a[prop] - b[prop];
        } else {
            return b[prop] - a[prop];
        }
    });
};
const click = ({ id }) => {
    if (focusEntities.value.includes(id)) {
        focusEntities.value = focusEntities.value.filter((item) => item !== id);
    } else {
        focusEntities.value.push(id);
        const sortList = data.value.map((x) => x.id);
        focusEntities.value = sortBy(focusEntities.value, (element) => sortList.indexOf(element));
    }
};
const rowClass = ({ row }) => {
    if (focusEntities.value.includes(row.id)) {
        return "is-focus";
    }
    return "";
};
// watch
watch(
    [() => store.result, () => statType.value],
    () => {
        const { entities, stats, end } = store.result;
        if (!stats) return [];
        const source = stats[statType.value];
        if (!source) return [];
        let result = [];
        let teamTotal = 0;
        let maxValue = 0;
        for (let entity in source) {
            let entityData = {
                ...pick(source[entity].all, ["count", "value", "max", "min", "criticalCount"]),
                ...pick(entities[entity], ["name", "id", "mount"]),
            };
            entityData.vps = entityData.value / end.sec;
            if (entityData.mount) {
                teamTotal += entityData.value;
                maxValue = Math.max(maxValue, entityData.value);
            }
            result.push(entityData);
        }
        for (let entity of result) {
            if (entity.mount) {
                entity["rate"] = (entity.value / teamTotal) * 100;
                entity["length"] = (entity.value / maxValue) * 100;
            } else {
                entity["rate"] = 0;
                entity["length"] = 0;
            }
        }
        data.value = result;
        sort({ prop: "value", order: "descending" });
        currentPage.value = 1;
    },
    { immediate: true }
);
</script>

<style lang="less">
.m-overview-list {
    display: flex;
    flex-direction: column;
    background: #131517;
    border-radius: 20px;
    padding: 20px;
    .size(1000px, 1000px);

    .u-title {
        margin: 0;
        .mb(10px);
        .fz(14px, 18px);
        .bold;
        color: #b3b3b3;
    }

    .u-table {
        flex-grow: 1;
        .mb(4px);
        width: 100%;
        color: #b3b3b3;

        .el-table__row {
            cursor: pointer;
        }
        .el-table__row:not(.is-focus):hover {
            .el-table__cell:not(:first-of-type) {
                div.cell {
                    background: #1520b3;
                }
                &:nth-of-type(2) {
                    div.cell {
                        border-radius: 6px 0 0 6px;
                    }
                }
                &:last-of-type {
                    div.cell {
                        border-radius: 0 6px 6px 0;
                    }
                }
            }
        }

        .u-mount-icon {
            .size(26px, 26px);
            .mb(-2px);
        }

        .u-rate-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;

            .u-rate-value {
                width: 64px;
                text-align: right;
            }
            .u-rate-outer {
                flex-grow: 1;
                height: 4px;
                background: transparent;
                border-radius: 2px;

                .u-rate-inner {
                    height: 100%;
                    background: #ffffff;
                    border-radius: 2px;
                }
            }
        }
    }

    .u-pagination {
        justify-content: flex-end;

        .el-pager .number {
            background: #2b2b42;
            color: #b3b3b3;

            &.is-active {
                background: #7650f8;
                color: #ffffff;
            }
        }
    }
}
</style>
