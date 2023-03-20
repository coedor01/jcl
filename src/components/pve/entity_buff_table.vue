<template>
    <div class="m-entity-buff-table">
        <el-table
            class="u-table"
            :data="currentData"
            :border="false"
            :row-class-name="rowClass"
            @sort-change="sort"
            @row-click="click"
        >
            <el-table-column prop="index" label="#" align="center" :width="36"></el-table-column>
            <el-table-column label="图标" :width="36">
                <template #default="{ row }">
                    <div class="u-buff-icon">
                        <img :src="iconLink(row.icon)" alt="" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="BUFF" :width="220">
                <template #default="{ row }">
                    <span>{{ getResourceName("buff:" + row.id, { showID: true }) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="覆盖率" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ displayPercent(row.coverage) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="获得次数" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ row.getCount }}</span>
                </template>
            </el-table-column>
            <el-table-column label="卸除次数" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ row.deleteCount }}</span>
                </template>
            </el-table-column>
            <el-table-column label="最大层数" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ row.maxStack }}</span>
                </template>
            </el-table-column>
            <el-table-column label="最短持续" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.minDuration) }} s</span>
                </template>
            </el-table-column>
            <el-table-column label="最长持续" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.maxDuration) }} s</span>
                </template>
            </el-table-column>
            <el-table-column label="平均持续" :width="90" sortable="custom">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.aveDuration) }} s</span>
                </template>
            </el-table-column>
            <el-table-column label="图表统计" :width="90" align="center">
                <template #default="{ row }">
                    <div class="u-check-icon">
                        <img v-if="selectedBuffs.includes(row.id)" src="@/assets/img/common/checked.svg" />
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
        ></el-pagination>
    </div>
</template>

<script setup>
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { getResourceName, getResourceIcon, displayPercent, displayDigits } from "@/utils/common";
import { ref, toRefs, watch } from "vue";
import { usePve } from "@/store/pve";
import { useStore } from "@/store";
import { usePaginate } from "@/utils/uses/usePaginate";
import { sortBy } from "lodash-es";

const store = useStore();
const { entity, selectedBuffs } = toRefs(usePve());

const data = ref([]);
const pageSize = ref(8);
const { currentPage, currentData, total } = usePaginate(data, pageSize);

const rowClass = ({ row }) => {
    if (selectedBuffs.value.includes(row.id)) {
        return "is-focus";
    }
    return "";
};
const click = (row) => {
    if (selectedBuffs.value.includes(row.id)) {
        selectedBuffs.value = selectedBuffs.value.filter((id) => id !== row.id);
    } else {
        selectedBuffs.value.push(row.id);
        const sortList = data.value.map((x) => x.id);
        selectedBuffs.value = sortBy(selectedBuffs.value, (element) => sortList.indexOf(element));
    }
};
const updateData = () => {
    const { buff, end } = store.result;
    const source = buff[entity.value];
    if (!source) return [];
    let result = [];
    for (let key in source) {
        const buff = source[key];
        let getCount = 0;
        let deleteCount = 0;
        let maxStack = 0;
        let maxDuration = Number.MIN_SAFE_INTEGER;
        let minDuration = Number.MAX_SAFE_INTEGER;
        let totalDuration = 0;
        for (let log of buff.logs) {
            const duration = (log.end - log.start) / 1000;
            getCount += 1;
            maxStack = Math.max(maxStack, log.stack, ...Object.values(log.stackLogs ?? {}));
            maxDuration = Math.max(maxDuration, duration);
            minDuration = Math.min(minDuration, duration);
            totalDuration += duration;
            if (log.end != log.shouldEnd) deleteCount += 1;
        }
        let aveDuration = totalDuration / getCount;
        let coverage = (totalDuration / (end.micro / 1000)) * 100;
        result.push({
            id: key,
            icon: getResourceIcon("buff:" + key, { url: false }),
            getCount,
            deleteCount,
            maxStack,
            maxDuration,
            minDuration,
            aveDuration,
            coverage,
        });
        data.value = result;
    }
};
const sort = ({ prop, order }) => {
    data.value = data.value.sort((a, b) => {
        if (order === "ascending") {
            return a[prop] - b[prop];
        } else {
            return b[prop] - a[prop];
        }
    });
    let index = 1;
    for (let item of data.value) {
        item.index = index++;
    }
};
watch(
    [entity, () => store.result],
    () => {
        updateData();
        sort({ prop: "icon", order: "descending" });
        if (selectedBuffs.value.length === 0) {
            selectedBuffs.value = data.value.slice(0, 8).map((x) => x.id);
        }
    },
    {
        immediate: true,
    }
);
</script>

<style lang="less">
.m-entity-buff-table {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    .u-table {
        height: 298px;
        .u-buff-icon {
            .size(18px);
            .db;
            margin: auto;
        }

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
</style>
