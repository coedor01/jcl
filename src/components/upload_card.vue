<template>
    <div class="m-upload-card w-card">
        <div class="w-card-title">标题</div>
        <el-input v-model="form.title" size="large" placeholder="请输入标题"></el-input>
        <div class="w-card-title">视频地址</div>
        <div class="u-video-types">
            <check-button class="u-douyu" v-model="form.video_type" type="radio" value="douyu" :can-cancel="true"
                >斗鱼</check-button
            >
            <check-button class="u-bilibili" v-model="form.video_type" type="radio" value="bilibili" :can-cancel="true">
                bilibili
            </check-button>
        </div>
        <el-input v-model="form.video_identifier" size="large" placeholder="请输入视频号"></el-input>
        <div class="w-card-title">描述</div>
        <el-input
            v-model="form.desc"
            type="textarea"
            size="large"
            resize="none"
            :rows="10"
            placeholder="请输入标题"
        ></el-input>
        <div class="w-card-title">查看权限</div>
        <div class="u-visible">
            <check-button v-model="form.visible" type="radio" :value="0">公开</check-button>
            <check-button v-model="form.visible" type="radio" :value="1">私有</check-button>
            <check-button v-model="form.visible" type="radio" :value="2">仅亲友</check-button>
        </div>
        <el-button class="u-upload" @click="submit" :loading="!canUpload">上传到云端并且保存</el-button>
        <div class="u-progress-tip">
            <!-- 刚进入页面的时候需要开子线程把raw变成UInt8Array花时间 -->
            <template v-if="deflateProgress == -1">
                <span>正在准备压缩...... </span>
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
            </template>
            <!-- 用户填写信息的时候异步压缩文件 -->
            <template v-else-if="deflateProgress != 100">
                <span>正在压缩文件...... </span>
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
            </template>
            <template v-else-if="uploading && !ossConfig">
                <span>正在获取上传令牌...... </span>
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
            </template>
            <!-- 上传进度提示 -->
            <template v-else-if="uploading">
                <span>正在上传...... </span>
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
            </template>
        </div>
    </div>
</template>

<script setup>
import { getUploadToken, addBattle } from "@/services/team";
import CheckButton from "@/components/common/check_button.vue";
import PakoWorker from "@/utils/pako.worker";
import { ElMessage } from "element-plus";
import { useStore } from "@/store";
import { ref, onMounted, computed } from "vue";
import OSS from "ali-oss";

const store = useStore();

// 用户填写表单
const form = ref({
    title: "",
    desc: "",
    visible: 1,
    video_type: "douyu",
    video_identifier: null,
    type: "jcl",
    subject: "team",
    raw: "",
});

// 数据压缩
const deflatedData = ref(null);
const deflateProgress = ref(-1);
const deflate = () => {
    const worker = new PakoWorker();
    worker.onmessage = (e) => {
        const {
            data: { type, data },
        } = e;
        if (type === "progress") {
            deflateProgress.value = data;
        } else if (type === "result") {
            deflatedData.value = data;
            worker.terminate();
        }
    };
    worker.postMessage({
        cmd: "deflate",
        raw: store.raw,
    });
};

// 数据上传
const uploading = ref(false);
const offConfig = ref(null);
const targetPath = ref(null);

const canUpload = computed(() => {
    return deflateProgress.value === 100 && !uploading.value;
});
const getToken = async () => {
    return getUploadToken(form.value.type)
        .then((res) => {
            const {
                data: { code, msg, data },
            } = res;
            if (code !== 0) {
                ElMessage.error(msg);
                return;
            }
            targetPath.value = data.filepath;
            form.value.raw = data.onlineURL;
            offConfig.value = {
                endpoint: data.endpoint ?? "oss-cn-hangzhou.aliyuncs.com",
                region: data.region ?? "cn-hangzhou",
                accessKeyId: data.token.AccessKeyId,
                accessKeySecret: data.token.AccessKeySecret,
                stsToken: data.token.SecurityToken,
                bucket: data.bucket,
            };
            return;
        })
        .catch((err) => {
            console.log(err);
            ElMessage.error("上传令牌获取失败，请勿频繁操作");
        });
};
const upload = async () => {
    await getToken();
    if (!offConfig.value) {
        return;
    }
    const client = new OSS(offConfig.value);
    const data = new Blob([deflatedData.value], { type: "application/gzip" });
    return client
        .put(targetPath.value, data)
        .then(() => {
            return addBattle(form.value);
        })
        .then((res) => {
            const { code, data, msg } = res.data;
            if (code !== 0) {
                ElMessage.error(msg);
                return;
            }
            store.info = data;
            ElMessage.success("已上传完毕，估计需要1~3分钟同步结束之后才能访问。");
        });
};
const submit = () => {
    if (!form.value.title) {
        ElMessage.error("标题不能为空");
        return;
    }
    uploading.value = true;
    upload()
        .catch((err) => {
            ElMessage.error("上传失败，请F12打开控制台反馈报错信息");
            console.log(err);
        })
        .finally(() => {
            uploading.value = false;
        });
};

// mounted
onMounted(() => {
    if (!store.raw) {
        return;
    }
    deflate();
});
</script>

<style lang="less">
.m-upload-card {
    .mt(20px);
    width: 1400px;

    .el-input__wrapper {
        padding: 6px 20px;
    }
    .el-textarea__inner {
        padding: 16px 20px;
    }

    .w-check-button {
        min-width: 120px;
    }

    .u-video-types {
        display: inline-flex;
        gap: 20px;
        width: max-content;

        .w-check-button {
            min-width: 120px;
            border-radius: 5px;

            &.u-douyu.is-active {
                background: #e68832;
                color: white;
            }

            &.u-bilibili.is-active {
                background: #ff7b93;
                color: white;
            }
        }
    }

    .u-visible {
        display: inline-flex;
        gap: 20px;
        width: max-content;
    }

    .u-upload {
        align-self: center;
        .mt(40px);
        .size(228px, 48px);
        .fz(18px, 32px);
        .bold;
        border: none;
        background: #7650f8;
        border-radius: 50px;
        color: white;
    }

    .u-progress-tip {
        align-self: center;
        .mb(40px);
        .fz(14px, 32px);
        .bold;
        color: #b3b3b3;
    }
}
</style>
