<template>
    <div class="m-overview-chart" v-loading="loading">
        <v-chart
            ref="echart"
            theme="dark"
            :option="option"
            autoresize
            @legendselectchanged="handleSelect"
            @datazoom="handleDatazoom"
        />
    </div>
</template>

<script setup>
import VChart from "vue-echarts";
import { computed, ref, toRefs, watchPostEffect } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import getWorkerResponse from "@/utils/worker";
import { debounce } from "lodash-es";

const {
    result: { end: _end },
} = useStore();
const { focusEntities, statType, timeRange } = toRefs(usePve());

// 被选中的人的名字
const focusNames = computed(() => {
    const { entities } = useStore().result;
    return focusEntities.value.map((x) => {
        const entity = entities[x];
        if (!entity) return "未知单位";
        return entity.name ?? "#" + entity.id;
    });
});
const loading = ref(false);
const xData = ref([]);
const yData = ref([]);
// legend的名字
const legendNames = computed(() => {
    return yData.value?.map((x) => x.name) || [];
}, [yData]);
// 图的option
const option = computed(() => {
    return {
        tooltip: {
            trigger: "axis",
            order: "valueDesc",
        },
        legend: {
            show: true,
            icon: "roundRect",
            type: "scroll",
            orient: "horizontal",
            bottom: 0,
            data: legendNames.value,
            selected: legendNames.value.reduce((obj, name) => {
                if (focusEntities.value.length === 0) {
                    if (name === "【全局】") obj[name] = true;
                    else obj[name] = false;
                } else {
                    if (focusNames.value.includes(name)) obj[name] = true;
                    else obj[name] = false;
                }
                return obj;
            }, {}),
        },
        backgroundColor: "#131517",
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
        dataZoom: [
            {
                type: "slider",
                filterMode: "filter",
                top: 10,
            },
        ],
        series: yData.value,
        grid: {
            right: 8,
        },
    };
}, [xData, yData, focusNames]);

const handleSelect = ({ name, selected }) => {
    const { entities } = useStore().result;
    const ids = Object.values(entities)
        .filter((x) => x.name === name)
        .map((x) => x.id);
    if (selected[name] === true) {
        focusEntities.value.push(...ids);
    } else {
        focusEntities.value = focusEntities.value.filter((x) => !ids.includes(x));
    }
};

// 缩放/时间范围逻辑
const endMicro = computed(() => _end?.micro || 0);
const handleDatazoom = debounce(
    (e) => {
        const { start, end } = e;
        timeRange.value = [(start * endMicro.value) / 100, (end * endMicro.value) / 100];
    },
    500,
    { leading: true }
);

// 数据更新逻辑
const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_pve_overview_chart", { statType: statType.value }).then((data) => {
        xData.value = data.xData;
        yData.value = data.yData;
        loading.value = false;
        timeRange.value = [0, endMicro.value];
    });
};
watchPostEffect(updateData);
</script>

<style lang="less" scoped>
.m-overview-chart {
    flex: 1;
}
</style>
