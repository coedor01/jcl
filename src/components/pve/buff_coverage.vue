<template>
    <div class="m-buff-coverage-list">
        <p class="u-title">团队增益详情</p>
        <el-table
            v-loading="loading"
            class="u-table"
            :data="currentData"
            :border="false"
            :fit="false"
            @sort-change="sort"
        >
            <el-table-column label="图标" width="48" :align="'right'">
                <template #default="{ row }">
                    <img class="u-mount-icon" :src="getResourceIcon(row.query_key)" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="增益名称" width="200">
                <template #default="{ row }">
                    <span>{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="average_stack" label="平均层数" width="130" sortable="true"></el-table-column>
            <el-table-column
                prop="average_times_per_player"
                label="平均作用次数"
                width="130"
                sortable="true"
            ></el-table-column>
            <el-table-column prop="min_stack" label="单次最小层数" width="130" sortable="true"></el-table-column>
            <el-table-column prop="max_stack" label="单次最大层数" width="130" sortable="custom"></el-table-column>
            <el-table-column prop="average_coverage" label="覆盖率" width="150" sortable="custom"></el-table-column>
            <el-table-column label="覆盖率(百分比)" width="150">
                <template #default="{ row }">
                    <div class="u-rate-wrapper">
                        <div class="u-rate-value">{{ displayPercent(row.average_coverage * 100) }}</div>
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
import { displayPercent } from "@/utils/commonNoStore";
import { usePaginate } from "@/utils/uses/usePaginate";
import { getResourceIcon } from "@/utils/common";
import { ref, watchPostEffect } from "vue";

import getWorkerResponse from "@/utils/worker";

// 数据
const loading = ref(false);
const data = ref([]);

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

const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_team_buff_coverage", {}).then((result) => {
        loading.value = false;
        data.value = result;
        sort({ prop: "average_coverage", order: "descending" });
        currentPage.value = 1;
    });
};
// watch
watchPostEffect(updateData);
</script>

<style lang="less">
.m-buff-coverage-list {
    display: flex;
    flex-direction: column;
    background: #131517;
    border-radius: 20px;
    padding: 20px;
    .size(1280px, 960px);

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
