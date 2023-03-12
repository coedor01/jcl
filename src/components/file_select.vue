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
                <div class="u-upload-filename">{{ store.file.name ?? "(✪ω✪)" }}</div>
                <template #tip>
                    <div class="u-upload-tip">请将<em>JCL文件</em>拖至框内，或<em>点击上传</em></div>
                    <div class="u-upload-help">
                        <el-icon :size="16"><warning-filled /></el-icon> JCL文件获取指南
                    </div>
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
import { UploadFilled, WarningFilled } from "@element-plus/icons-vue";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { decode } from "iconv-lite";
import { useAnalysis } from "@/utils/uses/useAnalysis";
import { useStore } from "@/store";
import { Buffer } from "buffer";

const store = useStore();
const router = useRouter();
// data
const dialogVisible = ref(false);
const subject = ref("team");
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
    const promise = new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsArrayBuffer(store.file);
    }).then((buffer) => {
        const raw = decode(Buffer.from(buffer), "gbk");
        store.raw = raw;
        return new Promise((resolve) => resolve(true));
    });
    startAnalysis(promise);
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
.m-file-select {
    border-radius: 8px;
    overflow: hidden;
    .size(1000px, 540px);
    .el-dialog__body {
        padding: 0;
    }
    .m-dialog-body {
        .pr;
        .flex-center;
        flex-direction: column;

        .u-close {
            .flex-center;
            .pa;
            .size(45px, 45px);
            .fz(32px);
            right: 30px;
            top: 4px;
            background: #72689d;
            color: #3b3552;
            border-radius: 100%;
            &:hover,
            &:active,
            &:focus {
                background: #72689d;
            }
        }
        .u-bg {
            .pa;
            .db;
            .size(400px, 400px);
            left: -120px;
            top: -120px;
            filter: contrast(0) opacity(0.12);
        }
        .u-upload {
            .w(720px);
            .x(center);

            .el-upload-dragger {
                background-color: transparent;
                border: transparent;
                padding: 10px 0;
            }
            .u-upload-icon {
                color: #b29fff;
                .w(300px);
                .h(200px);
                transform: scale(1.4);
            }
            .u-upload-title {
                .mt(4px);
                .fz(32px, 42px);
                font-weight: bold;
                color: #8d80c1;
            }
            .u-upload-filename {
                .mt(20px);
                .fz(18px, 24px);
            }
            .u-upload-tip {
                .mt(14px);
                color: #8d80c1;
                .fz(24px, 32px);
                em {
                    font-weight: bold;
                    padding: 0 4px;
                    font-style: normal;
                }
            }
            .u-upload-help {
                .mt(20px);
                .fz(18px, 22px);
                text-align: center;
            }
        }
        .u-buttons {
            .mt(14px);
            padding: 4px 0;
            .el-button {
                width: 170px;
                height: 45px;
                border-radius: 10px;
                .fz(18px, 22px);
                font-weight: bold;
                border: none;

                background: #b29fff;
                color: #3b3552;

                &.is-disabled {
                    opacity: 0.5;
                }
            }
            .u-view {
                transition: all 0.2s ease-in-out;
                &.ready {
                    background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
                    color: white;
                }
            }
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
    }
}
</style>
