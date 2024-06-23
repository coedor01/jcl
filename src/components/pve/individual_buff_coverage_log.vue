<template>
    <div class="m-entity-skill-log w-card">
        <template v-if="currentData.length === 0">
            <empty-guide
                text-align="left"
                position="flex-start"
                :rotate="-90"
                to="row"
                :grow="false"
                :tips="['在左侧选择一个增益后', '此处会展示该增益作用的所有玩家']"
            ></empty-guide>
        </template>
        <template v-else>
            <div class="w-card-title">
                增益 <span class="u-light">{{ titleName }}</span> 的结算记录
            </div>
            <el-table class="u-table" :data="currentData" :border="false">
                <el-table-column prop="index" label="#" align="center" :width="columnWidth[0]"></el-table-column>
                <el-table-column label="玩家名" :width="columnWidth[1]">
                    <template #default="{ row }">
                        <span>{{ row.playerName }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="作用次数" :width="columnWidth[3]">
                    <template #default="{ row }">
                        <span>{{ row.times }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="平局作用层数" :width="columnWidth[4]">
                    <template #default="{ row }">
                        <span>{{ row.stack }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="覆盖率" :width="columnWidth[5]">
                    <template #default="{ row }">
                        <span>{{ displayPercent(row.coverage * 100) }}</span>
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
import { computed, toRefs } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
import { usePve } from "@/store/pve";
import { useStore } from "@/store";
import { displayPercent } from "@/utils/commonNoStore";
// data
const { individual_selected_buff_log } = toRefs(usePve());
const store = useStore();

// computed
const titleName = computed(() => {
    return individual_selected_buff_log.value.name;
});
const data = computed(() => {
    const source = [];
    console.log(individual_selected_buff_log);
    const { average_coverage_per_player, average_stack_per_player, buffed_player, times_per_player } =
        individual_selected_buff_log.value;
    console.log(buffed_player);
    console.log(individual_selected_buff_log.buffed_player);
    if (buffed_player == undefined) {
        return [];
    }
    for (let i = 0; i < buffed_player.length; ++i) {
        let this_res = {
            playerName: store.result.entities[buffed_player[i]].name,
            times: times_per_player[i].toFixed(0),
            stack: average_stack_per_player[i].toFixed(1),
            coverage: average_coverage_per_player[i].toFixed(4),
        };
        source.push(this_res);
    }
    if (!source.length) return [];
    let index = 0;
    for (let log of source) {
        log.index = ++index;
    }
    return source;
});
const pageSize = computed(() => {
    return 13;
});
const columnWidth = computed(() => {
    return [42, 120, 80, 80, 110, 90];
});
const { total, currentPage, currentData } = usePaginate(data, pageSize);
</script>

<style lang="less">
.m-entity-skill-log {
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
