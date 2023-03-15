<template>
    <div class="p-view">
        <div class="m-view-card">
            <template v-if="!error">
                <div class="m-title">{{ title }}</div>
                <div class="m-desc">{{ desc }}</div>
                <el-progress :show-text="false" :percentage="progress" :stroke-width="10" />
                <div class="m-view-logs">
                    <div v-if="downProgress">
                        <el-icon v-if="downProgress != 100" class="is-loading"> <Loading /> </el-icon>
                        <el-icon v-else> <Checked /> </el-icon>
                        下载数据文件
                    </div>
                    <div v-if="inflateProgress">
                        <el-icon v-if="inflateProgress != 100" class="is-loading"> <Loading /> </el-icon>
                        <el-icon v-else> <Checked /> </el-icon>
                        解压数据文件
                    </div>
                    <div v-if="analysisProgress">
                        <el-icon v-if="analysisProgress != 100" class="is-loading"> <Loading /> </el-icon>
                        <el-icon v-else> <Checked /> </el-icon>
                        分析JCL
                    </div>
                    <div v-if="analysisProgress === 100">
                        <el-icon class="is-loading"> <Loading /> </el-icon>
                        即将跳转
                    </div>
                </div>
            </template>
            <el-alert v-else title="数据不存在或没有访问权限" type="error" :closable="false" show-icon center />
        </div>
    </div>
</template>

<script setup>
import { defineComponent, onMounted, ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import { getBattle, getJclBattle } from "@/services/team";
import { useAnalysis } from "@/utils/uses/useAnalysis";
import { useDownload } from "@/utils/uses/useDownload";

defineComponent({
    name: "ViewIndex",
});
const store = useStore();
const router = useRouter();
const { query } = router.currentRoute.value;
const { id, battle_id } = query;
const error = ref(false);
const { startDownload, inflateProgress, downProgress } = useDownload();
const { startAnalysis, progress: analysisProgress, ready } = useAnalysis();

const title = computed(() => {
    return store.info.title ?? "...";
});
const desc = computed(() => {
    return store.info.desc ?? "...";
});
const progress = computed(() => {
    return downProgress.value * 0.2 + inflateProgress.value * 0.2 + analysisProgress.value * 0.6;
});

const getBattleInfo = async () => {
    let res;
    if (id) res = await getBattle(id);
    if (battle_id) res = await getJclBattle(battle_id);
    if (!res) {
        error.value = true;
        return;
    }
    const { code, data } = res.data ?? {};
    if (code === 0) {
        // 只管jcl相关的
        if (data.type == "jcl") {
            store.info = data;
            store.subject = "team";
            return true;
        } else {
            ElMessage.error("暂不支持非JCL文件的分析");
            router.push({ name: "home" });
        }
    } else {
        error.value = true;
    }
};

const init = async () => {
    // 有结果直接跳转到结果页
    if (store.result) {
        if (store.subject === "pvp") {
            router.push({ name: "pvp" });
        } else {
            router.push({ name: "pve" });
        }
    }
    // 没有分析结果，也没有id，也没有battle_id，跳转到首页
    if (!store.result && !id && !battle_id) {
        router.push({ name: "home" });
    }

    getBattleInfo()
        .then((next) => {
            if (!next) return new Promise();
            return startDownload();
        })
        .then(() => {
            if (!store.raw) return new Promise();
            startAnalysis();
        });
};

watch(ready, () => {
    if (!ready.value) return;
    if (store.subject === "pvp") {
        router.push({ name: "pvp" });
    } else {
        router.push({ name: "pve" });
    }
});
onMounted(() => {
    init();
});
</script>

<style lang="less">
.p-view {
    .flex-center;
    .mt(80px);

    .m-view-card {
        .size(1000px, 240px);
        background: #3b3652;
        border-radius: 10px;
        padding: 40px 0;
    }

    .el-progress {
        .mt(10px);
        width: 100%;
        height: 10px;
        .el-progress-bar__outer,
        .el-progress-bar__inner {
            border-radius: 0;
        }
    }

    .m-title {
        .x;
        .fz(18px, 26px);
        .bold;
        .mb(16px);
    }

    .m-desc {
        .x;
        .fz(14px, 18px);
        color: #b3b3b3;
        .mb(16px);
    }

    .m-view-logs {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding-top: 40px;
        .fz(14px, 18px);
        color: #b3b3b3;

        .el-icon {
            .mr(16px);
        }

        & > div {
            .flex-center;
        }
    }
}
</style>
