<template>
    <div class="m-nav-helper" :style="navSizeStyle">
        <div class="u-nav closed" v-if="!isExpanded" @click="toggleExpanded">
            <span class="u-name">导航助手</span>
        </div>
        <div class="u-nav" v-else>
            <div class="u-btn">
                <img class="u-btn-img" src="@/assets/img/nav/top.svg" />
                <span class="u-btn-name">返回顶部</span>
            </div>
            <div class="u-btn">
                <img class="u-btn-img" src="@/assets/img/nav/chart.svg" />
                <span class="u-btn-name">分析数据</span>
            </div>
            <div class="u-btn">
                <img class="u-btn-img" src="@/assets/img/nav/comment.svg" />
                <span class="u-btn-name">我的数据</span>
                <span class="u-btn-name">数据大厅</span>
            </div>
            <div class="u-btn" @click="toggleExpanded">
                <span class="u-btn-name">➜收起</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "NavHelper",
    data: () => ({
        isExpanded: false,
    }),
    props: {
        target: {
            type: String,
            default: "_blank",
        },
    },
    mounted() {},
    methods: {
        toggleExpanded() {
            this.isExpanded = !this.isExpanded;
        },
    },
    computed: {
        navSizeStyle() {
            return this.isExpanded
                ? {
                      width: "68px",
                      height: "332px",
                      top: "320px",
                  }
                : {
                      width: "26px",
                      height: "110px",
                      top: "431px",
                  };
        },
    },
};
</script>

<style lang="less" scoped>
.font {
    font-family: "Inter";
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
}
.m-nav-helper {
    position: fixed;
    right: 10px;
    background: #1a1825;
    border-radius: 10px 0px 0px 10px;
    z-index: 8;
    transition: all 0.15s ease-in-out;

    .flex-center;
    flex-direction: column;

    .u-nav {
        .flex-center;
        flex-direction: column;

        &.closed {
            cursor: pointer;

            .u-name {
                .font;
                width: 14px;

                background: linear-gradient(177.65deg, #fa5fa6 -27.34%, #1d95f8 129.26%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
        }

        .u-btn {
            cursor: pointer;

            .flex-center;
            flex-direction: column;
            padding: 12px 6px;
            transition: all 0.1s ease-in-out;

            .u-btn-img {
                margin-bottom: 8px;
                .size(32px, 32px);
            }

            .u-btn-name {
                height: 17px;

                .font;

                background: linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            &:hover {
                transform: scale(1.05);
            }
        }
    }
}
</style>
