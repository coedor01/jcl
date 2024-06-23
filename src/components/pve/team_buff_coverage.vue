<template>
    <div class="m-team-buff-coverage">
        <p class="u-title">团队增益详情</p>
        <div>
            <el-input
                v-model="message"
                placeholder="输入你想添加的增益ID(例：查看飘黄应该输入 20855:1)"
                style="width: 400px"
            >
            </el-input
            ><el-button @click="submitMessage" style="margin-left: 10px; height: 28px">提交</el-button>
        </div>

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
            :page-size="10"
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
import { buffs_coverage_constants } from "@/assets/data/buff_coverage_constant";

import getWorkerResponse from "@/utils/worker";

// 数据
const loading = ref(false);
const final_data = ref([]);
const message = ref(""); // 定义 message
const query_buff_list = buffs_coverage_constants.team_buffs;

const { currentPage, currentData, total } = usePaginate(final_data, ref(10));
// methods
const sort = ({ prop, order }) => {
    final_data.value = final_data.value.sort((a, b) => {
        if (order === "ascending") {
            return a[prop] - b[prop];
        } else {
            return b[prop] - a[prop];
        }
    });
};

const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_team_buff_coverage", { query_buff_list }).then((result) => {
        loading.value = false;
        final_data.value = result;
        sort({ prop: "average_coverage", order: "descending" });
        currentPage.value = 1;
    });
};
// watch
watchPostEffect(updateData);
// 监控 message 的变化
const submitMessage = () => {
    query_buff_list[parseInt(message.value.split(":")[0])] = parseInt(message.value.split(":")[1]);
    updateData();
};
</script>

<style lang="less">
.m-team-buff-coverage {
    display: flex;
    flex-direction: column;
    background: #131517;
    border-radius: 20px;
    padding: 20px;
    .size(1280px, 520px);

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
