<template>
    <div class="m-data-list">
        <!-- <div class="u-tabs">
            <template v-for="(tab, index) in tabs" :key="index">
                <div class="u-tab" :class="{ active: tab.name == active }" @click="toggle(tab.name)">
                    {{ tab.title }}
                </div>
            </template>
        </div> -->
        <!-- <div class="u-search">
            <el-input v-model="search" placeholder="请输入搜索关键词.." />
        </div> -->
        <div class="u-list" v-loading="data.loading">
            <div class="u-data">
                <div class="u-empty" v-if="data.total === 0">暂无数据，上传一个吧 😘</div>
                <router-link
                    class="u-li"
                    v-for="(item, index) in data.list"
                    :key="index"
                    :to="{ name: 'view', query: { id: item.id } }"
                >
                    <!-- 数据类型 -->
                    <span class="u-type" :class="`u-type-${item.subject}`">{{ subjectName(item.subject) }}</span>
                    <!-- 私有、天梯榜等 -->
                    <i class="u-badge u-private" v-if="item.visible != 0"
                        ><img svg-inline src="@/assets/img/works/draft.svg" alt=""
                    /></i>
                    <i class="u-badge u-star" v-if="item.rank_id"><i>★</i>天梯榜</i>
                    <i class="u-badge u-checked" v-if="item.is_checked"
                        ><img svg-inline src="@/assets/img/works/checked.svg"
                    /></i>
                    <!-- 名称 -->
                    <span class="u-name">{{ item.title }}</span>
                    <!-- <span class="u-opr" v-if="active == 'mine'">
                        <el-button link :icon="Edit" @click="edit(item)" />
                        <el-popconfirm
                            width="220"
                            confirm-button-text="确定"
                            title="😱此操作将永久删除数据, 是否继续?"
                            effect="dark"
                            popper-class="m-del-confirm"
                            :icon="null"
                            @confirm="del(item)"
                        >
                            <template #reference>
                                <el-button link :icon="Delete" />
                            </template>
                        </el-popconfirm>
                    </span> -->
                    <span class="u-update">
                        <span>更新：</span>
                        <span>{{ item.updated_at }}</span>
                    </span>
                </router-link>
            </div>
            <router-link class="m-index-data__more" to="/public">
                查看更多<el-icon><DArrowRight /></el-icon>
            </router-link>
            <!-- <div class="u-pagination">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :current-page="data.page"
                    @update:current-page="data.page = $event"
                    :total="data.total"
                    :page-size="12"
                    :hide-on-single-page="true"
                />
            </div> -->
        </div>
        <!-- <EditDialog ref="editDialog" @updated="getList"></EditDialog> -->
    </div>
</template>

<script setup>
// import EditDialog from "./edit_dialog.vue";

import { getPublicList } from "@/services/team";

import { ElMessage } from "element-plus";
import { reactive, onMounted } from "vue";

//const active = ref("newest");
//const editDialog = ref(null);
// const tabs = [
//     {
//         name: "newest",
//         title: "最新数据",
//     },
//     {
//         name: "mine",
//         title: "我的数据",
//     },
//     {
//         name: "team",
//         title: "团队行为",
//     },
//     {
//         name: "boss",
//         title: "首领行为",
//     },
//     {
//         name: "pvp",
//         title: "竞技多维",
//     },
// ];
// data
//const search = ref("");
const data = reactive({
    list: [],
    total: 0,
    page: 1,
    loading: false,
});
// methods
const getList = () => {
    let res;
    data.loading = true;
    res = getPublicList({
        page: data.page,
        pageSize: 14,
    });
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
        })
            .catch((e) => {
                console.warn(e);
                ElMessage.error("获取数据失败");
            })
            .finally(() => {
                data.loading = false;
            });
    }
};
// const del = (item) => {
//     deleteBattle(item.id).then((res) => {
//         if (res.data?.code === 0) {
//             ElMessage.success("删除成功");
//             getList();
//         } else {
//             ElMessage.error(res.data.msg ?? "删除失败");
//         }
//     });
// };
// const edit = (item) => {
//     editDialog.value.open(item);
// };

// const toggle = (name) => {
//     active.value = name;
// };
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
onMounted(() => {
    getList();
});
</script>

<style lang="less">
.m-del-confirm {
    padding: 16px;
}
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
            .x;
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
        .el-input__inner {
            color: #bfb0ff;
            &::placeholder {
                color: #554d77;
            }
        }

        .el-input__wrapper {
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
            .x;
            padding: 60px;
            height: 100%;
        }

        .u-data {
            flex-grow: 1;
        }

        .u-li {
            .color(#BFB0FF);
            display: flex;
            align-items: center;
            height: 40px;

            &:not(:last-child) {
                border-bottom: 1px solid rgba(191, 176, 255, 0.2);
            }

            .u-type {
                color: white;
                background: #24a4cc;
                border-radius: 10px;
                width: 69px;
                height: 18px;
                .x;
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
            .u-badge {
                .mr(4px);
                .db;
                &.u-private {
                    .mt(4px);
                }

                &.u-star {
                    i {
                        .mr(1px);
                        color: #fbc224;
                    }
                    border: 1px solid #fbc224;
                    color: #edaf05;
                    padding: 0 3px;
                    font-style: normal;
                    font-size: 12px;
                    border-radius: 2px;
                    transform: scale(0.8);
                    flex-shrink: 0;
                }

                &.u-checked svg {
                    .size(16px);
                    .pr;
                    top: 1px;
                }
            }
            .u-name {
                flex-grow: 1;
            }
            .u-opr {
                padding: 0 14px;

                .el-button {
                    color: #bfb0ff;
                    transition: all 0.2s ease-in-out;
                    &:hover {
                        transform: scale(1.05);
                    }
                }
            }
        }

        .u-pagination {
            .el-pagination {
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
.m-index-data__more {
    .flex;
    justify-content: center;
    align-items: center;
    color: #bfb0ff;
}
</style>
