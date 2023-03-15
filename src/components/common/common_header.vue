<template>
    <div class="c-header" :class="{ isOverlay: isOverlay }">
        <div class="c-header-inner">
            <div class="c-header-inner__left">
                <a class="c-header-logo" href="/jcl">
                    <img class="u-img" src="@/assets/img/battle.svg" />
                    <span class="u-name">战斗分析</span>
                </a>
                <div class="c-header-nav">
                    <router-link class="u-nav" v-for="(nav, index) in navs" :key="index" :to="{ name: nav.name }">
                        {{ nav.title }}
                    </router-link>
                </div>
            </div>
            <div class="c-header-user">
                <div class="u-user" v-if="isLogin">
                    <img class="u-avatar" :src="userdata?.avatar" />
                    <span class="u-name">{{ userdata.name }}</span>
                </div>
                <a class="u-login" v-else :href="login_url">登录|注册</a>
                <router-link class="u-upload" to="/analysis">分析数据</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
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
        isOverlay: true,
        isLogin: User.isLogin(),
        login_url: "/account/login?redirect=" + location.href,
        userdata: User.getInfo(),
    }),
    methods: {
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
.c-header {
    width: 100%;
    height: 100px;
    position: fixed;
    top: 0;
    z-index: 100;

    &.isOverlay {
        background-color: rgba(0, 0, 0, 0.8);
    }
}
.c-header-inner {
    .flex;
    justify-content: space-between;
    margin: auto;
    width: 1440px;
    height: 100%;
    padding: 10px 30px;
}
.c-header-inner__left {
    .flex;
    align-items: center;
    gap: 30px;
}
.c-header-logo {
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

.c-header-nav {
    .flex;

    .u-nav {
        .header-button();
        color: #888;
        transition: all 0.2s ease-in-out;
    }

    .u-nav.router-link-active {
        background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
        color: #fff;
    }
}

.c-header-user {
    .flex;
    align-items: center;

    .u-login {
        color: #eee;
        &:hover {
            color: @pink;
        }
    }

    .u-upload {
        background-color: #fa5fa6;
        color: #fff;
        .header-button();
        .ml(20px);
    }

    .u-user {
        .flex;
        align-items: center;
        gap: 10px;
        .pointer;
        .u-avatar {
            cursor: pointer;
            .size(30px);
            border-radius: 30px;
        }
    }
}
</style>
