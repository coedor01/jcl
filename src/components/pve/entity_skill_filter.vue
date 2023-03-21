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
import { usePve } from "@/store/pve";
import { useStore } from "@/store";
import { usePaginate } from "@/utils/uses/usePaginate";
import { toRefs, watch, ref } from "vue";
import { getRandomColor, getResource } from "@/utils/common";
import { cloneDeep } from "lodash";

const { entity, selectedSkills } = toRefs(usePve());
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
                icon: resource.icon,
            };
            selectedSkills.value[name] = {
                name,
                ...result[name],
                stat: [],
            };
        } else {
            if (!result[name].icon) result[name].icon = resource.icon;
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
        let skill = cloneDeep(selectedSkills.value);
        for (let d of data.value.slice(0, 3)) {
            skill[d.name].stat = ["cast", "hit", "miss"];
        }
        selectedSkills.value = skill;
    },
    { immediate: true }
);
</script>

<style lang="less">
.m-entity-skill-filters {
    .size(230px, 370px);
    border: 1px solid #2d3236;
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
