<template>
    <div class="m-blame-view-death">
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
                        @row-click="click"
                        :row-class-name="rowClass"
                    >
                        <el-table-column :label="targetLabel" width="112">
                            <template #default="{ row }">
                                <span>{{ getEntityName(row.killerId) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="critRate" label="重伤时间" width="104" sortable="custom">
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
            <blame-skill-log></blame-skill-log>
        </div>
        <div class="u-bottom">
            <!-- 技能日志 -->
            <blame-death-buff-detail></blame-death-buff-detail>
        </div>
    </div>
</template>

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import BlameDeathBuffDetail from "@/components/pve/blame_death_buff_detail.vue";
import BlameSkillLog from "./blame_skill_log.vue";
import { ref, watch, computed, toRefs } from "vue";
import { usePve } from "@/store/pve";
import { usePaginate } from "@/utils/uses/usePaginate";
import { getEntityName } from "@/utils/common";
import getWorkerResponse from "@/utils/worker";

// 注入的属性
const { entityTab, entity, entityTimeRange, target, blame_death_buff, blame_death_detail } = toRefs(usePve());

// computed
const targetLabel = computed(() => {
    return "击杀者";
});
// 行点击事件
const click = (row) => {
    if (target.value === row.playerId) return;
    target.value = row.playerId;
    blame_death_buff.value = row.buff;
    blame_death_detail.value = row.detail;
    // console.log(blame_death_buff);
};

// 行样式
const rowClass = ({ row }) => {
    return target.value === row.playerId ? "is-focus" : "";
};
// 数据相关
const loading = ref(false);
const data = ref([]);
const pageSize = ref(9);
const { currentPage, currentData, total } = usePaginate(data, pageSize);
const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_blame_death_entity", {
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
    blame_death_buff.value = [];
    blame_death_detail.value = [];
};
watch(() => data.value, clearLogs, { flush: "post" });
</script>

<style lang="less">
.m-blame-view-death {
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
