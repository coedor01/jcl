<template>
    <div class="m-entity-skill-detail u-card">
        <div class="u-left">
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
        <div class="u-right">
            <div class="w-card">
                <div class="w-card-title">携带BUFF列表</div>
                <div class="u-buff-list">
                    <div
                        v-for="(buff, index) in currentData"
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
                    :page-size="pageSize"
                    :total="total"
                    :hide-on-single-page="true"
                    :current-page="currentPage"
                    @update:currentPage="currentPage = $event"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getEntityName, displayDigits, getResourceIcon, getResourceName, getMountIcon } from "@/utils/common";
import { computed, toRefs } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
import { useGlobal } from "@/store/global";

const { log: detail, viewType: type } = toRefs(useGlobal());

const buffs = computed(() => {
    if (!detail || !detail.value) return [];
    return detail.value.buffs;
});
const pageSize = computed(() => {
    if (type.value === "target") return 10;
    return 7;
});
const { currentPage, currentData, total } = usePaginate(buffs, pageSize);
</script>

<style lang="less" scoped>
.m-entity-skill-detail {
    display: flex;
    background: #615a76;
    border-radius: 20px;
    padding: 20px;
    .u-card-title {
        .fz(14px, 18px);
        color: #b3b3b3;
        margin: 0;
    }

    & > div {
        width: 50%;
    }

    & > .u-left {
        flex-shrink: 0;
    }

    & > .u-right {
        display: flex;

        .w-card {
            flex-grow: 1;
            padding: 20px 10px 10px 10px;
            gap: 10px;
        }
    }

    .u-effect-infos {
        .bold;
        .fz(14px, 24px);
        .color(white);
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 10px 0 50px 0;
        height: calc(100%-60px);

        .u-effect-info {
            display: flex;
            align-items: center;
            .ellipsis;

            img {
                .size(24px);
                .mr(8px);
            }
        }
    }

    .u-buff-list {
        flex-grow: 1;
        display: flex;
        align-content: flex-start;
        flex-wrap: wrap;
        gap: 8px;
        color: #b3b3b3;
        .fz(12px, 16px);
        .bold;
        .u-buff {
            .size(120px, 24px);
            flex-grow: 1;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            position: relative;
            white-space: nowrap;

            .u-buff-icon {
                .size(24px);
                .mr(4px);
                display: block;
            }

            .u-buff-stack {
                position: absolute;
                left: 14px;
                top: 10px;
                color: white;
            }

            .u-buff-name {
                .ellipsis;
            }
        }
    }
}
</style>
