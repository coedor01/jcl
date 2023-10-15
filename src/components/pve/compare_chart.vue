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

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import VChart from "vue-echarts";

import { ref, computed, watch, onMounted, toRefs } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import getWorkerResponse from "@/utils/worker";
import { cloneDeep, debounce } from "lodash-es";

const loading = ref(false);
const xData = ref([]);
const yData = ref([]);

const { compareEntity, compareMode, compareTimeRange } = toRefs(usePve());
const { end: _end } = useStore().result;

const option = computed(() => ({
    backgroundColor: "transparent",
    tooltip: {
        trigger: "axis",
        order: "valueDesc",
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
    series: yData.value,
}));

const updateData = async () => {
    loading.value = true;
    const result = await getWorkerResponse("get_pve_compare_chart", {
        compareEntity: cloneDeep(compareEntity.value),
        compareMode: compareMode.value,
    });
    xData.value = result.xData;
    yData.value = result.yData;
    loading.value = false;
    compareTimeRange.value = [0, endMicro.value];
};

const endMicro = computed(() => _end?.micro || 0);
const handleDatazoom = debounce(
    (e) => {
        const { start, end } = e;
        compareTimeRange.value = [(start * endMicro.value) / 100, (end * endMicro.value) / 100];
    },
    500,
    { leading: true }
);

watch(compareEntity, updateData, { immediate: true, deep: true, flush: "post" });
watch(compareMode, updateData, { immediate: true, flush: "post" });

onMounted(updateData);
</script>

<style lang="less">
.m-compare-chart {
    flex-grow: 1;

    .u-chart {
        flex-grow: 1;
    }
}
</style>
