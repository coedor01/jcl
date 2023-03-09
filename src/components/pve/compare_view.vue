<template>
    <div class="m-compare-view" :class="`u-index-${index}`">
        <div class="u-overview">
            <div v-for="(item, index) in overview" :key="index" class="u-overview-item">
                <span>{{ item.title }}</span>
                <span>{{ item.value }}</span>
            </div>
        </div>
        <div class="u-skills w-card">
            <div class="w-card-title">技能列表</div>
            <el-table
                class="u-table"
                :data="currentData"
                :border="false"
                @sort-change="sortSkill"
                @row-click="selectSkill"
                :row-class-name="rowClass"
            >
                <el-table-column label="图标" width="48" :align="'center'">
                    <template #default="{ row }">
                        <div class="u-effect-icon">
                            <img :src="getResourceIcon(row.effect)" alt="" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="招式" width="200">
                    <template #default="{ row }">
                        <span :title="getResourceName(row.effect, { showID: true })">{{
                            getResourceName(row.effect, { showID: true })
                        }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="次数" width="60" sortable="custom"></el-table-column>
                <el-table-column prop="value" label="数值" width="160" sortable="custom">
                    <template #default="{ row }">
                        <span>{{ row.value }}</span>
                        <span> ({{ displayPercent(row.valueRate) }})</span>
                    </template>
                </el-table-column>
                <el-table-column prop="critRate" label="会心" width="100" sortable="custom">
                    <template #default="{ row }">
                        <span>{{ row.criticalCount }}</span>
                        <span> ({{ displayPercent(row.criticalRate) }})</span>
                    </template>
                </el-table-column>
                <el-table-column prop="avg" label="平均值" width="100" sortable="custom">
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
        <div class="u-skill-more">
            <div class="u-skill-logs w-card">
                <div v-if="effect" class="w-card-title">招式 {{ getResourceName(effect) }} 的结算记录</div>
                <div v-else class="w-card-title">-</div>
                <el-table
                    class="u-table"
                    :data="currentLogData"
                    :border="false"
                    :row-class-name="logRowClass"
                    @row-click="selectLog"
                >
                    <el-table-column prop="index" label="#" align="center" :width="40"></el-table-column>
                    <el-table-column label="时间" width="60">
                        <template #default="{ row }">
                            <span>{{ displayDigits(row.micro / 1000) + "s" }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="目标" width="70">
                        <template #default="{ row }">
                            <span>{{ getEntityName(row.target) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="实际数值" width="100">
                        <template #default="{ row }">
                            <span>{{ row.value }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="会心" width="50">
                        <template #default="{ row }">
                            <span>{{ row.isCritical ? "会心" : "-" }}</span>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                    class="w-pagination"
                    small
                    background
                    layout="pager"
                    :page-size="logPageSize"
                    :total="totalLog"
                    :hide-on-single-page="true"
                    :current-page="currentLogPage"
                    @update:currentPage="currentLogPage = $event"
                ></el-pagination>
            </div>
            <div class="u-skill-detail">
                <div class="u-card" :class="`u-index-${index}`">
                    <div class="u-top">
                        <div class="u-card-title">技能详情</div>
                        <div class="u-effect-infos" v-if="detail">
                            <div class="u-effect-info">
                                <span>招式：</span>
                                <img :src="getResourceIcon(detail.effect)" />
                                <span>{{ getResourceName(detail.effect, { showID: true }) }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>来源：</span>
                                <img :src="getMountIcon(detail.caster)" />
                                <span>{{ getEntityName(detail.caster) }}#{{ detail.caster }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>施展次数：</span>
                                <span>第 {{ detail.index }} 次</span>
                            </div>
                            <div class="u-effect-info">
                                <span>施展时间：</span>
                                <span>{{ displayDigits(detail.micro / 1000) }} s</span>
                            </div>
                            <div class="u-effect-info">
                                <span>实际数值：</span>
                                <span>{{ detail.value }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>目标：</span>
                                <img :src="getMountIcon(detail.target)" />
                                <span>{{ getEntityName(detail.target) }}#{{ detail.target }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>备注：</span>
                                <span v-if="detail.isCritical">会心</span>
                                <span v-else> - </span>
                            </div>
                        </div>
                    </div>
                    <div class="w-card">
                        <div class="w-card-title">携带BUFF列表</div>
                        <div class="u-buff-list">
                            <div
                                v-for="(buff, index) in currentBuffData"
                                :key="index"
                                class="u-buff"
                                :title="getResourceName('buff:' + buff.split('*')[0], { showID: true })"
                            >
                                <img class="u-buff-icon" :src="getResourceIcon('buff:' + buff.split('*')[0])" />
                                <span class="u-buff-stack">{{ buff.split("*")[1] }}</span>
                                <span class="u-buff-name">{{
                                    getResourceName("buff:" + buff.split("*")[0], { showID: true })
                                }}</span>
                            </div>
                        </div>
                        <el-pagination
                            class="w-pagination"
                            small
                            background
                            layout="pager"
                            :page-size="buffPageSize"
                            :total="totalBuff"
                            :hide-on-single-page="true"
                            :current-page="currentBuffPage"
                            @update:currentPage="currentBuffPage = $event"
                        ></el-pagination>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";
import {
    displayDigits,
    displayDuration,
    displayPercent,
    getResourceIcon,
    getResourceName,
    getMountIcon,
    getEntityName,
} from "@/utils/common";
import { toRefs, ref, computed, watch } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
// props
const props = defineProps({
    index: {
        type: Number,
        default: 1,
    },
});
const { index } = toRefs(props);

// data
const effect = ref(null);
const logs = ref([]);
const detail = ref(null);

// 技能列表
const data = ref([]);
const pageSize = ref(8);
const { currentData, currentPage, total } = usePaginate(data, { pageSize: pageSize.value });
// 技能日志列表
const logPageSize = ref(12);
const {
    currentData: currentLogData,
    currentPage: currentLogPage,
    total: totalLog,
} = usePaginate(logs, { pageSize: logPageSize.value });
// 技能详情
const buffPageSize = ref(8);
const buff = computed(() => {
    if (!detail.value) return [];
    return detail.value.buffs;
});
const {
    currentData: currentBuffData,
    currentPage: currentBuffPage,
    total: totalBuff,
} = usePaginate(buff, { pageSize: buffPageSize.value });

// computed
const { compareEntity, compareMode } = toRefs(useGlobal());
const { result } = toRefs(useStore());
const entity = computed(() => compareEntity.value[index.value - 1]);
const source = computed(() => result.value?.stats?.[compareMode.value]?.[entity.value]?.all);
const overview = computed(() => {
    if (!source.value) return;
    const fightTime = result.value.end.sec;
    const displayTime = displayDuration(fightTime);
    return [
        {
            title: "战斗时长",
            value: displayTime,
        },
        {
            title: "总次数",
            value: source.value.count,
        },
        {
            title: "总伤害",
            value: source.value.value ? source.value.value.toLocaleString() : 0,
        },
        {
            title: "每秒数值",
            value: displayDigits(source.value.value / fightTime),
        },
        {
            title: "会心率",
            value: displayPercent((source.value.criticalCount / source.value.count) * 100),
        },
    ];
});

// methods
const updateData = () => {
    if (!source.value || !source.value.details) return [];
    let result = {};
    for (let detail of source.value.details) {
        const effect = detail.effect;
        if (!result[effect]) {
            result[effect] = {
                count: 0, // 伤害次数
                criticalCount: 0, //会心次数
                value: 0, //总伤害量
                min: 1e10, //最小伤害值
                max: 1e-10, //最大伤害值
                logs: [], // 详细伤害日志
                effect,
            };
        }
        result[effect].count++;
        result[effect].value += detail.value;
        result[effect].min = Math.min(result[effect].min, detail.value);
        result[effect].max = Math.max(result[effect].max, detail.value);
        result[effect].logs.push(detail);
        if (detail.isCritical) result[effect].criticalCount++;
    }
    result = Object.values(result).sort((a, b) => b.value - a.value);
    //计算结果->给表格展示的数据
    for (let res of result) {
        res.criticalRate = (res.criticalCount / res.count) * 100;
        res.valueRate = (res.value / source.value.value) * 100;
        res.avg = res.value / res.count;
    }
    data.value = result;
};
const rowClass = ({ row }) => {
    return row.effect === effect.value ? "is-focus" : "";
};
const selectSkill = (row) => {
    if (effect.value === row.effect) {
        effect.value = null;
        logs.value = [];
        detail.value = null;
    } else {
        effect.value = row.effect;
        logs.value = row.logs;
        logs.value.forEach((item, index) => {
            item.index = index + 1;
        });
        detail.value = logs.value[0];
    }
};
const sortSkill = ({ prop, order }) => {
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
const selectLog = (row) => {
    detail.value = row;
};
const logRowClass = ({ row }) => {
    return row.index === detail.value.index ? "is-focus" : "";
};
//watch
watch(
    [source, entity],
    () => {
        updateData();
    },
    {
        immediate: true,
    }
);
</script>

<style lang="less">
.m-compare-view {
    --compare-view-color-primary-1: #1474c3;
    --compare-view-color-secondary-1: #2b4b66;
    --compare-view-color-primary-2: #a50852;
    --compare-view-color-secondary-2: #633d4f;

    &.u-index-1 {
        .u-overview {
            border: 4px solid var(--compare-view-color-primary-1);
        }

        .u-card {
            background: var(--compare-view-color-secondary-1);
        }

        .u-table .el-table__header-wrapper {
            background-color: var(--compare-view-color-primary-1);
        }
    }

    &.u-index-2 {
        .u-overview {
            border: 4px solid var(--compare-view-color-primary-2);
        }

        .u-card {
            background: var(--compare-view-color-secondary-2);
        }

        .u-table .el-table__header-wrapper {
            background-color: var(--compare-view-color-primary-2);
        }

        .u-skill-more {
            flex-direction: row-reverse;
        }
    }

    .u-overview {
        .size(710px, 89px);
        padding: 0 30px;
        background: #24292e;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: space-evenly;

        .u-overview-item {
            .fz(14px, 18px);
            .bold;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: white;
        }
    }

    .u-skills {
        .mt(20px);
        height: 400px;
    }

    .u-skills .u-table {
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

    .u-compare-table {
        flex-grow: 1;
    }

    .u-skill-logs {
        .size(360px, 440px);
    }

    .u-skill-more {
        display: flex;
        gap: 20px;
        .mt(20px);

        .w-card {
            padding-bottom: 5px;
        }

        .u-table {
            flex-grow: 1;
        }

        .w-pagination {
            justify-content: center;
        }
    }

    .u-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        .size(330px, 440px);
        padding: 20px 20px 0 20px;
        border-radius: 20px;

        .u-card-title {
            .fz(14px, 18px);
            color: #b3b3b3;
            margin: 0;
        }

        & > .u-top {
            flex-shrink: 0;
            height: 200px;
        }

        & > .w-card {
            flex-grow: 1;
            border-radius: 20px 20px 0 0;
            padding: 10px 10px 5px 10px;
        }
    }

    .u-effect-infos {
        .bold;
        .fz(14px, 24px);
        .color(white);
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 10px 0;
        height: 200px;

        .u-effect-info {
            display: flex;
            align-items: center;
            .ellipsis;

            img {
                .size(24px);
                .mr(8px);
            }
        }
    }

    .u-buff-list {
        flex-grow: 1;
        display: flex;
        align-content: flex-start;
        flex-wrap: wrap;
        gap: 10px;
        color: #b3b3b3;
        .fz(12px, 16px);
        .bold;
        .u-buff {
            .size(120px, 18px);
            flex-grow: 1;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            position: relative;
            white-space: nowrap;

            .u-buff-icon {
                .size(24px);
                .mr(4px);
                display: block;
            }

            .u-buff-stack {
                position: absolute;
                left: 14px;
                top: 10px;
                color: white;
            }

            .u-buff-name {
                .ellipsis;
            }
        }
    }
}
</style>
