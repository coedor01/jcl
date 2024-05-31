<template>
    <div class="m-blame-filters">
        <div class="w-card u-filters">
            <div class="w-card-title">筛选器</div>
            <div class="w-tabs">
                <div
                    class="u-tab"
                    v-for="(filter, index) in filterList"
                    :key="index"
                    :class="{ 'is-active': filters[filter.name] }"
                    @click="filters[filter.name] = !filters[filter.name]"
                >
                    {{ filter.title }}
                </div>
            </div>
        </div>
        <div class="w-card u-menu">
            <div class="w-card-title">事件列表</div>
            <div class="u-event-list">
                <el-table class="u-table" :data="data" :border="false" @row-click="clickBlameEvent">
                    <el-table-column label="时间" width="80">
                        <template #default="{ row }">
                            <span>{{ row.time }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="玩家">
                        <template #default="{ row }">
                            <jcl-entity :entity="row.playerId"></jcl-entity>
                        </template>
                    </el-table-column>
                    <el-table-column label="事件" width="80">
                        <template #default="{ row }">
                            <span>{{ row.event }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toRefs, onMounted } from "vue";
import { usePve } from "@/store/pve";
import JclEntity from "../common/jcl_entity.vue";

const props = defineProps({
    data: Array,
});
const { data } = toRefs(props);

// 单位过滤器相关
const filters = toRefs(usePve()).blame_filters;
const filterList = [
    {
        name: "death",
        title: "重伤",
    },
    {
        name: "buff",
        title: "非正常BUFF",
    },
];

// 点击触发右侧跳转
const clickBlameEvent = (row) => {
    console.log(row);
};
onMounted(() => {
    filterList.forEach((filter) => {
        filters[filter.name] = true;
    });
});
</script>

<style lang="less" scoped>
.m-blame-filters {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 20px;
    .size(360px, 760px);

    .w-card {
        gap: 10px;
    }

    .w-tabs {
        display: flex;
        flex-wrap: wrap;
        .mt(10px);
        .mb(-10px);

        .u-tab {
            .mb(10px);
            &.is-active {
                background-color: #0c759e;
            }
        }
    }

    .u-menu {
        flex-grow: 1;
        flex-shrink: 0;
    }

    :deep(.el-table__row) {
        .pointer;
    }
    :deep(.el-table__row):not(.is-focus):hover {
        .el-table__cell {
            background: #7650f8;
        }
    }
}
</style>
