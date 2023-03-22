<template>
    <div class="m-entity-skill-chart">
        <v-chart v-if="categories.length" autoresize theme="dark" :option="option"></v-chart>
        <span class="u-empty" v-else>请在下方选择需要查看的技能</span>
    </div>
</template>

<script setup>
import VChart from "vue-echarts";

import { computed, toRefs } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { getResource } from "@/utils/common";

const store = useStore();
const { entity, selectedSkills } = toRefs(usePve());

const data = computed(() => {
    const source = store.result.skill?.[entity.value]?.logs;
    if (!source) return [];
    const result = {};
    const idNameMap = {};
    for (let log of source) {
        if (!idNameMap[log.id]) {
            const name = getResource("skill:" + log.id).name;
            if (!name) continue;
            idNameMap[log.id] = name;
        }
        const name = idNameMap[log.id];
        const selectedSkill = selectedSkills.value[name];
        if (!selectedSkill || !selectedSkill.stat.includes(log.skillType)) continue;
        if (!result[name]) {
            result[name] = {
                color: selectedSkill.color,
                name: name,
                cast: 0,
                hit: 0,
                miss: 0,
                count: 0,
                interval: 0,
                _last: 0,
            };
        }
        result[name][log.skillType]++;
        result[name].count++;
        if (result[name].count != 0) {
            result[name].interval =
                (result[name].interval * (result[name].count - 1) + (log.time - result[name]._last)) /
                result[name].count;
            result[name]._last = log.time;
        }
    }
    return Object.values(result);
});
const categories = computed(() => data.value.map((d) => d.name));
const yData = computed(() =>
    data.value.map((d) => {
        return {
            value: d.count,
            hit: d.hit,
            cast: d.cast,
            miss: d.miss,
            interval: d.interval,
            itemStyle: {
                color: d.color,
            },
        };
    })
);
const option = computed(() => ({
    backgroundColor: "transparent",
    grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
    },
    tooltip: {
        trigger: "axis",
        formatter: function ([{ name, data }]) {
            return `${name}<br/>
            总次数：${data.value}<br/>
            施法：${data.cast}<br/>
            命中：${data.hit}<br/>
            偏离：${data.miss}<br/>
            平均间隔：${data.interval.toFixed(2)}s`;
        },
    },
    xAxis: {
        type: "category",
        data: categories.value,
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            data: yData.value,
            barMaxWidth: 40,
            type: "bar",
        },
    ],
}));
</script>

<style lang="less" scoped>
.m-entity-skill-chart {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .u-empty {
        color: #b3b3b3;
        .fz(14px, 18px);
        .bold;
    }
}
</style>
