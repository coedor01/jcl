<template>
    <div class="m-video-card w-card">
        <div class="w-card-title">视频回放</div>
        <iframe class="m-video-iframe" :src="videoSrc" frameborder="0" allowfullscreen="true"> </iframe>
    </div>
</template>

<script setup>
import { useStore } from "@/store";
import { computed } from "vue";

const { info } = useStore();
const videoType = computed(() => {
    if (!info) return;
    return info.video_type;
});
const videoSrc = computed(() => {
    if (!info) return;
    if (videoType.value === "bilibili") {
        return `//player.bilibili.com/player.html?bvid=${info.video_identifier}&page=1`;
    }
    if (videoType.value === "douyu") {
        return `//v.douyu.com/video/videoshare/index?vid=${info.video_identifier}`;
    }
    return "";
});
</script>

<style lang="less" scoped>
.m-video-card {
    .mt(20px);
    width: 1400px;
}

.m-video-iframe {
    .size(1400px, 860px);
}
</style>
