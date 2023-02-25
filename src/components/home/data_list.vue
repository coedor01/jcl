<template>
    <div class="m-data-list">
        <div class="u-tabs">
            <template v-for="(tab, index) in tabs" :key="index">
                <div class="u-tab" :class="{ active: tab.name == active }" @click="toggle(tab.name)">
                    {{ tab.title }}
                </div>
            </template>
        </div>
        <div class="u-search">
            <el-input v-model="search" />
        </div>
        <div class="u-list">
            <div class="u-data">
                <div class="u-empty" v-if="data.total === 0">暂无数据，上传一个吧 😘</div>
                <div class="u-li" v-for="(item, index) in data.list" :key="index">
                    <span class="u-badge" :class="`u-badge-${item.subject}`">{{ subjectName(item.subject) }}</span>
                    <span class="u-name">{{ item.title }}</span>
                    <span class="u-opr">
                        <el-button link :icon="Edit" />
                        <el-button link :icon="Delete" />
                    </span>
                    <span class="u-update">
                        <span>更新：</span>
                        <span>{{ item.updated_at }}</span>
                    </span>
                </div>
            </div>
            <div class="u-pagination">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :current-page="data.page"
                    @update:current-page="data.page = $event"
                    :total="data.total"
                    :page-size="12"
                    :hide-on-single-page="true"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { getPublicList, getMyList } from "@/services/team";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { ref, reactive, watch } from "vue";

const active = ref("mine");
const tabs = [
    {
        name: "mine",
        title: "我的数据",
    },
    {
        name: "newest",
        title: "最新数据",
    },
    {
        name: "team",
        title: "团队行为",
    },
    {
        name: "boss",
        title: "首领行为",
    },
    {
        name: "pvp",
        title: "竞技多维",
    },
];
// data
const search = ref("");
const data = reactive({
    list: [],
    total: 0,
    page: 1,
});
// methods
const getList = () => {
    let res;
    if (active.value === "mine") {
        res = getMyList({
            page: data.page,
            pageSize: 12,
        });
    } else if (active.value === "newest") {
        res = getPublicList({
            page: data.page,
            pageSize: 12,
        });
    }
    if (res) {
        res.then((res) => {
            if (res.data?.code === 0) {
                let {
                    list,
                    page: { total },
                } = res.data.data;
                data.list = list;
                data.total = total;
            } else {
                ElMessage.error(res.data.msg ?? "获取数据失败");
            }
        }).catch((e) => {
            console.warn(e);
            ElMessage.error("获取数据失败");
        });
    }
};
const toggle = (name) => {
    active.value = name;
};
const subjectName = (subject) => {
    return (
        {
            boss: "首领行为",
            team: "团队行为",
            pvp: "竞技多维",
        }[subject] ?? "JCL数据"
    );
};
// watch
watch(
    [() => active.value, () => data.page],
    () => {
        getList();
    },
    { immediate: true }
);
</script>

<style lang="less" scoped>
.m-data-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    .u-tabs {
        display: flex;
        gap: 10px;
        .mb(20px);
        .u-tab {
            user-select: none;
            cursor: pointer;
            flex-grow: 1;

            color: white;
            background: #554d77;
            border-radius: 30px;
            height: 40px;

            .bold;
            .fz(14px, 40px);
            .x(center);
            transition: flex-grow 0.2s ease-in-out;

            &:hover {
                transform: scale(1.05);
            }
            &.active {
                flex-grow: 2;
                background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
            }
        }
    }
    .u-search {
        :deep(.el-input__inner) {
            color: #bfb0ff;
        }

        :deep(.el-input__wrapper) {
            background: #121019;
            box-shadow: none;
            border: 3px dashed #554d77;
            border-radius: 10px;
        }

        .mb(20px);
    }
    .u-list {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background: #121019;
        border: 3px dashed #554d77;
        border-radius: 10px;
        padding: 20px;
        .fz(14px, 17px);
        .color(#BFB0FF);

        .u-empty {
            .x(center);
            padding: 60px;
            height: 100%;
        }

        .u-data {
            flex-grow: 1;
        }

        .u-li {
            display: flex;
            align-items: center;
            height: 30px;

            &:not(:last-child) {
                border-bottom: 1px solid rgba(191, 176, 255, 0.2);
            }

            .u-badge {
                color: white;
                background: #24a4cc;
                border-radius: 10px;
                width: 69px;
                height: 18px;
                .x(center);
                .mr(10px);
                .fz(12px, 18px);
                &.u-badge-team {
                    background: #42a28b;
                }
                &.u-badge-boss {
                    background: #8472d2;
                }
                &.u-badge-pvp {
                    background: #812e13;
                }
            }
            .u-name {
                flex-grow: 1;
            }
            .u-opr {
                padding: 0 14px;

                .el-button {
                    transition: all 0.2s ease-in-out;
                    &:hover {
                        transform: scale(1.05);
                    }
                }
            }
        }

        .u-pagination {
            :deep(.el-pagination) {
                justify-content: center;

                li,
                button {
                    color: white;
                    background-color: #554d77;

                    &.is-active {
                        background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
                    }
                }
            }
        }
    }
}
</style>
