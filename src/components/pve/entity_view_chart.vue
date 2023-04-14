<template>
    <div class="m-entity-chart" v-loading="loading">
        <div v-if="xData.length === 0" class="u-empty-tip">该单位没有相关数据</div>
        <template v-else>
            <div class="u-chart">
                <v-chart ref="echart" theme="dark" :option="option" autoresize @click="handleChartClick" />
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
        </template>
    </div>
</template>

<script setup>
import { graphic } from "echarts/core";
import VChart from "vue-echarts";

import { computed, toRefs, ref, watch } from "vue";
import { getEntityColor } from "@/utils/common";
import { displayDuration, displayDigits, displayPercent } from "@/utils/commonNoStore";
import { usePve } from "@/store/pve";
import getWorkerResponse from "@/utils/worker";

const { entity, entityTab, currentWindow } = toRefs(usePve());

const entityColor = computed(() => getEntityColor(entity.value));

// 图表数据处理、更新
const loading = ref(false);
const overview = ref([]);
const xData = ref([]);
const yData = ref([]);
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
            data: xData.value,
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
                data: yData.value,
            },
        ],
    };
});
const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_pve_entity_stat_chart", {
        entity: entity.value,
        entityTab: entityTab.value,
    }).then((data) => {
        xData.value = data.xData;
        yData.value = data.yData;
        overview.value = data.overview;
        loading.value = false;
    });
};
watch([entity, entityTab], updateData, { immediate: true, flush: "post" });

// 表格点击事件
const handleChartClick = (e) => {
    if (e.targetType == "axisLabel") {
        currentWindow.value = e.value;
    } else if (e.componentSubType == "line") {
        currentWindow.value = xData.value[e.dataIndex];
    }
};
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

    .u-empty-tip {
        flex-grow: 1;
        .flex-center;
        .bold;
        color: #b3b3b3;
    }
}
</style>
