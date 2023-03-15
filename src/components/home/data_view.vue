<template>
    <div class="m-data-view">
        <div class="u-left">
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
                        <span class="u-update">
                            <span>更新：</span>
                            <span>{{ item.updated_at }}</span>
                        </span>
                    </router-link>
                </div>
                <router-link class="u-data__more" to="/public">
                    查看更多<el-icon><DArrowRight /></el-icon>
                </router-link>
            </div>
        </div>
        <div class="u-right">
            <div class="u-title">
                <p class="u-colorful">数据大厅</p>
                <p>各路豪杰的战斗记录</p>
            </div>
            <div class="u-card u-ac">
                <p class="u-card-title">郑重声明</p>
                <div v-html="ac"></div>
            </div>
            <div class="u-card u-jba">
                <p class="u-card-title">绑定魔盒助手</p>
                <p>*此令牌用于魔盒助手身份校验，切勿泄漏。</p>
                <div class="u-jba-token">
                    <p v-if="!jbaToken" @click="getJbaToken" class="u-jba-tip">点击获取并复制临时令牌</p>
                    <template v-else>
                        <el-scrollbar>
                            <p>{{ jbaToken }}</p>
                        </el-scrollbar>
                        <el-button link :icon="DocumentCopy" @click="copyToken()"></el-button>
                    </template>
                </div>
                <p class="u-jba-help">
                    <el-icon><WarningFilled /></el-icon>使用教程
                </p>
                <p>请参考 此教程 在魔盒助手中输入此处生成的令牌，即可快速上传战斗数据</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { WarningFilled, DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getNewToken, getPublicList } from "@/services/team";
import { getBattleAc as _getBattleAc } from "@/services/helper";
import { ref, reactive, onMounted } from "vue";

const data = reactive({
    list: [],
    total: 0,
    page: 1,
    loading: false,
});
const ac = ref("loading...");
const jbaToken = ref(null);
const getJbaToken = () => {
    getNewToken()
        .then((res) => {
            let {
                code,
                data: { token },
            } = res.data;
            if (code == 0) jbaToken.value = token;
        })
        .catch(() => {
            jbaToken.value = "QAQ";
            ElMessage.error("获取失败");
        });
};
const copyToken = () => {
    navigator.clipboard
        .writeText(jbaToken.value)
        .then(() => {
            ElMessage.success("复制成功");
        })
        .catch(() => {
            ElMessage.error("复制失败");
        });
};
const getList = () => {
    data.loading = true;
    getPublicList({
        page: data.page,
        pageSize: 14,
    })
        .then((res) => {
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
const getBattleAc = () => {
    _getBattleAc().then((res) => {
        if (res.data?.code === 200) {
            ac.value = res.data.data.breadcrumb.html;
        }
    });
};

onMounted(() => {
    getList();
    getBattleAc();
});
</script>

<style lang="less">
@import "@/assets/css/home/data_view.less";
</style>
