<template>
    <div class="m-compare-view" :class="`u-index-${index}`" v-loading="loading">
        <div class="u-overview">
            <div v-for="(item, index) in overview" :key="index" class="u-overview-item">
                <span>{{ item.title }}</span>
                <span>{{ item.value }}</span>
            </div>
        </div>
        <div class="u-skills w-card">
            <empty-guide
                v-if="currentData.length === 0"
                :rotate="index === 1 ? 0 : -45"
                to="row"
                text-align="left"
                :tips="
                    index === 1
                        ? ['在上方选择单位后', '此处会展示第一个单位的技能列表']
                        : ['在左上方选择单位后', '此处会展示第二个单位的技能列表']
                "
            >
            </empty-guide>
            <template v-else>
                <div class="w-card-title">技能列表</div>
                <el-table
                    class="u-table"
                    :data="currentData"
                    :border="false"
                    @sort-change="sortSkill"
                    @row-click="selectSkill"
                    :row-class-name="rowClass"
                >
                    <el-table-column label="图标" width="48" :align="'center'">
                        <template #default="{ row }">
                            <div class="u-effect-icon">
                                <img :src="getResourceIcon(row.effect)" alt="" />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="招式" width="200">
                        <template #default="{ row }">
                            <span :title="getResourceName(row.effect, { showID: true })">{{
                                getResourceName(row.effect, { showID: true })
                            }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="count" label="次数" width="60" sortable="custom"></el-table-column>
                    <el-table-column prop="value" label="数值" width="160" sortable="custom">
                        <template #default="{ row }">
                            <span>{{ row.value }}</span>
                            <span> ({{ displayPercent(row.valueRate) }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="critRate" label="会心" width="100" sortable="custom">
                        <template #default="{ row }">
                            <span>{{ row.criticalCount }}</span>
                            <span> ({{ displayPercent(row.criticalRate) }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="avg" label="平均值" width="100" sortable="custom">
                        <template #default="{ row }">
                            <span>{{ displayDigits(row.avg) }}</span>
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
        <div class="u-skill-more">
            <div class="u-skill-logs w-card">
                <empty-guide
                    v-if="currentLogData.length === 0"
                    :tips="['在上方选择一个技能后', '此处会展示该技能的所有记录']"
                >
                </empty-guide>
                <template v-else>
                    <div v-if="effect" class="w-card-title">招式 {{ getResourceName(effect) }} 的结算记录</div>
                    <div v-else class="w-card-title">-</div>
                    <el-table
                        class="u-table"
                        :data="currentLogData"
                        :border="false"
                        :row-class-name="logRowClass"
                        @row-click="selectLog"
                    >
                        <el-table-column prop="index" label="#" align="center" :width="40"></el-table-column>
                        <el-table-column label="时间" width="60">
                            <template #default="{ row }">
                                <span>{{ displayDigits(row.micro / 1000) + "s" }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="目标" width="70">
                            <template #default="{ row }">
                                <span>{{ getEntityName(row.target) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="实际数值" width="100">
                            <template #default="{ row }">
                                <span>{{ row.value }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="会心" width="50">
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
                        :page-size="logPageSize"
                        :total="totalLog"
                        :hide-on-single-page="true"
                        :current-page="currentLogPage"
                        @update:currentPage="currentLogPage = $event"
                    ></el-pagination>
                </template>
            </div>
            <div class="u-skill-detail u-card" :class="`u-index-${index}`">
                <empty-guide
                    v-if="!detail"
                    :rotate="index === 1 ? -90 : 90"
                    :tips="
                        index === 1
                            ? ['在左侧选择一个技能后', '展示技能的所有详细数据']
                            : ['在右侧选择一个技能后', '展示技能的所有详细数据']
                    "
                >
                </empty-guide>
                <template v-else>
                    <div class="u-top">
                        <div class="u-card-title">技能详情</div>
                        <div class="u-effect-infos" v-if="detail">
                            <div class="u-effect-info">
                                <span>招式：</span>
                                <img :src="getResourceIcon(detail.effect)" />
                                <span>{{ getResourceName(detail.effect, { showID: true }) }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>来源：</span>
                                <img :src="getMountIcon(detail.caster)" />
                                <span>{{ getEntityName(detail.caster) }}#{{ detail.caster }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>施展次数：</span>
                                <span>第 {{ detail.index }} 次</span>
                            </div>
                            <div class="u-effect-info">
                                <span>施展时间：</span>
                                <span>{{ displayDigits(detail.micro / 1000) }} s</span>
                            </div>
                            <div class="u-effect-info">
                                <span>实际数值：</span>
                                <span>{{ detail.value }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>目标：</span>
                                <img :src="getMountIcon(detail.target)" />
                                <span>{{ getEntityName(detail.target) }}#{{ detail.target }}</span>
                            </div>
                            <div class="u-effect-info">
                                <span>备注：</span>
                                <span v-if="detail.isCritical">会心</span>
                                <span v-else> - </span>
                            </div>
                        </div>
                    </div>
                    <div class="w-card">
                        <div class="w-card-title">携带BUFF列表</div>
                        <div class="u-buff-list">
                            <div
                                v-for="(buff, index) in currentBuffData"
                                :key="index"
                                class="u-buff"
                                :title="getResourceName('buff:' + buff.split('*')[0], { showID: true })"
                            >
                                <img class="u-buff-icon" :src="getResourceIcon('buff:' + buff.split('*')[0])" />
                                <span class="u-buff-stack">{{ buff.split("*")[1] }}</span>
                                <span class="u-buff-name">{{
                                    getResourceName("buff:" + buff.split("*")[0], { showID: true })
                                }}</span>
                            </div>
                        </div>
                        <el-pagination
                            class="w-pagination"
                            small
                            background
                            layout="pager"
                            :page-size="buffPageSize"
                            :total="totalBuff"
                            :hide-on-single-page="true"
                            :current-page="currentBuffPage"
                            @update:currentPage="currentBuffPage = $event"
                        ></el-pagination>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import { usePve } from "@/store/pve";
import { getResourceIcon, getResourceName, getMountIcon, getEntityName } from "@/utils/common";
import { displayDigits, displayPercent } from "@/utils/commonNoStore";
import { toRefs, ref, computed, watch } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
import getWorkerResponse from "@/utils/worker";
// props
const props = defineProps({
    index: {
        type: Number,
        default: 1,
    },
});
const { index } = toRefs(props);
const { compareEntity, compareMode } = toRefs(usePve());
const entity = computed(() => {
    return compareEntity.value[index.value - 1];
});
// data
const loading = ref(false);
const effect = ref(null);
const logs = ref([]);
const detail = ref(null);

// 技能列表
const overview = ref([]);
const data = ref([]);
const pageSize = ref(8);
const { currentData, currentPage, total } = usePaginate(data, pageSize);
// 技能日志列表
const logPageSize = ref(9);
const { currentData: currentLogData, currentPage: currentLogPage, total: totalLog } = usePaginate(logs, logPageSize);
// 技能详情
const buffPageSize = ref(8);
const buff = computed(() => {
    if (!detail.value) return [];
    return detail.value.buffs;
});
const {
    currentData: currentBuffData,
    currentPage: currentBuffPage,
    total: totalBuff,
} = usePaginate(buff, buffPageSize);

const updateData = () => {
    loading.value = true;
    getWorkerResponse("get_pve_compare", {
        compareMode: compareMode.value,
        entity: entity.value,
    }).then((res) => {
        data.value = res.data;
        overview.value = res.overview;
        loading.value = false;
    });
};

// 各种表格交互/样式
const rowClass = ({ row }) => {
    return row.effect === effect.value ? "is-focus" : "";
};
const selectSkill = (row) => {
    if (effect.value === row.effect) {
        effect.value = null;
        logs.value = [];
        detail.value = null;
    } else {
        effect.value = row.effect;
        logs.value = row.logs;
        logs.value.forEach((item, index) => {
            item.index = index + 1;
        });
    }
};
const sortSkill = ({ prop, order }) => {
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
const selectLog = (row) => {
    detail.value = row;
};
const logRowClass = ({ row }) => {
    return row.index === detail.value?.index ? "is-focus" : "";
};
//watch
watch(
    [compareMode, entity],
    () => {
        updateData();
    },
    {
        immediate: true,
    }
);
</script>

<style lang="less">
@import "@/assets/css/pve/compare_view.less";
</style>
