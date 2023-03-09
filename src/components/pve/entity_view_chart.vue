<template>
    <div class="m-entity-chart">
        <div class="u-chart">
            <v-chart ref="echart" theme="dark" :option="option" autoresize />
        </div>
        <div class="u-overview">
            <span v-if="overview.name" class="u-overview-item">{{ overview.name }}</span>
            <span class="u-overview-item">ID {{ overview.id }}</span>
            <span class="u-overview-item">参战时长 {{ displayDuration(overview.duration) }}</span>
            <span class="u-overview-item">总次数 {{ overview.count || "-" }}</span>
            <span class="u-overview-item">总数值 {{ overview.value || "-" }}</span>
            <span class="u-overview-item">每秒数值 {{ displayDigits(overview.vps) }}</span>
            <span class="u-overview-item">会心率 {{ displayPercent(overview.critRate) }}</span>
        </div>
    </div>
</template>

<script setup>
import { graphic } from "echarts/core";
import VChart from "vue-echarts";

import { computed, toRefs } from "vue";
import { displayDuration, displayDigits, displayPercent, getEntityColor } from "@/utils/common";
import { pick } from "lodash-es";
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";
const store = useStore();

const { entity, entityTab } = toRefs(useGlobal());

const overview = computed(() => {
    const { entities, stats, end } = store.result;
    const entityObj = entities[entity.value];
    let result = { ...pick(entityObj, ["name", "id"]) };
    const stat = stats[entityTab.value];
    const source = stat[entity.value]?.all;
    if (!source) return result;
    const duration = end.sec;
    const vps = source.value / duration;
    const critRate = source.criticalCount / source.count;
    const displayValue = source.value ? source.value.toLocaleString() : "-";
    return {
        ...result,
        ...pick(source, ["count"]),
        value: displayValue,
        duration,
        vps,
        critRate,
    };
}, [store.result]);

const entityColor = computed(() => getEntityColor(entity.value));
// 横轴数据
const chartData = computed(() => {
    const source = store.result.stats?.[entityTab.value]?.[entity.value]?.windows;
    const { end } = store.result;
    if (!source) return [];
    // 构造横轴
    let xData = [];
    let max = Math.ceil(end.sec / 5) * 5;
    let min = 0;
    while (min <= max) {
        xData.push(min);
        min += 5;
    }
    // 构造纵轴
    let yData = [];
    for (let x of xData) {
        let y = source[x]?.value / 5 || 0;
        yData.push(y);
    }
    return { xData, yData };
}, [store.result]);
const option = computed(() => {
    return {
        grid: {
            x: 80,
            y: 40,
            x2: 40,
            y2: 40,
        },
        backgroundColor: "transparent",
        tooltip: {
            trigger: "axis",
            formatter: `每秒数值: {c}`,
            position: function (pt) {
                return [pt[0], 0.1];
            },
        },
        xAxis: {
            type: "category",
            boundaryGap: [0.1, 0.1],
            data: chartData.value.xData,
            triggerEvent: true,
        },
        yAxis: {
            type: "value",
            boundaryGap: [0, 0.2],
        },
        series: [
            {
                type: "line",
                smooth: true,
                sampling: "lttb",
                showSymbol: false,
                itemStyle: {
                    color: entityColor.value,
                },
                areaStyle: {
                    color: new graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: `${entityColor.value}66`,
                        },
                        {
                            offset: 1,
                            color: `${entityColor.value}ff`,
                        },
                    ]),
                },
                data: chartData.value.yData,
            },
        ],
    };
});
</script>

<style lang="less" scoped>
.m-entity-chart {
    flex-grow: 1;
    gap: 20px;
    display: flex;
    flex-direction: column;

    .u-chart {
        flex-grow: 1;
    }
    .u-overview {
        display: flex;
        align-items: center;
        justify-content: space-around;
        color: #8b96a2;
        .fz(14px, 18px);
    }
}
</style>
