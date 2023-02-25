<template>
    <div class="m-data-view">
        <div class="u-left">
            <data-list></data-list>
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
                    <p v-if="!jbaToken">点击获取并复制临时令牌</p>
                    <p v-else>{{ jbaToken }}</p>
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
import DataList from "./data_list.vue";
import { WarningFilled } from "@element-plus/icons-vue";
import { getBattleAc } from "@/services/helper";
import { ref, onMounted } from "vue";

const ac = ref("loading...");
const jbaToken = ref(null);

onMounted(async () => {
    const res = (await getBattleAc()).data;
    if (res.code == 200) ac.value = res.data.breadcrumb.html;
});
</script>

<style lang="less">
@import url("@/assets/css/app.less");
p {
    margin: 0;
}
.m-data-view {
    display: flex;
    padding: 0 80px 90px;

    .u-left {
        flex-grow: 1;
        width: 890px;
        .mr(20px);
    }

    .u-right {
        width: 350px;
        .u-title {
            .fz(36px, 44px);
            .x(right);
            .mb(20px);

            p.u-colorful {
                .bold;
                background: linear-gradient(88.56deg, #1d95f8 0.51%, #fa5fa6 101.59%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                display: inline-block;
                .mb(8px);
            }
        }
        .u-card {
            color: #a798e6;
            background: rgba(85, 77, 119, 0.3);
            border-radius: 10px;
            padding: 20px;
            .fz(14px, 18px);

            &:not(:last-of-type) {
                .mb(40px);
            }
            .u-card-title {
                font-weight: bold;
                .fz(16px, 19px);
            }
            p {
                .mb(8px);
            }
        }
        .u-jba {
            .u-jba-token {
                cursor: pointer;
                background: #554d77;
                border-radius: 10px;
                color: #b29fff;
                padding: 16px 0;
                margin: 8px 0;
                .bold;
                .fz(20px, 26px);
                .x(center);

                & > p {
                    margin: 0;
                }
            }

            .u-jba-help {
                display: flex;
                align-items: center;

                .el-icon {
                    .mr(8px);
                }
            }
        }
    }
}
</style>
