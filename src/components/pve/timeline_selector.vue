<template>
    <div class="m-timeline-selectors w-card" v-loading="loading">
        <div class="w-card-title">筛选器</div>
        <div class="w-tabs">
            <div
                class="u-tab"
                v-for="(filter, index) in filterList"
                :key="index"
                :class="{ 'is-active': filters.includes(filter.name) }"
                @click="switchFilter(filter.name)"
            >
                {{ filter.title }}
            </div>
        </div>
        <div class="w-card-title">时间轴绘制设置</div>
        <el-table class="u-table" :data="currentData" :border="false" @cell-click="click" :show-header="false">
            <el-table-column label="选择" :width="80">
                <template #default="{ row }">
                    <div class="u-check-icon">
                        <img
                            v-if="selectedTimeline[row.name].stat.includes('select')"
                            src="@/assets/img/common/checked.svg"
                            draggable="false"
                        />
                        <img v-else draggable="false" src="@/assets/img/common/check.svg" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="内容" :width="200">
                <template #default="{ row }">
                    <span :title="`${row.name}`">{{ row.name.split(":")[1] }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            class="w-pagination"
            small
            background
            layout="pager"
            :page-size="pageSize"
            :total="total"
            :hide-on-single-page="true"
            :current-page="currentPage"
            @update:currentPage="currentPage = $event"
        ></el-pagination>
    </div>
</template>

<script setup>
import { usePve } from "@/store/pve";
import { usePaginate } from "@/utils/uses/usePaginate";
import { toRefs, ref, toRaw, watch } from "vue";
import getWorkerResponse from "@/utils/worker";
import { useRoute } from "vue-router";

const { selectedTimeline, timeline_filters } = toRefs(usePve());
const filters = ref(["say", "template", "skill"]);
const loading = ref(false);
const data = ref([]);
const pageSize = ref(22);
const { currentPage, currentData, total } = usePaginate(data, pageSize);

// 单位过滤器相关

const filterList = [
    {
        name: "say",
        title: "喊话",
    },
    {
        name: "template",
        title: "模板",
    },
    {
        name: "skill",
        title: "技能",
    },
];
const switchFilter = (filter) => {
    if (filters.value.includes(filter)) {
        filters.value = filters.value.filter((f) => f !== filter);
        timeline_filters.value[filter] = false;
    } else {
        filters.value.push(filter);
        timeline_filters.value[filter] = true;
    }
};

// 获取可供选择的数据
const updateData = () => {
    loading.value = true;
    getWorkerResponse("timeline_selector", { filter: toRaw(timeline_filters.value) }).then((result) => {
        data.value = result.data;

        const _selected = result.selectedTimeline;
        for (let d of data.value) _selected[d.name].stat = ["select"];
        selectedTimeline.value = _selected;
        loading.value = false;
    });
};

// 处理用户选中/取消选中
const click = (row, column) => {
    const skill = selectedTimeline.value[row.name];
    const columnIndex = column.no;
    if (columnIndex === 0) {
        // 点名字全选/全取消
        if (skill.stat.length) {
            skill.stat = [];
        } else {
            skill.stat = ["select"];
        }
    } else {
        const type = {
            1: "select",
        }[columnIndex];
        if (skill.stat.includes(type)) {
            skill.stat = skill.stat.filter((item) => item !== type);
        } else {
            skill.stat.push(type);
        }
    }
};
const route = useRoute();
watch(
    () => route.fullPath,
    () => {
        timeline_filters.value = { skill: true, template: true, say: true };
        updateData();
    }
);

watch(
    timeline_filters,
    () => {
        updateData();
    },
    { immediate: true, deep: true }
);
</script>

<style lang="less">
.m-timeline-selectors {
    .size(280px, 882px);
    border: 1px solid #2d3236;
    flex-shrink: 0;

    .u-tab {
        display: flex-grow;
        width: 50px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        &.selected {
            border-bottom-color: #409eff;
            color: #409eff;
        }
    }

    .u-table {
        flex-grow: 1;
        .el-table__row {
            cursor: pointer;
        }
        .u-check-icon {
            display: flex;
            justify-content: center;
            align-items: center;

            img {
                width: 24px;
                height: 24px;
            }
        }
    }
}
</style>
