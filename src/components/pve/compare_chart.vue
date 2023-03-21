<template>
    <div class="m-compare-chart w-card">
        <template v-if="yData.length === 0">
            <empty-guide
                :rotate="-90"
                position="flex-start"
                to="row"
                text-align="left"
                :tips="['在左侧选择单位后', '此处会展示单位的数值曲线']"
                :grow="false"
            ></empty-guide>
        </template>
        <template v-else>
            <div class="w-card-title">伤害曲线</div>
            <div class="u-chart">
                <v-chart ref="echart" theme="dark" :option="option" autoresize />
            </div>
        </template>
    </div>
</template>

<script>
import VChart from "vue-echarts";

import EmptyGuide from "@/components/common/empty_guide.vue";

import { mapState } from "pinia";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { getEntityColor, getEntityName } from "@/utils/common";

export default {
    name: "CompareChart",
    components: {
        VChart,
        EmptyGuide,
    },
    data() {
        return {};
    },
    computed: {
        ...mapState(usePve, ["compareEntity", "compareMode"]),
        ...mapState(useStore, ["result"]),
        xData() {
            let result = [];
            const end = this.result?.end?.sec ?? 180;
            const max = Math.ceil(end / 5) * 5;
            let min = 0;
            while (min <= max) {
                result.push(min);
                min += 5;
            }
            return result;
        },
        yData() {
            const defaultSeries = {
                type: "line",
                smooth: true,
                showSymbol: false,
            };
            const result = [];
            const type = this.compareMode;
            const source = this.result?.stats?.[type];
            for (let id of this.compareEntity) {
                if (!id) continue;
                const name = getEntityName(id);
                const color = getEntityColor(id);
                let data = [];
                const windows = source?.[id]?.windows;
                for (let x of this.xData) {
                    data.push(windows?.[x]?.value ?? 0);
                }
                result.push({
                    name,
                    data,
                    ...defaultSeries,
                    itemStyle: { color },
                });
            }
            return result;
        },
        option() {
            return {
                backgroundColor: "transparent",
                tooltip: {
                    trigger: "axis",
                    order: "valueDesc",
                },
                xAxis: {
                    type: "category",
                    boundaryGap: [0.1, 0.1],
                    data: this.xData,
                    triggerEvent: true,
                },
                yAxis: {
                    type: "value",
                    boundaryGap: [0, 0.2],
                },
                dataZoom: [
                    {
                        type: "inside",
                        start: 0,
                        end: 100,
                    },
                    {
                        start: 0,
                        end: 100,
                    },
                ],
                series: this.yData,
            };
        },
    },
};
</script>

<style lang="less">
.m-compare-chart {
    flex-grow: 1;

    .u-chart {
        flex-grow: 1;
    }
}
</style>
