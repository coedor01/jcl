<template>
    <div class="m-blame-skill-log w-card">
        <template v-if="currentData.length === 0">
            <empty-guide
                :rotate="-90"
                :tips="['在左侧选择一个玩家后', '此处会展示该玩家死亡前五秒的记录以及死亡时所携带的buff']"
            ></empty-guide>
        </template>
        <template v-else>
            <div class="w-card-title">死亡前5秒的技能列表</div>
            <el-table class="u-table" :data="currentData" :border="false">
                <el-table-column prop="index" label="#" align="center" :width="columnWidth[0]"></el-table-column>
                <el-table-column label="时间" :width="columnWidth[1]">
                    <template #default="{ row }">
                        <span>{{ displayDigits(row.micro / 1000) + "s" }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="目标" :width="columnWidth[2]">
                    <template #default="{ row }">
                        <span>{{ getEntityName(row.target) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="招式" :width="columnWidth[3]">
                    <template #default="{ row }">
                        <span>{{ getResourceName(row.effect, { showID: true }) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="实际数值" :width="columnWidth[4]">
                    <template #default="{ row }">
                        <span>{{ row.value }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="会心" :width="columnWidth[5]">
                    <template #default="{ row }">
                        <span>{{ row.isCritical ? "会心" : "-" }}</span>
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
        </template>
    </div>
</template>

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import { displayDigits } from "@/utils/commonNoStore";
import { getEntityName, getResourceName } from "@/utils/common";
import { computed, toRefs } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
import { usePve } from "@/store/pve";
// data
const { blameType, blame_death_detail } = toRefs(usePve());

// computed
const data = computed(() => {
    const source = [];
    if (blameType.value === "death_blame") source.push(...blame_death_detail.value);
    if (!source.length) return [];
    let index = 0;
    for (let log of source) {
        log.index = ++index;
    }
    return source;
});
const pageSize = computed(() => {
    if (blameType.value === "death_blame") return 19;
    return 9;
});
const columnWidth = computed(() => {
    if (blameType.value === "death_blame") return [48, 64, 36, 240, 118, 64];
    return [42, 54, 100, 146, 90, 36];
});
const { total, currentPage, currentData } = usePaginate(data, pageSize);
</script>

<style lang="less">
.m-blame-skill-log {
    flex-shrink: 0;

    .u-light {
        color: white;
    }
    .u-effect-icon {
        .size(18px);
        .db;
        margin: auto;
    }

    .u-table {
        flex-grow: 1;

        .el-table__row {
            height: 31px;
            .pointer;
        }

        .el-table__row:not(.is-focus):hover {
            .el-table__cell {
                div.cell {
                    background: #7650f8aa;
                }
                &:first-of-type {
                    div.cell {
                        border-radius: 6px 0 0 6px;
                    }
                }
                &:last-of-type {
                    div.cell {
                        border-radius: 0 6px 6px 0;
                    }
                }
            }
        }
    }
}
</style>
