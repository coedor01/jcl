<template>
    <div class="m-pixi-player">
        <canvas id="canvas11" width="500" height="500"></canvas>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import * as PIXI from "pixi.js";

const drawPixi = () => {
    const player = document.querySelector("#canvas11");
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true,
        transparent: true,
        view: player,
    });
    let p = new PIXI.Sprite(PIXI.Texture.WHITE);
    p.width = 100;
    p.height = 100;
    app.stage.addChild(p);
    setInterval(() => {
        p.x += 1;
        p.y += 1;
    }, 1000 / 60);
};

onMounted(() => {
    drawPixi();
});
</script>

<style lang="less">
.m-pixi-player {
    width: 500px;
    height: 500px;
}
</style>
