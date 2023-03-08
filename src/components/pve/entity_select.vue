<template>
    <div class="m-entity-select">
        <div class="w-card u-filters">
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
        </div>
        <div class="w-card u-select">
            <div class="w-card-title">单位列表</div>
            <el-table
                class="u-table"
                :data="currentData"
                :border="false"
                :row-class-name="rowClass"
                @row-click="selectEntity"
            >
                <el-table-column prop="index" label="#" width="36" align="center"></el-table-column>
                <el-table-column label="类型" width="54">
                    <template #default="{ row }">
                        <span>{{ row.type === "player" ? "玩家" : "NPC" }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="名称" width="120">
                    <template #default="{ row }">
                        <span>{{ getEntityName(row.id) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="首次出现" width="60">
                    <template #default="{ row }">
                        <span>{{ row.firstAppear ? displayDigits(row.firstAppear.micro / 1000) + "s" : "-" }}</span>
                    </template>
                </el-table-column>
                <el-table-column width="50">
                    <template #default="{ row }">
                        <div class="u-check-icon">
                            <img v-if="entityList.includes(row.id)" src="@/assets/img/common/checked.svg" />
                            <img v-else src="@/assets/img/common/check.svg" />
                        </div>
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
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, toRefs } from "vue";
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";
import { usePaginate } from "@/utils/uses/usePaginate";
import { displayDigits, getEntityName } from "@/utils/common";
const store = useStore();

// 单位过滤器相关
const filters = ref(["hideBelong", "hideNoName", "showPlayer", "hideSameTemplate"]);
const filterList = [
    {
        name: "hideBelong",
        title: "隐藏有归属的单位",
    },
    {
        name: "hideNoName",
        title: "隐藏无名单位",
    },
    {
        name: "showNPC",
        title: "NPC",
    },
    {
        name: "showPlayer",
        title: "玩家",
    },
    {
        name: "hideSameTemplate",
        title: "隐藏同模板单位",
    },
];
const switchFilter = (filter) => {
    if (filters.value.includes(filter)) {
        filters.value = filters.value.filter((f) => f !== filter);
    } else {
        filters.value.push(filter);
    }
};
// 数据相关
const { entityList, entity } = toRefs(useGlobal());
const data = computed(() => {
    const { entities } = store.result;
    let _templateExist = {};
    let index = 1;
    let entitiesArr = Object.values(entities).filter((e) => {
        if (!e.id) return;
        if (filters.value.includes("hideBelong") && e.belongID) return false;
        if (filters.value.includes("hideNoName") && !e.name) return false;
        if (!filters.value.includes("showNPC") && e.type === "npc") return false;
        if (!filters.value.includes("showPlayer") && e.type === "player") return false;
        if (filters.value.includes("hideSameTemplate") && e.type === "npc") {
            if (_templateExist[e.templateID] === true) return false;
            _templateExist[e.templateID] = true;
        }
        e.index = index++;
        return true;
    });
    return entitiesArr;
}, [store.result]);
const pageSize = ref(5);
const { currentPage, currentData, total } = usePaginate(data, { pageSize: pageSize.value });
// 选择单位事件
const selectEntity = (row) => {
    if (entityList.value.includes(row.id)) {
        entityList.value = entityList.value.filter((id) => id !== row.id);
        if (entity.value?.id === row.id) entity.value = null;
    } else {
        entityList.value.push(row.id);
        entity.value = row.id;
    }
};

const rowClass = ({ row }) => {
    if (entityList.value.includes(row.id)) {
        return "is-focus";
    }
    return "";
};
</script>

<style lang="less">
.m-entity-select {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 20px;
    width: 360px;

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

    .u-select {
        display: flex;
        flex-direction: column;
        height: 312px;
        .u-table {
            flex-grow: 1;
            .u-check-icon {
                .flex-center;
                img {
                    .size(24px);
                }
            }
            .el-table__row {
                cursor: pointer;
            }

            .el-table__row.is-focus {
                .el-table__cell:last-of-type {
                    div.cell {
                        background: transparent;
                    }
                }
                .el-table__cell:nth-last-of-type(2) {
                    div.cell {
                        border-radius: 0 20px 20px 0;
                    }
                }
                .el-table__cell:first-of-type {
                    div.cell {
                        border-radius: 20px 0 0 20px;
                    }
                }
            }
        }
    }
}
</style>
