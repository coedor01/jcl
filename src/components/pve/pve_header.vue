<template>
    <div class="m-pve-header" :style="headerBackground">
        <div class="u-title">{{ displayTitle }}</div>
        <div class="u-overview">
            <div class="u-li" v-for="(item, index) in displayOverview" :key="index">
                <span class="u-li-title">{{ item.title }}</span>
                <span class="u-li-value">{{ item.value }}</span>
            </div>
        </div>
        <div class="u-meta">
            <div>
                <span>开始时间：{{ displayStart }}</span>
                <span>结束时间：{{ displayEnd }}</span>
                <span>服务器：{{ displayServer }}</span>
            </div>
            <div>
                <span>数据类型：JCL - JX3 Combat Log</span>
            </div>
        </div>
        <div class="u-tabs">
            <div
                class="u-tab"
                v-for="(tab, index) in showTab"
                :key="index"
                :class="{ 'is-active': mainTab === tab.name, [tab.name]: true }"
                @click="switchTab(tab.name, tab)"
            >
                <img class="u-tab-icon" :src="tab.icon" :draggable="false" />
                <div class="u-tab-title">{{ tab.title }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, toRefs } from "vue";
import { useStore } from "@/store";
import { usePve } from "@/store/pve";
import { getMaps, getBannerIndex } from "@/services/img";
import { displayDuration, displayBigNumber } from "@/utils/common";
import { moment } from "@jx3box/jx3box-common/js/moment";
import jx3box_url from "@jx3box/jx3box-common/data/jx3box.json";
import { useRouter } from "vue-router";
const { __imgPath } = jx3box_url;

const store = useStore();
const { mainTab } = toRefs(usePve());
// data
const tabList = [
    {
        name: "overview",
        icon: require("@/assets/img/pve/header_overview.svg"),
        title: "全局总览",
    },
    {
        name: "detail",
        icon: require("@/assets/img/pve/header_detail.svg"),
        title: "单位详情",
    },
    {
        name: "compare",
        icon: require("@/assets/img/pve/header_compare.svg"),
        title: "单位对比",
    },
    {
        name: "video",
        icon: require("@/assets/img/common/video.svg"),
        title: "视频回放",
    },
    {
        name: "logs",
        icon: require("@/assets/img/pve/header_logs.svg"),
        title: "全部记录",
    },
    {
        name: "upload",
        icon: require("@/assets/img/common/upload.svg"),
        title: "云端保存",
    },
];
const showTab = computed(() => {
    return tabList.filter((tab) => {
        if (tab.name === "upload" && store.info != "") return false;
        if (tab.name === "video" && !store.info.video_identifier) return false;
        return true;
    });
});
const mapNames = ref({});
const imgIndex = ref(null);

// computed
const displayTitle = computed(() => {
    const { info, file } = store;
    const title = info.title || file.name || "这是一个标题！这是一个标题！这是一个标题！这是一个标题！";
    return title.replace(/\.jcl$/, "");
});
const displayStart = computed(() => {
    const { start } = store.result;
    if (!start) return "-";
    return moment(start.sec * 1000).format("YYYY-MM-DD HH:mm:ss");
});
const displayEnd = computed(() => {
    const { start, end } = store.result;
    if (!start) return "-";
    return moment((start.sec + end.sec) * 1000).format("YYYY-MM-DD HH:mm:ss");
});
const displayServer = computed(() => {
    const { server, map } = store.result;
    const mapName = mapNames.value[map] ?? "未知地图";
    return server + " - " + mapName;
});
const displayOverview = computed(() => {
    const { stats, entities, end } = store.result;
    if (!entities) return [];
    // 求目标NPC，应该是承伤最高的那个
    let target = "-";
    let maxBeDamaged = 0;
    for (let entity in stats.beDamaged) {
        if (entities[entity].type === "player") continue;
        const beDamagedValue = stats.beDamaged[entity].all.value;
        if (beDamagedValue > maxBeDamaged) {
            maxBeDamaged = beDamagedValue;
            target = entities[entity].name;
        }
    }
    // 求全团伤害
    let totalDamage = 0;
    for (let entity in stats.damage) {
        if (!entities[entity]) continue;
        if (entities[entity].type === "player") {
            totalDamage += stats.damage[entity].all.value;
        }
    }

    return [
        {
            title: "目标",
            value: target,
        },
        {
            title: "总伤害",
            value: displayBigNumber(totalDamage),
        },
        {
            title: "总时长",
            value: displayDuration(end.sec),
        },
        {
            title: "团队秒伤",
            value: displayBigNumber(totalDamage / end.sec),
        },
    ];
});
const banner = computed(() => {
    if (!imgIndex.value) return null;
    if (!displayOverview.value.length) return null;
    const target = displayOverview.value[0].value;
    return imgIndex.value[target];
});
const headerBackground = computed(() => {
    if (banner.value) {
        return {
            backgroundImage: `linear-gradient(90deg, #000000 0%, rgba(0, 0, 0, 0) 72.12%), url(${banner.value})`,
        };
    }
    return null;
});

// event
const switchTab = (tab) => {
    if (mainTab.value == tab) return;
    mainTab.value = tab;
};

onMounted(() => {
    getMaps().then((res) => {
        mapNames.value = res.data;
    });
    getBannerIndex().then((res) => {
        imgIndex.value = res.data;
        if (imgIndex.value.length) {
            imgIndex.value = imgIndex.value.reduce((obj, item) => {
                obj[item.npcName] = `${__imgPath}/pve/${item.banner}`;
                return obj;
            }, {});
        } else {
            imgIndex.value = {};
        }
    });
    const router = useRouter();
    window.router = router;
});
</script>

<style lang="less" scoped>
.m-pve-header {
    .pr;
    .size(1400px, 174px);
    padding: 20px;
    margin-top: 60px;
    border-radius: 20px;
    background-image: linear-gradient(90deg, #000000 0%, rgba(0, 0, 0, 0) 72.12%), url("@/assets/img/pve/header_bg.png");

    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    .u-title,
    .u-meta {
        max-width: 860px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .u-title {
        .bold;
        .fz(32px, 42px);
        color: #ffffff;
    }
    .u-overview {
        .size(400px, 40px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #b3b3b3;

        .u-li {
            .flex-center;
            flex-direction: column;
            gap: 2px;
            span {
                display: inline-block;
                .bold;
            }
            .u-li-title {
                .fz(12px, 16px);
            }

            .u-li-value {
                .fz(16px, 21px);
            }
        }
    }
    .u-meta {
        .fz(12px, 16px);
        color: #c4c4c4;

        div {
            margin-bottom: 4px;
        }

        span:not(:first-of-type) {
            margin-left: 12px;
        }
    }
    .u-tabs {
        .pa;
        right: 20px;
        bottom: 20px;
        height: 80px;

        display: flex;
        align-items: flex-start;
        justify-content: space-evenly;
        padding: 0px 20px;
        gap: 20px;

        background: #000000;
        border-radius: 20px;

        .u-tab {
            .pointer;
            user-select: none;
            .flex-center;
            .size(80px, 80px);
            flex-direction: column;
            gap: 4px;
            .colorful-text(linear-gradient(90deg, #fa5fa6 0%, #1d95f8 100%));
            transition: all 0.2s ease-in-out;

            &:not(.is-active) {
                filter: brightness(0.8) grayscale(1);
            }

            .u-tab-icon {
                .size(45px, 35px);
                .db;
            }

            .u-tab-title {
                .bold;
                .fz(14px, 18px);
            }
        }

        .u-tab.upload .u-tab-icon {
            .size(52.5px, 35px);
        }
    }
}
</style>
