<template>
    <div class="m-compare-chart w-card" v-loading="loading">
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
                <v-chart ref="echart" theme="dark" :option="option" autoresize @datazoom="handleDatazoom" />
            </div>
        </template>
    </div>
</template>

<script>
import VChart from "vue-echarts";

import EmptyGuide from "@/components/common/empty_guide.vue";

import { mapState } from "pinia";
import { usePve } from "@/store/pve";
import { useStore } from "@/store";
import getWorkerResponse from "@/utils/worker";
import { cloneDeep, debounce } from "lodash-es";

export default {
    name: "CompareChart",
    components: {
        VChart,
        EmptyGuide,
    },
    data: () => ({
        loading: false,
        xData: [],
        yData: [],
    }),
    computed: {
        ...mapState(usePve, ["compareEntity", "compareMode", "compareTimeRange"]),
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
    methods: {
        updateData() {
            this.loading = true;
            getWorkerResponse("get_pve_compare_chart", {
                compareEntity: cloneDeep(this.compareEntity),
                compareMode: this.compareMode,
            }).then((result) => {
                this.xData = result.xData;
                this.yData = result.yData;
                this.loading = false;
                const {
                    result: { end },
                } = useStore();
                usePve().compareTimeRange = [0, end.sec + 1];
            });
        },
        handleDatazoom: debounce(
            (e) => {
                const { start, end } = e;
                usePve().compareTimeRange = [start, end];
            },
            500,
            { leading: true }
        ),
    },
    watch: {
        compareEntity: {
            handler() {
                this.updateData();
            },
            immediate: true,
            deep: true,
            flush: "post",
        },
        compareMode: {
            handler() {
                this.updateData();
            },
            immediate: true,
            flush: "post",
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
