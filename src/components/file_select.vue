<template>
    <el-dialog
        v-model="dialogVisible"
        :append-to-body="true"
        :show-close="false"
        :close-on-click-modal="false"
        :align-center="true"
        :lock-scroll="false"
        class="m-file-select"
    >
        <div class="m-dialog-body">
            <el-button class="u-close" link @click="dialogVisible = false">×</el-button>
            <img class="u-bg" :src="icons[subject]" alt="" draggable="false" />
            <!-- 上传组件 -->
            <el-upload
                class="u-upload"
                drag
                accept="jcl"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="fileChange"
                :disabled="status == statusCode.loading"
                ref="upload"
            >
                <upload-filled class="u-upload-icon" />
                <div class="u-upload-title">{{ subjectName[subject] }}</div>
                <div class="u-upload-filename">{{ store.file.name ?? "点击上传" }}</div>
                <template #tip>
                    <div class="u-upload-tip">仅支持<em>JCL</em>文件</div>
                    <a class="u-upload-help" href="/tool/22456" target="_blank">
                        <el-icon :size="22"><info-filled /></el-icon> JCL文件获取指南
                    </a>
                </template>
            </el-upload>
            <div class="u-buttons">
                <el-button
                    class="u-start"
                    :disabled="[statusCode.upload, statusCode.ready].includes(status)"
                    :loading="status == statusCode.loading"
                    @click="start"
                    >开始分析</el-button
                >
                <el-button
                    class="u-view"
                    :class="{ ready: status == statusCode.ready }"
                    :disabled="status != statusCode.ready"
                    @click="view"
                    >查看分析</el-button
                >
            </div>
            <el-progress :show-text="false" :percentage="progress" :stroke-width="10" />
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, toRefs, computed } from "vue";
import { useRouter } from "vue-router";
import { decode } from "iconv-lite";
import { useAnalysis } from "@/utils/uses/useAnalysis";
import { useStore } from "@/store";
import { Buffer } from "buffer";

const store = useStore();
const router = useRouter();
// data
const dialogVisible = ref(false);
const { subject } = toRefs(store);
const subjectName = {
    team: "团队行为分析",
    boss: "首领行为分析",
    pvp: "竞技多维分析",
};
const icons = {
    team: require("@/assets/img/home/action.svg"),
    boss: require("@/assets/img/home/boss.svg"),
    pvp: require("@/assets/img/home/pvp.svg"),
};
const statusCode = {
    upload: 0,
    default: 1,
    loading: 2,
    ready: 3,
};
const upload = ref(null);
const { startAnalysis, progress, ready } = useAnalysis();

const status = computed(() => {
    // 害没选文件
    if (!store.file.name) return statusCode.upload;
    // 选了文件，还没开始分析
    if (progress.value === 0) return statusCode.default;
    // 正在分析
    if (!ready.value) return statusCode.loading;
    // 分析完毕
    return statusCode.ready;
});
// event
const fileChange = (file) => {
    store.file = file.raw;
    progress.value = 0;
    ready.value = false;
};
const start = () => {
    store.result = {};
    new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsArrayBuffer(store.file);
    })
        .then((buffer) => {
            const raw = decode(Buffer.from(buffer), "gbk");
            store.raw = raw;
            return new Promise((resolve) => resolve(true));
        })
        .then(() => {
            startAnalysis();
        });
};
const view = () => {
    if (subject.value === "pvp") {
        router.push({ name: "pvp" });
    } else {
        router.push({ name: "pve" });
    }
};

// methods
const open = (sub) => {
    dialogVisible.value = true;
    subject.value = sub;
};
defineExpose({
    open,
});
</script>

<style lang="less">
@import "@/assets/css/common/file_select.less";
</style>
