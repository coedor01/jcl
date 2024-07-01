<template>
    <div class="m-individual-buff-coverage">
        <p class="u-title">个人增益详情</p>
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
            @row-click="click"
            :row-class-name="rowClass"
        >
            <el-table-column label="图标" width="48" :align="'right'">
                <template #default="{ row }">
                    <img class="u-buff-icon" :src="getResourceIcon(row.query_key)" alt="" />
                </template>
            </el-table-column>
            <el-table-column label="增益名称" width="120">
                <template #default="{ row }">
                    <span>{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="average_stack" label="平均层数" width="90" sortable="true"></el-table-column>
            <el-table-column
                prop="average_times_per_player"
                label="平均作用次数"
                width="130"
                sortable="true"
            ></el-table-column>
            <el-table-column prop="min_stack" label="单次最小层数" width="130" sortable="true"></el-table-column>
            <el-table-column prop="max_stack" label="单次最大层数" width="130" sortable="custom"></el-table-column>
            <el-table-column prop="average_coverage" label="覆盖率" width="130" sortable="custom"></el-table-column>
            <el-table-column label="覆盖率(百分比)" width="10">
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
import { ref, watchPostEffect, toRefs } from "vue";
import { buffs_coverage_constants } from "@/assets/data/buff_coverage_constant";
import { usePve } from "@/store/pve";
import getWorkerResponse from "@/utils/worker";

// 数据
const loading = ref(false);
const final_data = ref([]);
const message = ref(""); // 定义 message
const query_buff_list = buffs_coverage_constants.individual_buffs;

const { currentPage, currentData, total } = usePaginate(final_data, ref(10));

// 注入的属性
const { individual_selected_buff, individual_selected_buff_log } = toRefs(usePve());

// 行点击事件
const click = (row) => {
    if (individual_selected_buff.value === row.query_key) {
        return;
    }

    individual_selected_buff.value = row.query_key;
    individual_selected_buff_log.value = row;
};
// 行样式
const rowClass = ({ row }) => {
    return individual_selected_buff.value === row.query_key ? "is-focus" : "";
};

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
    getWorkerResponse("get_individual_buff_coverage", { query_buff_list }).then((result) => {
        loading.value = false;
        console.log(result);
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
    console.log(message.value.split(":")[0]);
    console.log(query_buff_list);
    updateData();
};
</script>

<style lang="less">
.m-individual-buff-coverage {
    display: flex;
    flex-direction: column;
    background: #131517;
    border-radius: 20px;
    padding: 20px;
    .size(780px, 520px);

    .u-title {
        margin: 0;
        .mb(10px);
        .fz(14px, 18px);
        .bold;
        color: #b3b3b3;
    }

    .u-table {
        flex-grow: 1;
        .u-buff-icon {
            .size(24px);
            .mr(4px);
            display: block;
        }

        .u-effect-icon {
            .flex-center;
            img {
                .size(23px);
            }
        }

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
    }
}
</style>
