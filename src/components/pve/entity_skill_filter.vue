<template>
    <div class="m-entity-skill-filters w-card">
        <div class="w-card-title">技能统计设置</div>
        <el-table class="u-table" :data="currentData" :border="false" @cell-click="click">
            <el-table-column label="招式" :width="100">
                <template #default="{ row }">
                    <span :title="`${row.name}`">{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="释放" :width="40" align="center">
                <template #default="{ row }">
                    <div class="u-check-icon">
                        <img
                            v-if="selectedSkills[row.name].stat.includes('cast')"
                            src="@/assets/img/common/checked.svg"
                            draggable="false"
                        />
                        <img v-else draggable="false" src="@/assets/img/common/check.svg" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="命中" :width="40" align="center">
                <template #default="{ row }">
                    <div class="u-check-icon">
                        <img
                            v-if="selectedSkills[row.name].stat.includes('hit')"
                            src="@/assets/img/common/checked.svg"
                            draggable="false"
                        />
                        <img v-else draggable="false" src="@/assets/img/common/check.svg" />
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="偏离" :width="40" align="center">
                <template #default="{ row }">
                    <div class="u-check-icon">
                        <img
                            v-if="selectedSkills[row.name].stat.includes('miss')"
                            src="@/assets/img/common/checked.svg"
                            draggable="false"
                        />
                        <img v-else draggable="false" src="@/assets/img/common/check.svg" />
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
import { useGlobal } from "@/store/global";
import { useStore } from "@/store";
import { usePaginate } from "@/utils/uses/usePaginate";
import { toRefs, watch, ref } from "vue";
import { getRandomColor, getResource } from "@/utils/common";

const { entity, selectedSkills } = toRefs(useGlobal());
const store = useStore();

const data = ref([]);
const pageSize = ref(8);
const { currentPage, currentData, total } = usePaginate(data, pageSize);

// 获取可供选择的数据
const updateData = () => {
    selectedSkills.value = {};
    const source = store.result.skill?.[entity.value]?.skills;
    if (!source) {
        data.value = [];
        return;
    }
    const colorGenerator = getRandomColor();
    let result = {};
    for (let id in source) {
        const resource = getResource("skill:" + id);
        if (!resource || !resource.name) continue;
        const name = resource.name;
        if (result[name] === undefined) {
            result[name] = {
                name,
                ids: [id],
                color: colorGenerator.next().value,
            };
            selectedSkills.value[name] = {
                name,
                ...result[name],
                stat: ["cast", "hit", "miss"],
            };
        } else {
            result[name].ids.push(id);
            selectedSkills.value[name].ids.push(id);
        }
    }
    data.value = Object.values(result);
};
// 处理用户选中/取消选中
const click = (row, column) => {
    const skill = selectedSkills.value[row.name];
    const columnIndex = column.no;
    if (columnIndex === 0) {
        // 点名字全选/全取消
        if (skill.stat.length) {
            skill.stat = [];
        } else {
            skill.stat = ["cast", "hit", "miss"];
        }
    } else {
        const type = {
            1: "cast",
            2: "hit",
            3: "miss",
        }[columnIndex];
        if (skill.stat.includes(type)) {
            skill.stat = skill.stat.filter((item) => item !== type);
        } else {
            skill.stat.push(type);
        }
    }
};

watch(
    [entity, () => store.result],
    () => {
        updateData();
        for (let d of data.value.slice(3)) {
            click(d, { no: 0 });
        }
    },
    { immediate: true }
);
</script>

<style lang="less">
.m-entity-skill-filters {
    width: 270px;
    flex-shrink: 0;

    .u-table {
        flex-grow: 1;
        .el-table__row {
            .pointer;
        }
        .u-check-icon {
            .flex-center;

            img {
                .size(24px);
            }
        }
    }
}
</style>
