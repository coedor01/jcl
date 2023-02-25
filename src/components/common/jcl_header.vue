<template>
    <div class="c-header">
        <div class="c-header-inner">
            <div class="c-header-nav">
                <div class="u-badge">
                    <img class="u-img" src="@/assets/img/battle.svg" />
                    <span class="u-name">战斗分析</span>
                </div>
                <template v-for="(nav, index) in navs" :key="index">
                    <div class="u-button" :class="{ 'u-button__active': active == nav.name }" @click="navTo(nav)">
                        {{ nav.title }}
                    </div>
                </template>
            </div>
            <div class="c-header-user">
                <div class="u-img-wrapper" v-if="isLogin">
                    <img class="u-img" :src="userAvatar" alt="" draggable="false" />
                </div>
                <div class="u-button u-login" v-else>登录/注册</div>
                <div class="u-button u-button__pink">分析数据</div>
            </div>
        </div>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "JclHeader",
    data: () => ({
        active: "home",
        navs: [
            {
                name: "home",
                title: "首页",
                path: "/",
            },
            {
                name: "rank",
                title: "排行榜",
                path: "/rank",
            },
            {
                name: "activity",
                title: "活动",
                path: "/activity",
            },
        ],
    }),
    methods: {
        navTo(nav) {
            this.active = nav.name;
        },
    },
    computed: {
        isLogin() {
            return User.isLogin();
        },
        userAvatar() {
            return this.isLogin ? User.getInfo().avatar : "";
        },
    },
    mounted() {
        window.user = User;
    },
};
</script>

<style lang="less" scoped>
@import "@/assets/css/app.less";
.c-header {
    padding: 0px 5px;
    background-color: black;
    width: 100%;
    height: 100px;

    border-radius: 5px;
    .c-header-inner {
        .flex-center;
        justify-content: space-between;
        margin: auto;
        width: 1440px;
        height: 100%;
        padding: 10px 30px;

        .c-header-nav {
            .flex-center;
        }

        .u-badge {
            .flex-center;
            .mt(-4px);
            .mr(32px);
            .u-img {
                .size(36px);
                .mr(6px);
            }
            .u-name {
                width: 104px;
                height: 34px;

                font-style: normal;
                font-weight: bold;
                font-size: 26px;
                line-height: 34px;

                color: #ffffff;
            }
        }

        .c-header-user {
            .flex-center;

            .u-img-wrapper {
                .size(30px);
                .mr(20px);
                .u-img {
                    cursor: pointer;
                    .size(30px);
                    border-radius: 30px;
                }
            }
        }

        .u-button {
            user-select: none;
            cursor: pointer;
            margin: 0 10px;

            .x(center);
            font-family: "Microsoft YaHei";
            font-style: normal;
            font-weight: 700;
            font-size: 16px;
            line-height: 30px;

            color: #554d77;
            width: 112px;
            height: 30px;
            border-radius: 50px;
            transition: all 0.3s ease-in-out;

            &.u-button__active {
                background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
                color: white;
            }

            &.u-button__pink {
                background-color: #fa5fa6;
                color: white;
            }
        }
    }
}
</style>
