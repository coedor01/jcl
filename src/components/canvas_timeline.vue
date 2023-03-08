<template>
    <div class="m-timeline-wrapper" :style="{ height: `${height}px` }" ref="wrapper">
        <canvas id="timeline-canvas" :height="height" :width="width"></canvas>
        <div ref="tooltip" class="u-tooltip">
            <div class="u-tooltip-item" v-for="(v, k) in tooltipData" :key="k">
                <span>{{ k }}: </span>
                <span>{{ v }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { fabric } from "fabric";

export default {
    name: "Timeline",
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        linetime: {
            //每一行展示多长时间
            type: Number,
            default: 60,
        },
        time: {
            type: Number,
            default: 300,
        },
        tooltip: {
            type: Boolean,
            default: true,
        },
    },
    data: () => ({
        padding: 40,
        width: 1100,
        canvas: null,

        lastItem: null,
        tooltipData: {},
    }),
    mounted: function () {
        this.$nextTick(() => {
            this.initCanvas();
            this.render();
        });
    },
    methods: {
        renderLines: function () {
            for (let i = 1; i <= this.lines; i++) {
                const height = 2;
                const top = (i - 1) * 60 + 29;
                const line = new fabric.Line([0, top, this.width - this.padding, top], {
                    stroke: "#e4e7ed",
                    strokeWidth: height,
                    selectable: false,
                });
                const axisText = new fabric.Text(this.linetime * i + "s", {
                    left: this.width - this.padding + 4,
                    top: top - 6,
                    fontSize: 12,
                    selectable: false,
                });
                this.canvas.add(line);
                this.canvas.add(axisText);
            }
        },
        renderItems: function () {
            this.lastItem = null;
            for (let item of this.data) {
                const height = 12;
                const { left, top } = this.itemPosition(item.time);
                // 渲染小方块
                const rect = new fabric.Rect({
                    left: left,
                    top: top,
                    width: 3,
                    height: height,
                    fill: item.extra?.color ?? "#ee6666",
                    selectable: false,
                });
                if (this.tooltip) {
                    rect.on("mouseover", () => {
                        this.showTooltip(item);
                    });
                    rect.on("mouseout", () => {
                        this.closeTooltip();
                    });
                    rect.on("mousemove", (e) => {
                        let height = Object.keys(item.extra?.tooltip ?? {}).length * 12;
                        this.moveTooltip(e.pointer, height);
                    });
                }
                this.canvas.add(rect);
                // 如果上一个渲染的item和当前item的时间间隔太短就不渲染标签
                if (this.lastItem) {
                    const { left: lastLeft, top: lastTop } = this.itemPosition(this.lastItem.time);
                    if (lastTop == top && left - lastLeft < 26) {
                        continue;
                    }
                }
                const nameText = new fabric.Text(item.content, {
                    left: left,
                    top: top - 16,
                    fontSize: 14,
                    selectable: false,
                });
                let digits = {
                    15: 2,
                    30: 1,
                    45: 1,
                    60: 0,
                };
                let time = item.time.toFixed(digits[this.linetime]) + "s";
                const timeText = new fabric.Text(time, {
                    left: left,
                    top: top + 14,
                    fontSize: 14,
                    selectable: false,
                });
                this.canvas.add(nameText);
                this.canvas.add(timeText);
                this.lastItem = item;
            }
        },
        render: function () {
            if (!this.canvas) return;
            this.canvas.setDimensions({
                width: this.width,
                height: this.height,
            });
            this.canvas.clear();
            this.renderLines();
            this.renderItems();
        },
        initCanvas: function () {
            this.canvas = new fabric.Canvas("timeline-canvas", {
                hoverCursor: "pointer",
            });
            this.canvas.selection = false;
        },
        itemPosition: function (time) {
            const line = Math.max(0, Math.floor(time / this.linetime));
            const top = line * 60 + 24;
            const left = Math.max(0, ((time % this.linetime) / this.linetime) * (this.width - this.padding));
            return { left, top };
        },
        closeTooltip: function () {
            const tooltip = this.$refs.tooltip;
            tooltip.style.visibility = "hidden";
        },
        showTooltip: function (item) {
            this.tooltipData = item?.extra.tooltip ?? {};
            if (!this.tooltipData) return;
            const tooltip = this.$refs.tooltip;
            tooltip.style.visibility = "visible";
        },
        moveTooltip: function (pointer, height) {
            const tooltip = this.$refs.tooltip;
            let x = Math.max(0, Math.min(pointer.x - 80, 960));
            let y = pointer.y - height - 48;
            tooltip.style.left = x + "px";
            tooltip.style.top = y + "px";
        },
    },
    computed: {
        lines: function () {
            return Math.ceil(this.time / this.linetime);
        },
        height: function () {
            return (this.lines + 1) * 60;
        },
    },
    watch: {
        data: {
            handler: function () {
                this.render();
            },
            deep: true,
        },
        linetime: function () {
            this.render();
        },
    },
};
</script>

<style lang="less">
.m-timeline-wrapper {
    max-width: 960px;
    position: relative;
    .u-tooltip {
        position: absolute;
        box-shadow: 0 0 2px #aaa;
        background: #fff;
        border-radius: 4px;
        width: 200px;
        padding: 8px;
        visibility: hidden;
        color: #303133;
        font-size: 12px;
    }
}
</style>
