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
                accept=".jcl"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="fileChange"
                :disabled="status == statusCode.loading"
                :class="{ 'is-fill': store.file.name }"
                ref="upload"
            >
                <upload-filled class="u-upload-icon" />
                <div v-if="!store.file.name" class="u-select-file">选择或拖拽文件</div>
                <div v-else class="u-file-info">
                    <div class="u-upload-filename">{{ store.file.name }}</div>
                    <!-- <div class="u-filemeta">{{ fileType }}</div> -->
                    <div class="u-filemeta">
                        文件大小:<b>{{ fileSize }}</b>
                    </div>
                </div>
                <template #tip>
                    <div class="u-upload-help">
                        <el-icon :size="16"><info-filled /></el-icon>
                        <span>仅支持<b>*.jcl</b>文件</span>
                        <a href="/tool/22456" target="_blank">获取指南</a>
                    </div>
                </template>
            </el-upload>
            <div class="u-buttons" v-if="status != statusCode.upload">
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
import { ElMessage } from "element-plus";

const store = useStore();
const router = useRouter();
// data
const dialogVisible = ref(false);
const { subject } = toRefs(store);
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
const fileSize = computed(() => {
    return store.file.size > 1024 * 1024
        ? (store.file.size / 1024 / 1024).toFixed(2) + " M"
        : (store.file.size / 1024).toFixed(2) + " K";
});
// const fileType = computed(() => {
//     if (!store.file.name) return;
//     // if (store.file.name.endsWith(".jcl")) return "JCL - JX3 Combat Log";
//     return "不支持的文件类型";
// });
// event
const fileChange = (file) => {
    store.file = file.raw;
    progress.value = 0;
    ready.value = false;
};
const start = () => {
    if (!store.file.name.endsWith(".jcl")) {
        ElMessage.error("仅支持JCL文件");
        return;
    }
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
