<template>
    <div class="m-blame-death-buff-detail u-card">
        <template v-if="!blame_death_buff">
            <empty-guide
                to="row-reverse"
                :rotate="90"
                text-align="right"
                :tips="['在右侧选择一个玩家后', '显示该玩家死亡前所携带的效果']"
            ></empty-guide>
        </template>
        <template v-else>
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
        </template>
    </div>
</template>

<script setup>
import EmptyGuide from "@/components/common/empty_guide.vue";
import { getResourceIcon, getResourceName } from "@/utils/common";
import { computed, toRefs } from "vue";
import { usePaginate } from "@/utils/uses/usePaginate";
import { usePve } from "@/store/pve";

const { blameType, blame_death_buff } = toRefs(usePve());

const buffs = computed(() => {
    if (!blame_death_buff.value) return [];
    return blame_death_buff.value;
});
const pageSize = computed(() => {
    if (blameType.value === "death_blame") return 10;
    return 7;
});
const { currentPage, currentData, total } = usePaginate(buffs, pageSize);
</script>

<style lang="less" scoped>
.m-blame-death-buff-detail {
    display: flex;
    background: #615a76;
    border-radius: 20px;
    padding: 20px;
    .u-card-title {
        .fz(14px, 18px);
        color: #b3b3b3;
        margin: 0;
    }

    .m-empty-guide {
        filter: brightness(1.5);
    }

    & > div:not(.u-empty) {
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
