<template>
    <div class="c-jcl-header" :class="{ isOverlay: isOverlay }">
        <div class="c-jcl-header-inner">
            <div class="c-jcl-header-inner__left">
                <a class="c-jcl-header-logo" href="/jcl">
                    <img class="u-img" src="@/assets/img/battle.svg" />
                    <span class="u-name">战斗分析</span>
                </a>
                <div class="c-jcl-header-nav">
                    <template v-for="(nav, index) in navs" :key="index">
                        <router-link v-if="nav.enable" class="u-nav" :to="{ name: nav.name }">
                            {{ nav.title }}
                        </router-link>
                        <span v-else class="u-nav is-disabled">
                            {{ nav.title }}
                        </span>
                    </template>
                </div>
            </div>
            <div class="c-jcl-header-user">
                <template v-if="isLogin">
                    <div class="u-user">
                        <img class="u-avatar" :src="userdata?.avatar" />
                        <span class="u-name">{{ userdata.name }}</span>
                        <div class="u-user-pop">
                            <router-link class="u-pop-button" :to="{ name: 'mine' }">我的数据</router-link>
                            <router-link class="u-pop-button" :to="{ name: 'rank' }">我的成绩</router-link>
                            <el-divider />
                            <a class="u-pop-button" href="/">前往主站</a>
                            <div class="u-pop-button" @click="logout">退出登录</div>
                        </div>
                    </div>
                </template>

                <a class="u-login" v-else :href="login_url">登录|注册</a>
                <router-link class="u-analysis" to="/analysis">分析数据</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { ElMessage } from "element-plus";

//import _ from "lodash";
export default {
    name: "CommonHeader",
    data: () => ({
        active: "home",
        navs: [
            {
                name: "home",
                title: "首页",
                path: "/",
                enable: true,
            },
            {
                name: "rank",
                title: "排行榜",
                path: "/rank",
                enable: false,
            },
            {
                name: "activity",
                title: "活动",
                path: "/activity",
                enable: false,
            },
        ],
        isOverlay: true,
        isLogin: User.isLogin(),
        login_url: "/account/login?redirect=" + location.href,
        userdata: User.getInfo(),
    }),
    methods: {
        logout() {
            User.destroy().then(() => {
                location.href = "/";
                ElMessage.success("登出成功");
            });
        },
        // installOverlay() {
        //     const vm = this;
        //     window.addEventListener(
        //         "scroll",
        //         _.throttle(() => {
        //             vm.isOverlay = window.scrollY > 200 ? true : false;
        //         }, 200)
        //     );
        // },
    },
    computed: {},
    mounted() {
        //this.installOverlay();
    },
};
</script>

<style lang="less">
.c-jcl-header {
    width: 100%;
    height: 100px;
    position: fixed;
    top: 0;
    z-index: 100;

    &.isOverlay {
        background-color: rgba(0, 0, 0, 0.8);
    }
}
.c-jcl-header-inner {
    .flex;
    justify-content: space-between;
    box-sizing: border-box;
    margin: auto;
    width: @main-width;
    height: 100%;
    padding: 10px 30px;
}
.c-jcl-header-inner__left {
    .flex;
    align-items: center;
    gap: 30px;
}
.c-jcl-header-logo {
    .flex-center;
    gap: 10px;
    .u-img {
        .size(36px);
    }
    .u-name {
        width: 104px;
        height: 34px;

        font-style: normal;
        font-weight: bold;
        font-size: 26px;
        line-height: 34px;

        color: #ffffff;
        white-space: nowrap;
    }
}

.header-button() {
    user-select: none;
    cursor: pointer;

    .x;
    font-family: "Microsoft YaHei";
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 30px;

    width: 112px;
    height: 30px;
    border-radius: 50px;
}

.c-jcl-header-nav {
    .flex;
    gap: 30px;

    .u-nav {
        .header-button();
        color: #888;
        transition: all 0.2s ease-in-out;
    }

    .u-nav.is-disabled {
        opacity: 0.4;
        cursor: inherit;
    }

    .u-nav.router-link-active {
        background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
        color: #fff;
    }
}

.c-jcl-header-user {
    .flex;
    align-items: center;

    .u-login {
        color: #eee;
        &:hover {
            color: @pink;
        }
    }
    .u-analysis {
        background-color: #fa5fa6;
        color: #fff;
        .header-button();
        .ml(20px);
    }
    .u-user {
        .flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        .size(160px, 60px);
        .pr;
        .pointer;
        .u-avatar {
            cursor: pointer;
            .size(30px);
            border-radius: 30px;
        }
    }
    .u-user:hover {
        .u-user-pop {
            visibility: visible;
            opacity: 1;
        }
    }
    .u-user-pop {
        // 悬浮框效果
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.15s, opacity 0.15s linear;
        // 卡片样式
        width: 156px;
        border: 1px solid #373c41;
        border-radius: 10px;
        background: #000000;
        padding-top: 1px;
        // 定位
        .pa;
        top: 100%;
        right: 0;

        z-index: 20;
        .delta(#000000, #373c41);

        .el-divider {
            margin: 0;
            border-color: #373c41;
        }
    }
    .u-pop-button {
        display: flex;
        align-items: center;
        color: #b3b3b3;
        padding: 10px 24px;
        .fz(14px, 16px);
        .bold;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        border-radius: 8px;
        &:hover {
            background: #373c41;
        }
    }
}
</style>
