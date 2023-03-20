<template>
    <div class="m-nav-helper" :style="navSizeStyle">
        <div class="u-nav closed" v-if="!isExpanded" @click="isExpanded = !isExpanded">
            <span class="u-name">导航助手</span>
        </div>
        <div class="u-nav" v-else>
            <div class="u-btn" @click="toTop">
                <img class="u-btn-img" src="@/assets/img/nav/top.svg" />
                <span class="u-btn-name">返回顶部</span>
            </div>
            <router-link class="u-btn" :target="target" :to="{ name: 'analysis' }">
                <img class="u-btn-img" src="@/assets/img/nav/chart.svg" />
                <span class="u-btn-name">分析数据</span>
            </router-link>
            <router-link class="u-btn" :to="{ name: 'public' }" :target="target">
                <img class="u-btn-img" src="@/assets/img/nav/public.svg" />
                <span class="u-btn-name">数据大厅</span>
            </router-link>
            <router-link class="u-btn" :to="{ name: 'mine' }" :target="target">
                <img class="u-btn-img" src="@/assets/img/nav/mine.svg" />
                <span class="u-btn-name">我的数据</span>
            </router-link>
            <div class="u-btn" @click="isExpanded = !isExpanded">
                <span class="u-btn-name">➜收起</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const current = router.currentRoute;

const target = computed(() => {
    const { name } = current.value;
    if (name === "home") {
        return "_self";
    }
    return "_blank";
});
const isExpanded = ref(false);
const toTop = () => {
    window.scrollTo({ top: 0 });
};

const navSizeStyle = computed(() => {
    return isExpanded.value
        ? {
              width: "68px",
              height: "400px",
              top: "calc(50vh - 200px)",
          }
        : {
              width: "26px",
              height: "110px",
              top: "calc(50vh - 55px)",
          };
});
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
    right: 0px;
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
        }
    }
}
</style>
