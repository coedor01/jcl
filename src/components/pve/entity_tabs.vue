<template>
    <div class="m-entity-tabs">
        <el-scrollbar class="u-lists">
            <div class="w-tabs">
                <div v-if="entityList.length === 0" class="u-tab__empty">
                    <img class="u-tab__empty-icon" src="@/assets/img/common/circle_arrow.svg" />
                    在左侧选择单位
                </div>
                <div
                    class="u-tab"
                    v-for="(id, index) in entityList"
                    :key="index"
                    :class="{ 'is-active': id === entity }"
                    @click="switchEntity(id)"
                >
                    <div class="u-tab__name">{{ getEntityName(id) }}</div>
                    <el-button class="u-tab__remove" @click.stop="remove(id)" link>×</el-button>
                </div>
            </div>
        </el-scrollbar>
        <div class="u-clear" @click="clear">
            <el-icon><RefreshLeft /></el-icon>
            清空
        </div>
    </div>
</template>

<script setup>
import { usePve } from "@/store/pve";
import { getEntityName } from "@/utils/common";
import { toRefs } from "vue";

const { entityList, entity } = toRefs(usePve());

const switchEntity = (id) => {
    if (entity.value === id) return;
    entity.value = id;
};
const clear = () => {
    entity.value = null;
    entityList.value = [];
};
const remove = (id) => {
    entityList.value = entityList.value.filter((x) => x !== id);
    if (entity.value === id) {
        entity.value = entityList.value[0] ?? null;
    }
};
</script>

<style lang="less" scoped>
.m-entity-tabs {
    display: flex;
    align-items: center;
    gap: 20px;
    .mb(20px);
    flex-shrink: 0;
    height: 48px;

    .u-lists {
        flex-grow: 1;
    }
    .w-tabs {
        display: flex;
        white-space: nowrap;
    }
    .u-tab__empty {
        .u-tab;
        .flex-center;

        .fz(14px, 40px);
        padding: 0 12.5px;
        height: 40px;
        border-radius: 20px;
        color: #fff;
        background-color: #24292e;
    }
    .u-tab__empty-icon {
        .to-left;
        .size(16px);
    }
    .u-tab {
        padding-left: 18px;
        .flex-center;
        gap: 10px;
    }
    .u-tab__remove {
        .fz(16px);
        color: #dfeedf;
    }
    .u-clear {
        .flex-center;
        .pointer;
        .mt(-8px);
        border-radius: 10px;
        padding: 10px;
        flex-shrink: 0;
        gap: 6px;

        &:hover {
            background: #24292e;
        }
    }
}
</style>
