<template>
    <div class="m-entity-view-effect">
        <div class="u-left w-card" v-loading="loading">
            <template v-if="currentData.length === 0">
                <empty-guide
                    text-align="left"
                    to="row"
                    position="flex-start"
                    :grow="false"
                    :tips="['在上方选择一个单位后', '此处会展示该单位的详细技能数']"
                ></empty-guide>
            </template>
            <template v-else>
                <div class="w-card-title">
                    <span>技能列表</span>
                    <span v-if="currentWindow" class="u-window-tip">
                        当前查看的是 {{ currentWindow - 5 }} ~ {{ currentWindow }} 之间的记录
                        <div class="u-clear-window" @click="currentWindow = null">×</div>
                    </span>
                </div>
                <el-table
                    class="u-table"
                    :data="currentData"
                    :border="false"
                    @sort-change="sort"
                    @row-click="click"
                    :row-class-name="rowClass"
                >
                    <el-table-column label="图标" width="48" :align="'center'">
                        <template #default="{ row }">
                            <div class="u-effect-icon">
                                <img :src="getResourceIcon(row.effect)" alt="" />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="招式" width="168">
                        <template #default="{ row }">
                            <span :title="getResourceName(row.effect, { showID: true })">{{
                                getResourceName(row.effect, { showID: true })
                            }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="count" label="次数" width="80" sortable="custom"></el-table-column>
                    <el-table-column prop="value" label="数值" width="156" sortable="custom">
                        <template #default="{ row }">
                            <span>{{ row.value }}</span>
                            <span> ({{ displayPercent(row.valueRate) }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="critRate" label="会心" width="120" sortable="custom">
                        <template #default="{ row }">
                            <span>{{ row.criticalCount }}</span>
                            <span> ({{ displayPercent(row.criticalRate) }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="min" label="最小值" width="90" sortable="custom"></el-table-column>
                    <el-table-column prop="max" label="最大值" width="98" sortable="custom"></el-table-column>
                    <el-table-column prop="avg" label="平均值" width="98" sortable="custom">
                        <template #default="{ row }">
                            <span>{{ displayDigits(row.avg) }}</span>
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
        <div class="u-right">
            <entity-skill-log></entity-skill-log>
            <entity-skill-log-detail></entity-skill-log-detail>
        </div>
    </div>
</template>

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import { ref, watch, toRefs } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { usePaginate } from "@/utils/uses/usePaginate";
import { getResourceIcon, getResourceName } from "@/utils/common";
import { displayDigits, displayPercent } from "@/utils/commonNoStore";
import getWorkerResponse from "@/utils/worker";

import EntitySkillLog from "./entity_view_log.vue";
import EntitySkillLogDetail from "./entity_view_log_detail.vue";

// 注入的属性
const store = useStore();
const { entityTab, entity, currentWindow, effect, logs, log } = toRefs(usePve());

// 行点击事件
const click = (row) => {
    if (effect.value === row.effect) return;
    effect.value = row.effect;
    logs.value = row.logs;
    log.value = row.logs[0];
};
// 行样式
const rowClass = ({ row }) => {
    return effect.value === row.effect ? "is-focus" : "";
};
// 数据相关
const loading = ref(false);
const data = ref([]);
const pageSize = ref(22);
const { currentPage, currentData, total } = usePaginate(data, pageSize);
const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_pve_entity_view_effect", {
        entityTab: entityTab.value,
        entity: entity.value,
        currentWindow: currentWindow.value,
    }).then((result) => {
        data.value = result;
        loading.value = false;
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
    let index = 1;
    for (let item of data.value) {
        item.index = index++;
    }
};
watch(
    [() => store.result, currentWindow, entity, entityTab],
    () => {
        updateData();
    },
    { immediate: true }
);
</script>

<style lang="less">
.m-entity-view-effect {
    display: flex;
    gap: 20px;
    width: 1440px;
    & > .u-left {
        .w-card-title {
            display: flex;
            gap: 40px;
        }
        .u-window-tip {
            .flex-center;
            gap: 8px;
        }
        .u-clear-window {
            .pointer;
        }

        .size(900px, 800px);

        .u-table {
            flex-grow: 1;

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
    & > .u-right {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 520px;

        & > div:first-of-type {
            height: 420px;
        }
        & > div:last-of-type {
            flex-grow: 1;
        }
    }
}
</style>
