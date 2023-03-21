<template>
    <div class="m-entity-buff-chart w-card">
        <div class="w-card-title">
            <span>时间轴</span>
            <span class="u-entity-infos">
                <span class="u-entity-info">{{ getEntityName(entity) }}</span>
                <span class="u-entity-info">ID {{ entity }}</span>
                <span class="u-entity-info">参战时长 {{ displayDuration(end.sec) }}</span>
            </span>
        </div>
        <div class="u-chart">
            <v-chart v-if="items.length" autoresize theme="dark" :option="option" class="u-chart"></v-chart>
            <span v-else class="u-empty">上侧选择需要查看的BUFF</span>
        </div>
    </div>
</template>

<script setup>
import { graphic } from "echarts/core";
import VChart from "vue-echarts";
import { displayDuration, getEntityName, getRandomColor, getResource, getResourceName } from "@/utils/common";
import { toRefs, computed } from "vue";
import { usePve } from "@/store/pve";
import { useStore } from "@/store";

const store = useStore();
const { entity, selectedBuffs } = toRefs(usePve());
const { end } = store.result;

const renderItem = (params, api) => {
    let children = [];
    // 绘制矩形
    const categoryIndex = api.value(3);
    const start = api.coord([api.value(1), categoryIndex]);
    const end = api.coord([api.value(2), categoryIndex]);
    const itemHeight = Math.min(api.size([0, 1])[1] * 0.6, 30);
    const visibleRect = params.coordSys;
    const rectShape = graphic.clipRectByRect(
        {
            x: start[0],
            y: start[1] - itemHeight / 2,
            width: end[0] - start[0],
            height: itemHeight,
        },
        visibleRect
    );
    children.push({
        type: "rect",
        shape: rectShape,
        style: {
            fill: api.visual("color"),
        },
    });
    // 根据stackLogs在矩形上绘制层数变化
    const stackLogs = JSON.parse(api.value(4));
    let lastLeft = Number.MIN_SAFE_INTEGER;
    for (let time in stackLogs) {
        const point = api.coord([time, categoryIndex]);
        const showText = point[0] > visibleRect.x && point[0] < visibleRect.x + visibleRect.width;
        if (showText && point[0] - lastLeft > 12) {
            lastLeft = point[0];
            children.push({
                type: "text",
                style: {
                    text: stackLogs[time],
                    x: point[0] + 3.5,
                    y: point[1] + 10,
                    textAlign: "center",
                    textVerticalAlign: "middle",
                    textShadowColor: "#000",
                    textShadowBlur: 2,
                    fill: "#fff",
                },
            });
        }
    }
    // 如果是被驱散的在矩形后面绘制icon
    const isDelete = api.value(5);
    const showDelete = end[0] > visibleRect.x && end[0] < visibleRect.x + visibleRect.width;
    if (isDelete && showDelete) {
        children.push({
            type: "text",
            style: {
                text: "〰",
                x: end[0] + 3.5,
                y: end[1],
                textAlign: "center",
                textVerticalAlign: "middle",
                textShadowColor: "#000",
                textShadowBlur: 2,
                fill: "#fff",
            },
        });
    }
    return {
        type: "group",
        diffChildrenByName: true,
        children,
    };
};

const data = computed(() => {
    const colorGenerator = getRandomColor();
    const source = store.result.buff?.[entity.value] || {};
    let result = [];
    for (let id of selectedBuffs.value) {
        let buffLogs = source[id]?.logs;
        if (!buffLogs) continue;
        result.push({
            info: {
                key: id,
                color: colorGenerator.next().value,
                ...getResource("buff:" + id),
            },
            times: buffLogs,
        });
    }
    return result;
});
const categories = computed(() => {
    return data.value.map((item) => getResourceName("buff:" + item.info.key));
});
const items = computed(() => {
    let result = [];
    let index = 0;
    for (let { info, times } of data.value) {
        for (let time of times) {
            const isDelete = time.end != time.shouldEnd && time.end != end.micro;
            result.push({
                index,
                name: getResourceName("buff:" + info.key),
                value: [info.key, time.start, time.end, index, JSON.stringify(time.stackLogs), isDelete],
                detail: time,
                itemStyle: {
                    color: info.color,
                },
            });
        }
        index++;
    }
    return result;
});
const option = computed(() => ({
    backgroundColor: "transparent",
    theme: "dark",
    tooltip: {
        formatter: function (params) {
            let { detail } = params.data;
            const duration = ((detail.end - detail.start) / 1000).toFixed(1);
            const start = (detail.start / 1000).toFixed(1);
            const end = (detail.end / 1000).toFixed(1);
            return `${params.marker} ${params.name} <br />
                            BUFF来源: ${getEntityName(detail.source)} <br />
                            ${detail.deleteBy ? `BUFF卸除者: ${getEntityName(detail.deleteBy)} <br />` : ""}
                            开始时间: ${start} 秒 <br />
                            结束时间: ${end} 秒 <br />
                            BUFF持续时间: ${duration} 秒`;
        },
    },
    dataZoom: [
        {
            type: "slider",
            filterMode: "weakFilter",
            showDataShadow: false,
            labelFormatter: "",
        },
        {
            type: "inside",
            filterMode: "weakFilter",
        },
    ],
    xAxis: {
        min: end.sec,
        scale: true,
        position: "top",
        axisLabel: {
            formatter: function (val) {
                return (val / 1000).toFixed(1) + " s";
            },
        },
    },
    yAxis: {
        data: categories.value,
        axisTick: {
            show: false,
        },
    },
    series: [
        {
            type: "custom",
            renderItem,
            itemStyle: {
                opacity: 0.8,
            },
            encode: {
                x: [1, 2],
                y: 0,
            },
            data: items.value,
        },
    ],
}));
</script>

<style lang="less" scoped>
.m-entity-buff-chart {
    height: 800px;

    .u-entity-infos {
        .ml(8px);

        .fz(14px, 18px);
        .bold;
        color: #8b96a2;

        .u-entity-info {
            .mr(24px);
        }
    }

    .u-chart {
        flex-grow: 1;
        .flex-center;
    }

    .u-empty {
        color: #b3b3b3;
        .fz(14px, 18px);
        .bold;
    }
}
</style>
