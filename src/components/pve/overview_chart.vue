<template>
    <div class="m-overview-chart">
        <v-chart ref="echart" theme="dark" :option="option" autoresize @legendselectchanged="handleSelect" />
    </div>
</template>

<script setup>
import VChart from "vue-echarts";
import { computed, toRefs } from "vue";
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";

const store = useStore();
const global = useGlobal();

const { focusEntities, statType } = toRefs(global);

// 被选中的人的名字
const focusNames = computed(() => {
    const { entities } = store.result;
    return focusEntities.value.map((x) => {
        const entity = entities[x];
        return entity.name ?? "#" + entity.id;
    });
});
// 横轴数据
const xData = computed(() => {
    let result = [];
    const { end } = store.result;
    if (!end) return result;
    let max = Math.ceil(end.sec / 5) * 5;
    let min = 0;
    while (min <= max) {
        result.push(min);
        min += 5;
    }
    return result;
}, [store.result]);
// 纵轴数据
const yData = computed(() => {
    let result = {};
    const defaultSeries = {
        type: "line",
        smooth: true,
        showSymbol: false,
    };
    const { entities, stats } = store.result;
    const source = stats?.[statType.value];
    if (!source) return [];
    // 已有数据的统计
    for (let id in source) {
        const { name, color } = entities[id];
        if (!name || id == 0) continue;
        if (result[name]) {
            // 同名单位，合并数据
            let newData = [];
            for (let x of xData.value) newData.push(result[name].data[x] + source[id].windows[x]?.value ?? 0);
            result[name].data = newData;
            result[name].total += source[id].all.value;
        } else {
            // 新单位，纳入统计
            let newData = [];
            for (let x of xData.value) newData.push(source[id].windows[x]?.value ?? 0);
            result[name] = {
                ...defaultSeries,
                itemStyle: { color },
                name,
                data: newData,
                total: source[id].all.value,
            };
        }
    }
    result = Object.values(result).filter((item) => item.data.some((v) => v > 0));
    // 全局统计
    let r = {
        ...defaultSeries,
        name: "【全局】",
        data: [],
    };
    let datas = result.map((item) => item.data);
    for (let i = 0; i < xData.value.length; i++) {
        let sum = 0;
        for (let d of datas) {
            if (Number(d[i])) sum += d[i];
        }
        r.data.push(sum);
    }
    result.unshift(r);
    result.sort((a, b) => b.total - a.total);
    return result;
}, [store.result, statType]);
// legend的名字
const legendNames = computed(() => {
    return yData.value.map((x) => x.name);
}, [yData]);
// 图标的option
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
        series: yData.value,
    };
}, [xData, yData, focusNames]);

const handleSelect = ({ name, selected }) => {
    const { entities } = store.result;
    const ids = Object.values(entities)
        .filter((x) => x.name === name)
        .map((x) => x.id);
    if (selected[name] === true) {
        focusEntities.value.push(...ids);
    } else {
        focusEntities.value = focusEntities.value.filter((x) => !ids.includes(x));
    }
};
</script>

<style lang="less" scoped>
.m-overview-chart {
    flex: 1;
}
</style>
