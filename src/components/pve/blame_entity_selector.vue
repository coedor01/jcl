<template>
    <div class="m-blame-entity-select">
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
                <el-table-column label="名称" width="120">
                    <template #default="{ row }">
                        <span>{{ getEntityName(row.playerId) }}</span>
                    </template>
                </el-table-column>
                <el-table-column width="50">
                    <template #default="{ row }">
                        <div class="u-check-icon">
                            <img v-if="entityList.includes(row.playerId)" src="@/assets/img/common/checked.svg" />
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
import { usePve } from "@/store/pve";
import { usePaginate } from "@/utils/uses/usePaginate";
import { getEntityName } from "@/utils/common";
const store = useStore();

// 单位过滤器相关
const filters = ref(["deathPlayer", "blamePlayer"]);
const filterList = [
    {
        name: "deathPlayer",
        title: "重伤的玩家",
    },
    {
        name: "blamePlayer",
        title: "可能犯错的玩家",
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
const { entityList, entity } = toRefs(usePve());
const data = computed(() => {
    const { buff_blame, player_death } = store.result;
    let entitiesArr = [];
    let cache = {};

    if (filters.value.includes("deathPlayer")) {
        if (player_death != []) {
            for (let deaths of Object.values(player_death)) {
                for (let value of deaths) {
                    cache[value.playerId] = true;
                    entitiesArr.push(value);
                }
            }
        }
    }

    if (filters.value.includes("blamePlayer")) {
        if (buff_blame != []) {
            for (let buffs of Object.values(buff_blame)) {
                for (let buff of Object.values(buffs)) {
                    for (let value of buff) {
                        if (value.playerId in cache) {
                            continue;
                        }
                        entitiesArr.push(value);
                    }
                }
            }
        }
    }

    return entitiesArr;
}, [store.result]);
const pageSize = ref(5);
const { currentPage, currentData, total } = usePaginate(data, pageSize);
// 选择单位事件
const selectEntity = (row) => {
    if (entityList.value.includes(row.playerId)) {
        entityList.value = entityList.value.filter((playerId) => playerId !== row.playerId);
        if (entity.value === row.playerId) entity.value = null;
    } else {
        entityList.value.push(row.playerId);
        entity.value = row.playerId;
    }
};
const rowClass = ({ row }) => {
    if (entityList.value.includes(row.playerId)) {
        return "is-focus";
    }
    return "";
};
</script>

<style lang="less">
.m-blame-entity-select {
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
        height: 252px;
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
