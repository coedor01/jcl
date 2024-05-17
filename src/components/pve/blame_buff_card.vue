<template>
    <div class="m-entity-view-target">
        <div class="u-left">
            <div class="w-card" v-loading="loading">
                <!-- 为空指引 -->
                <template v-if="currentData.length === 0">
                    <empty-guide
                        text-align="left"
                        to="row"
                        position="flex-start"
                        :grow="false"
                        :tips="['在左侧选择一个玩家后', '此处会显示玩家的有关信息']"
                    ></empty-guide>
                </template>
                <!-- 表格部分 -->
                <template v-else>
                    <div class="w-card-title">
                        <span>{{ targetLabel }}列表</span>
                    </div>
                    <el-table
                        class="u-table"
                        :data="currentData"
                        :border="false"
                        @sort-change="sort"
                        :row-class-name="rowClass"
                    >
                        <el-table-column :label="targetLabel" width="112">
                            <template #default="{ row }">
                                <span>{{ getEntityName(row.source) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="名字" width="148" sortable="custom">
                            <template #default="{ row }">
                                <span>{{ row.buffName }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="id" label="Buff ID" width="148" sortable="custom">
                            <template #default="{ row }">
                                <span>{{ row.buffId }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="stack" label="层数" width="148" sortable="custom">
                            <template #default="{ row }">
                                <span>{{ row.stack }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="critRate" label="时间" width="104" sortable="custom">
                            <template #default="{ row }">
                                <span>{{ row.time }}</span>
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
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import { ref, watch, computed, toRefs } from "vue";
import { usePve } from "@/store/pve";
import { usePaginate } from "@/utils/uses/usePaginate";
import { getEntityName } from "@/utils/common";
import getWorkerResponse from "@/utils/worker";

// 注入的属性
const { entityTab, entity, entityTimeRange, target, targetLogs, targetLog } = toRefs(usePve());

// computed
const targetLabel = computed(() => {
    return "来源";
});

// 行样式
const rowClass = ({ row }) => {
    return target.value === row.target ? "is-focus" : "";
};
// 数据相关
const loading = ref(false);
const data = ref([]);
const pageSize = ref(9);
const { currentPage, currentData, total } = usePaginate(data, pageSize);
const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_blame_entity", {
        entityId: entity.value,
    }).then((result) => {
        data.value = result;
        loading.value = false;
        sort({ prop: "time", order: "descending" });
    });
};
const sort = ({ prop, order }) => {
    data.value = data.value.sort((a, b) => {
        if (order === "ascending") {
            return a[prop] - b[prop];
        } else {
            return b[prop] - a[prop];
        }
    });
};
watch(
    [entity, () => entityTimeRange.value[entity.value], entityTab],
    ([newEntity], [oldEntity]) => {
        if (oldEntity && newEntity != oldEntity) clearLogs();
        updateData();
    },
    { immediate: true, flush: "post" }
);

const clearLogs = () => {
    target.value = "";
    targetLogs.value = [];
    targetLog.value = null;
};
watch(() => data.value, clearLogs, { flush: "post" });
</script>

<style lang="less">
.m-entity-view-target {
    display: flex;
    gap: 20px;
    .size(1440px, 800px);

    & > .u-left {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .size(810px, 760px);

        .w-card-title {
            display: flex;
            gap: 40px;
        }

        & > div:first-of-type {
            height: 410px;
            flex-shrink: 0;
        }

        & > div:last-of-type {
            height: 290px;
        }

        .u-table {
            flex-grow: 1;

            .u-mount-icon {
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
        }
    }

    & > .u-right {
        .size(610px, 760px);
        display: flex;

        & > .w-card {
            flex-grow: 1;
        }
    }
}
</style>
