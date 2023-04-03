<template>
    <div class="m-overview-list">
        <p class="u-title">单位详情</p>
        <el-table
            v-loading="loading"
            class="u-table"
            :data="currentData"
            :border="false"
            :fit="false"
            @sort-change="sort"
            @row-click="click"
            :row-class-name="rowClass"
        >
            <el-table-column label="职业" width="48" :align="'right'">
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
            <el-table-column label="占比" width="175">
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
            class="w-pagination"
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
import { usePve } from "@/store/pve";
import { getMountIcon, getEntityName } from "@/utils/common";
import { displayDigits, displayPercent } from "@/utils/commonNoStore";
import { usePaginate } from "@/utils/uses/usePaginate";

import { ref, watch, toRefs } from "vue";
import { sortBy } from "lodash-es";
import getWorkerResponse from "@/utils/worker";

const global = usePve();

// 数据
const loading = ref(false);
const data = ref([]);
const { focusEntities, statType } = toRefs(global);
const { currentPage, currentData, total } = usePaginate(data, ref(25));
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
const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_pve_overview_list", { statType: statType.value }).then((result) => {
        loading.value = false;
        data.value = result;
        sort({ prop: "value", order: "descending" });
        currentPage.value = 1;
    });
};
// watch
watch(
    [statType],
    () => {
        updateData();
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
    .size(960px, 960px);

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

        .el-table__row.is-focus {
            .el-table__cell:first-of-type {
                div.cell {
                    background: transparent;
                }
            }
            .el-table__cell:nth-of-type(2) {
                div.cell {
                    border-radius: 6px 0 0 6px;
                }
            }
        }

        .el-table__row:not(.is-focus):hover {
            .el-table__cell:not(:first-of-type) {
                div.cell {
                    background: #7650f8aa;
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
                flex-grow: 0.8;
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
}
</style>
