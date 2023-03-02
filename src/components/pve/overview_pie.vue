<template>
    <div class="m-overview-pie">
        <v-chart ref="echart" :option="option" autoresize @selectchanged="handleSelect" />
    </div>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";

import { ref, provide, inject, watch } from "vue";
import { pick } from "lodash-es";
import { useStore } from "@/store";

const store = useStore();
use([CanvasRenderer, PieChart, TooltipComponent]);
provide(THEME_KEY, "dark");

const statType = inject("statType");
const focusEntities = inject("focusEntities");

// data
const data = ref([]);
const option = ref({
    tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
    },
    backgroundColor: "#131517",
    series: [
        {
            name: "数值占比",
            type: "pie",
            radius: ["45%", "65%"],
            center: ["50%", "50%"],
            data: data.value,
            selectedMode: "multiple",
        },
    ],
});
const echart = ref(null);
const updateData = () => {
    const { entities, stats } = store.result;
    let result = [];
    let total = 0;
    const source = stats?.[statType.value];
    for (let entity in source) {
        total += source[entity].all.value;
        let _data = {
            ...pick(entities[entity], ["id", "name", "color"]),
            value: source[entity].all.value,
        };
        if (!_data.name) _data.name = "#" + _data.id;
        result.push(_data);
    }
    result = result.filter((x) => x.value / total > 0.02);
    data.value = result;
    option.value.series[0].data = result;
    syncSelected();
};
// 同步选中状态相关
const syncing = ref(false);
const syncSelected = () => {
    syncing.value = true;
    if (!echart.value) {
        syncing.value = false;
        return;
    }
    for (let d of data.value) {
        if (focusEntities.value.includes(d.id)) {
            echart.value.dispatchAction({
                type: "select",
                dataIndex: data.value.indexOf(d),
            });
        } else {
            echart.value.dispatchAction({
                type: "unselect",
                dataIndex: data.value.indexOf(d),
            });
        }
    }
    syncing.value = false;
};
const handleSelect = ({ selected }) => {
    if (syncing.value) return;
    if (selected.length === 0) {
        focusEntities.value = [];
        return;
    }
    selected = selected[0].dataIndex;
    focusEntities.value = selected.map((x) => data.value[x].id);
};
// 统计类型变化，分析结果变化时更新数据
watch(
    [() => store.result, statType],
    () => {
        updateData();
    },
    { immediate: true }
);
// focusEntities变化时同步选中状态
watch(
    () => focusEntities.value,
    () => {
        if (syncing.value) return;
        syncSelected();
    },
    { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
.m-overview-pie {
    background: #131517;
    border-radius: 20px;
    .size(420px, 420px);
}
</style>
