<template>
    <div class="m-overview-pie">
        <v-chart ref="echart" theme="dark" :option="option" autoresize @selectchanged="handleSelect" />
        <div class="u-label" v-if="rate" :style="`transform: scale(${1 + rate / 100});`">
            {{ displayPercent(rate) }}
        </div>
    </div>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import VChart from "vue-echarts";

import { ref, watch, toRefs, computed } from "vue";
import { pick } from "lodash-es";
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";
import { displayPercent } from "@/utils/common";

const store = useStore();
const global = useGlobal();
use([CanvasRenderer, PieChart, TooltipComponent]);

const { statType, focusEntities } = toRefs(global);

// data
const data = ref([]);
const total = ref(0);
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
    let _total = 0;
    const source = stats?.[statType.value];
    for (let entity in source) {
        _total += source[entity].all.value;
        let _data = {
            ...pick(entities[entity], ["id", "name", "color"]),
            value: source[entity].all.value,
        };
        if (!_data.name) _data.name = "#" + _data.id;
        result.push(_data);
    }
    result = result.filter((x) => x.value / _total > 0.02);
    total.value = _total;
    data.value = result;
    option.value.series[0].data = result;
    syncSelected();
};
// 计算属性：当前选中的部分占用份额
const rate = computed(() => {
    const { stats } = store.result;
    const source = stats?.[statType.value];
    if (!source) return 0;
    let value = 0;
    for (let entity of focusEntities.value) {
        const d = source[entity]?.all;
        if (!d) continue;
        value += d.value;
    }
    return (value / total.value) * 100;
});
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
    focusEntities,
    () => {
        if (syncing.value) return;
        syncSelected();
    },
    { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
.m-overview-pie {
    .flex-center;
    background: #131517;
    border-radius: 20px;
    padding: 10px;
    .size(400px, 400px);
    .pr;

    .u-label {
        .pa;
        transition: all 0.2s ease-in-out;
    }
}
</style>
