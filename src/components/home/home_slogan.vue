<template>
    <div class="m-home-slogan">
        <div class="u-content">
            <div class="u-title">
                <p><span class="u-red">JCL</span> 多维度战斗分析</p>
                <p>即开即用 <span class="u-blue">无任何依赖</span></p>
            </div>
            <div class="u-subtitle">
                <p>涵盖团队、成员、首领全时间链行为分析。</p>
                <p>所有增益减益状态获取与技能释放详情具体展现。</p>
                <p>控制，小怪出现时机等完整复盘，重要细节不错过。</p>
            </div>
            <div class="u-buttons">
                <router-link class="u-button" to="/upload">开启上帝的视角</router-link>
                <router-link class="u-button" to="/public">阅览战斗的数据</router-link>
            </div>
            <a class="u-tip" href="/collection/235" target="_blank">*需要了解更多的资讯来使用JCL</a>
        </div>
        <div class="u-icon">
            <div class="u-bg"></div>
            <img class="u-img" src="@/assets/img/battle.svg" />
        </div>
    </div>
</template>

<script setup></script>

<style lang="less" scoped>
@keyframes move {
    0% {
        transform: translateY(0);
    }
    90% {
        transform: translateY(-20px);
    }
    100% {
        transform: translateY(0);
    }
}
.m-home-slogan {
    width: 1440px;
    display: flex;
    .mt(40px);

    justify-content: space-around;

    p {
        margin: 0;
    }
    .u-content {
        .u-title {
            .mb(40px);
            font-weight: 700;
            font-size: 46px;
            line-height: 61px;
            .u-red {
                font-size: 50px;
                background: linear-gradient(91.57deg, #fa5fa6 -1.02%, #e1277f 36.25%);
                background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-left: 10px;
            }
            .u-blue {
                font-size: 50px;
                background: linear-gradient(91.57deg, #31a6fa -1.02%, #1d95f8 36.25%);
                background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-right: 10px;
            }
        }
        .u-subtitle {
            .mb(60px);
            .fz(16px, 28px);
            font-weight: 400;
        }

        .u-buttons {
            display: flex;
            justify-content: space-between;
            width: 458px;
            .u-button {
                cursor: pointer;
                width: 214px;
                font-size: 14px;
                color: #fff;
                line-height: 48px;
                text-align: center;
                background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
                border-radius: 40px;
                border: none;
                transition: all 0.1s ease-in-out;
                &:hover {
                    transform: scale(1.1);
                }
            }
        }
        .u-tip {
            width: 180px;
            margin-top: 14px;
            .db;
            font-size: 12px;
            line-height: 16px;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0.26), rgba(0, 0, 0, 0.26)),
                linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    }
    .u-icon {
        position: relative;
        width: 490px;
        height: 426px;
        background: #554d77;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 100px;
        .u-img {
            position: absolute;
            display: block;
            width: 543px;
            height: 530px;
            bottom: 5px;
            transition: all 0.5s ease-in-out;
            &:hover {
                animation: move 1s ease-in-out infinite;
            }
        }
        .u-bg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 524px;
            height: 455px;
            background: rgba(0, 0, 0, 0.13);
            border-radius: 100px;
        }
    }
}
</style>
