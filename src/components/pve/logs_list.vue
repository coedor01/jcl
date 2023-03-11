<template>
    <div class="m-logs-list w-card">
        <div class="w-card-title">列表</div>
        <el-table class="u-table" :data="currentData" :border="false" :fit="true">
            <el-table-column prop="index" label="#" width="48" :align="'center'"> </el-table-column>
            <el-table-column label="时间" width="60">
                <template #default="{ row }">
                    <span>{{ displayDigits(row.micro / 1000) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="typeDesc" label="事件类型" width="120"></el-table-column>
            <el-table-column prop="subtype" label="子类型" width="80"> </el-table-column>
            <el-table-column label="事件来源" width="144">
                <template #default="{ row }">
                    <jcl-entity v-if="row.source.t === 'entity'" :entity="row.source.v"></jcl-entity>
                </template>
            </el-table-column>
            <el-table-column label="事件内容" width="144">
                <template #default="{ row }">
                    <jcl-effect
                        v-if="['skill', 'buff'].includes(row.content.t)"
                        :type="row.content.t"
                        :effect="row.content.v"
                    ></jcl-effect>
                </template>
            </el-table-column>
            <el-table-column label="事件目标" width="144">
                <template #default="{ row }">
                    <jcl-entity v-if="row.target.t === 'entity'" :entity="row.target.v"></jcl-entity>
                </template>
            </el-table-column>
            <el-table-column label="数值">
                <template #default="{ row }">
                    <el-tooltip v-if="showEventValue(row)" placement="top">
                        <template #content>
                            <div>
                                <span v-for="(value, type) in row.value" :key="type">
                                    {{ type }}: {{ value }}<br />
                                </span>
                            </div>
                        </template>
                        <span>{{ Object.values(row.value)[0] }}</span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="备注">
                <template #default="{ row }">
                    {{ row.remark }}
                </template>
            </el-table-column>
            <el-table-column v-if="logDebug" width="24">
                <template #default="{ row }">
                    <el-button @click="consoleLog(row)" size="mini" link :icon="InfoFilled"></el-button>
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
import JclEntity from "@/components/common/jcl_entity.vue";
import JclEffect from "@/components/common/jcl_effect.vue";

import { InfoFilled } from "@element-plus/icons-vue";

import { displayDigits } from "@/utils/common";
import { usePaginate } from "@/utils/uses/usePaginate";
import { ref, toRefs, watch, onMounted } from "vue";
import { useStore } from "@/store";
import { useGlobal } from "@/store/global";
import { cloneDeep } from "lodash";
// data
const store = useStore();
const { logFilter, logAutoApply, logDebug } = toRefs(useGlobal());
const data = ref([]);
const pageSize = ref(30);
const { currentPage, total, currentData } = usePaginate(data, { pageSize: pageSize.value });

// methods
const consoleLog = (row) => console.log(cloneDeep(row));
const showEventValue = (row) => {
    if (row.type != 21) return false;
    if (Object.values(row.value).every((x) => !x)) return false;
    return true;
};
const updateData = () => {
    const { rows } = store.result;
    if (!rows) data.value = [];
    const { keyword: keywords, hideKeyword: hideKeywords, entities, showTypes } = logFilter.value;
    const timeRange = [logFilter.value.timeRange[0] * 1000, logFilter.value.timeRange[1] * 1000];

    const typeMap = {
        say: [14, 15, 18],
        scene: [2, 3, 6, 7, 10, 11],
        buff: [13],
        skill: [21],
        skillCast: [19, 20],
        skillResult: [22, 23, 24, 25, 26],
        kill: [28],
        status: [29],
    };

    let index = 0;
    data.value = rows.filter((row) => {
        // 妹什么用的东西直接过滤
        if ([4, 8, 10, 11, 12].includes(row.type)) return false;
        // 事件类型过滤
        for (let type in typeMap) {
            // 如果显示类型里不包含这个类型,并且当前事件处于这个类型，则不显示
            if (!showTypes.includes(type) && typeMap[type].includes(row.type)) {
                return false;
            }
        }
        // 相关单位过滤
        if (entities.length) {
            if (row.source.t == "entity" || row.target.t == "entity") {
                // 过滤雨我无瓜的单位
                if (!entities.includes(row.source.v) && !entities.includes(row.target.v)) {
                    return false;
                }
                // 开启了只显示选择单位为来源单位后
                if (logFilter.value.onlySource && row.source && row.source.t == "entity") {
                    if (!entities.includes(row.source.v)) return false;
                }
            }
        }
        // 时间范围过滤
        if (row.micro < timeRange[0] || row.micro > timeRange[1]) return false;

        // 关键词过滤
        if (hideKeywords && row.content) {
            for (let keyword of hideKeywords) {
                if (keyword.type == "str" && row.content.t === "str" && row.content.v.includes(keyword.text))
                    return false;
                if (keyword.type == "skill" && row.content.t === "skill" && row.content.v.startsWith(keyword.id))
                    return false;
                if (keyword.type == "buff" && row.content.t === "buff" && row.content.v.startsWith(keyword.id))
                    return false;
            }
        }
        // 事件内容搜索,逻辑有些复杂Orz
        if (keywords && row.content) {
            let conform = false;
            for (let keyword of keywords) {
                if (conform) {
                    row.index = ++index;
                    return true;
                }
                if (keyword.type == "str" && row.content.t === "str") {
                    conform = row.content.v.includes(keyword.text);
                }
                if (keyword.type == "skill" && row.content.t === "skill")
                    conform = row.content.v.startsWith(keyword.id);
                if (keyword.type == "buff" && row.content.t === "buff") conform = row.content.v.startsWith(keyword.id);
            }
            if (!conform) return false;
        }
        // 隐藏反击
        if (logFilter.value.hideReact && row.type == 21) {
            if (row.detail.isReact) return false;
        }
        // 隐藏无数值事件
        if (logFilter.value.hideNoValue && row.type == 21 && !showEventValue(row)) return false;

        row.index = ++index;
        return true;
    });
};
defineExpose({ updateData });

// 监听logFilter变化自动更新
watch(
    logFilter,
    () => {
        if (logAutoApply.value) {
            updateData();
        }
    },
    { deep: true, immediate: true }
);
onMounted(() => {
    updateData();
});
</script>

<style lang="less">
.m-logs-list {
    height: 1060px;
    flex-grow: 1;

    .u-table {
        flex-grow: 1;

        .el-table__row {
            transition: all 0.2s ease-in-out;
        }
        .el-table__row:hover {
            background-color: #7650f8aa;
        }
    }
}
</style>
