<template>
    <div class="m-entity-view-skill">
        <div class="u-left w-card">
            <div class="w-card-title">技能列表</div>
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
        </div>
        <div class="u-right">
            <entity-skill-log></entity-skill-log>
            <entity-skill-log-detail></entity-skill-log-detail>
        </div>
    </div>
</template>

<script setup>
import { provide, inject, ref, watch } from "vue";
import { useStore } from "@/store";
import { usePaginate } from "@/utils/uses/usePaginate";
import { displayDigits, displayPercent, getResourceIcon, getResourceName } from "@/utils/common";

import EntitySkillLog from "./entity_skill_log.vue";
import EntitySkillLogDetail from "./entity_skill_log_detail.vue";

// 注入的属性
const store = useStore();
const statType = inject("statType");
const entity = inject("entity");
const currentWindow = inject("currentWindow");

// data
const data = ref([]);
const pageSize = ref(22);
const { currentPage, currentData, total } = usePaginate(data, { pageSize: pageSize.value });

// data & provide
const effect = ref(null); // 选中的目标
const logs = ref(null); // 选中的日志
const detail = ref(null); // 选中的日志详情
provide("effect", effect);
provide("logs", logs);
provide("detail", detail);

// 行点击事件
const click = (row) => {
    if (effect.value === row.effect) return;
    effect.value = row.effect;
    logs.value = row.logs;
};
// 行样式
const rowClass = ({ row }) => {
    return effect.value === row.effect ? "is-focus" : "";
};
// 更新数据方法
const updateData = () => {
    const { stats } = store.result;
    const source =
        currentWindow.value === null
            ? stats[statType.value]?.[entity.value]?.all
            : stats[statType.value]?.[entity.value]?.windows?.[currentWindow.value];
    if (!source) {
        data.value = [];
        return;
    }
    let result = {};

    let total = 0;
    for (let detail of source.details) {
        //这个target不一定是目标的ID，在承伤/承疗的时候表现为来源ID
        const effect = detail.effect;
        if (!result[effect])
            result[effect] = {
                count: 0, // 伤害次数
                criticalCount: 0, //会心次数
                value: 0, //总伤害量
                min: 1e10, //最小伤害值
                max: -1e10, //最大伤害值
                logs: [], // 详细伤害日志
            };
        result[effect].count++;
        result[effect].value += detail.value;
        total += detail.value;
        result[effect].min = Math.min(result[effect].min, detail.value);
        result[effect].max = Math.max(result[effect].max, detail.value);
        if (detail.isCritical) result[effect].criticalCount++;
        result[effect].logs.push(detail);
    }
    for (let effect in result) {
        let r = result[effect];
        r.criticalRate = (r.criticalCount / r.count) * 100;
        r.valueRate = (r.value / total) * 100;
        r.avg = r.value / r.count;
        r.effect = effect;
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
    [() => store.result, currentWindow, entity, statType],
    () => {
        updateData();
        effect.value = null;
        logs.value = null;
        detail.value = null;
    },
    { immediate: true }
);
</script>

<style lang="less">
.m-entity-view-skill {
    display: flex;
    gap: 20px;
    .size(1440px, 800px);
    & > .u-left {
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
