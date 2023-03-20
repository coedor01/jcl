<template>
    <div class="m-entity-view-target">
        <div class="u-left">
            <div class="w-card">
                <template v-if="currentData.length === 0">
                    <div class="u-left-empty">
                        <img class="u-left-empty__icon" src="@/assets/img/common/circle_arrow.svg" />
                        <div>
                            <div>在上方选择一个单位后</div>
                            <div>此处会展示该单位的详细技能数</div>
                        </div>
                    </div>
                </template>
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
                        <el-table-column label="心法" width="48" :align="'center'">
                            <template #default="{ row }">
                                <div class="u-mount-icon">
                                    <img :src="getMountIcon(row.target)" alt="" />
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column :label="targetLabel" width="112">
                            <template #default="{ row }">
                                <span>{{ getEntityName(row.target) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="value" label="数值" width="148" sortable="custom">
                            <template #default="{ row }">
                                <span>{{ row.value }}</span>
                                <span> ({{ displayPercent(row.valueRate) }})</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="count" label="次数" width="70" sortable="custom"></el-table-column>
                        <el-table-column prop="critRate" label="会心" width="104" sortable="custom">
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
            <entity-skill-log-detail></entity-skill-log-detail>
        </div>
        <div class="u-right">
            <entity-skill-log></entity-skill-log>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, toRefs } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { usePaginate } from "@/utils/uses/usePaginate";
import { getMountIcon, getEntityName, displayDigits, displayPercent } from "@/utils/common";

import EntitySkillLog from "./entity_view_log.vue";
import EntitySkillLogDetail from "./entity_view_log_detail.vue";

// 注入的属性
const store = useStore();
const { entityTab, entity, currentWindow, target, logs, log: detail } = toRefs(usePve());

// computed
const targetLabel = computed(() => {
    return ["damage", "treat"].includes(entityTab.value) ? "目标" : "来源";
});

// data
const skipNoNameTarget = ref(false);
const data = ref([]);
const pageSize = ref(9);
const { currentPage, currentData, total } = usePaginate(data, pageSize);

// 行点击事件
const click = (row) => {
    if (target.value === row.target) return;
    target.value = row.target;
    logs.value = row.logs;
};
// 行样式
const rowClass = ({ row }) => {
    return target.value === row.target ? "is-focus" : "";
};
// 更新数据方法
const updateData = () => {
    const { stats, entities } = store.result;
    const source =
        currentWindow.value === null
            ? stats[entityTab.value]?.[entity.value]?.all
            : stats[entityTab.value]?.[entity.value]?.windows?.[currentWindow.value];
    if (!source) {
        data.value = [];
        return;
    }
    let result = {};

    let total = 0;
    for (let detail of source.details) {
        //这个target不一定是目标的ID，在承伤/承疗的时候表现为来源ID
        const target = ["damage", "treat"].includes(entityTab.value) ? detail.target : detail.caster;
        const entity = entities[target];
        if (skipNoNameTarget.value && !entity.name) continue;
        if (!result[target])
            result[target] = {
                count: 0, // 伤害次数
                criticalCount: 0, //会心次数
                value: 0, //总伤害量
                min: 1e10, //最小伤害值
                max: -1e10, //最大伤害值
                logs: [], // 详细伤害日志
            };
        result[target].count++;
        result[target].value += detail.value;
        total += detail.value;
        result[target].min = Math.min(result[target].min, detail.value);
        result[target].max = Math.max(result[target].max, detail.value);
        if (detail.isCritical) result[target].criticalCount++;
        result[target].logs.push(detail);
    }
    for (let k in result) {
        let r = result[k];
        r.criticalRate = (r.criticalCount / r.count) * 100;
        r.valueRate = (r.value / total) * 100;
        r.avg = r.value / r.count;
        r.target = Number(k);
    }
    data.value = Object.values(result);
    data.value = data.value.sort((a, b) => b.value - a.value);
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
    [() => store.result, currentWindow, entity, entityTab],
    () => {
        updateData();
        target.value = data.value[0]?.target;
        logs.value = data.value[0]?.logs;
        detail.value = logs.value?.[0];
    },
    { immediate: true }
);
</script>

<style lang="less">
.m-entity-view-target {
    display: flex;
    gap: 20px;
    .size(1440px, 800px);

    .u-left-empty {
        display: flex;
        align-items: center;
        .bold;
        padding: 30px;
        .fz(20px, 36px);
        color: #717273;
    }

    .u-left-empty__icon {
        .size(95px, 95px);
        .mr(32px);
    }

    & > .u-left {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .size(810px, 760px);

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
