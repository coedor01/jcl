<template>
    <div class="m-timeline-wrapper" :style="{ height: `${height}px` }" ref="wrapper">
        <canvas id="timeline-canvas"></canvas>
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
const RECT_HEIGHT = 12;

export default {
    name: "CanvasTimeline",
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
        width: 1400,
        canvas: null,

        lastItem: null,
        tooltipData: {},
        color: "#a798e6",

        itemCache: null,
        layoutCache: null,
        displayingItemGroup: [],
    }),
    mounted: function () {
        this.itemCache = {};
        this.layoutCache = {};
        this.$nextTick(() => {
            this.initCanvas();
            this.render();
        });
    },
    methods: {
        renderLines: function () {
            if (this.layoutCache[this.linetime]) {
                const group = this.layoutCache[this.linetime];
                this.canvas.add(group);
                return;
            }
            const group = new fabric.Group([], {
                selectable: false,
                objectCaching: false,
            });

            for (let i = 1; i <= this.lines; i++) {
                const height = 2;
                const top = (i - 1) * 60 + 29;
                const line = new fabric.Line([0, top, this.width - this.padding, top], {
                    stroke: "#888",
                    strokeWidth: height,
                    selectable: false,
                    objectCaching: false,
                });
                const axisText = new fabric.Text(this.linetime * i + "s", {
                    stroke: "#fff",
                    left: this.width - this.padding + 4,
                    top: top - 6,
                    fontSize: 12,
                    selectable: false,
                    objectCaching: false,
                });
                group.add(line);
                group.add(axisText);
            }
            group.addWithUpdate();
            this.layoutCache[this.linetime] = group;
            this.canvas.add(group);
            return;
        },
        renderItems: function () {
            this.lastItem = null;
            for (let item of this.data) {
                const item_group = new fabric.Group([], {
                    selectable: false,
                    objectCaching: false,
                });
                const height = RECT_HEIGHT;
                const { left, top } = this.itemPosition(item.time);
                // 渲染小方块
                const rect = new fabric.Rect({
                    left: left,
                    top: top,
                    width: 6,
                    height: height,
                    fill: item.extra?.color ?? this.color,
                });
                item_group.add(rect);
                // 如果上一个渲染的item和当前item的时间间隔太短就不渲染标签
                if (this.lastItem) {
                    const { left: lastLeft, top: lastTop } = this.itemPosition(this.lastItem.time);
                    if (lastTop == top && left - lastLeft < 26) {
                        continue;
                    }
                }
                this.lastItem = item;

                const nameText = new fabric.Text(item.content, {
                    fontWeight: "100",
                    stroke: "#aaa",
                    left: left,
                    top: top - 16,
                    fontSize: 12,
                });
                let digits = {
                    15: 2,
                    30: 1,
                    45: 1,
                    60: 0,
                };
                let time = item.time.toFixed(digits[this.linetime]) + "s";
                const timeText = new fabric.Text(time, {
                    stroke: this.color,
                    left: left,
                    top: top + 14,
                    fontSize: 12,
                    selectable: false,
                    objectCaching: false,
                });
                item_group.add(nameText);
                item_group.add(timeText);
                item_group.addWithUpdate();
                if (this.tooltip) {
                    item_group.on("mouseover", () => {
                        this.showTooltip(item);
                    });
                    item_group.on("mouseout", () => {
                        this.closeTooltip();
                    });
                    item_group.on("mousemove", (e) => {
                        let height = Object.keys(item.extra?.tooltip ?? {}).length * 12;
                        this.moveTooltip(e.pointer, height);
                    });
                }
                item_group[Symbol("item")] = item;
                this.canvas.add(item_group);
            }
            return;
        },
        patch: function () {
            // TODO: 有bug！先不用
            const objects = this.canvas.getObjects();
            for (let obj of objects) {
                if (!obj[Symbol("item")]) continue;
                if (!this.data.includes(obj[Symbol("item")])) {
                    this.canvas.remove(obj);
                }
            }
            for (const item of this.data) {
                if (this.itemCache[item.time]) {
                    this.itemCache[item.time].push(item);
                } else {
                    const item_group = new fabric.Group([], {
                        selectable: false,
                        objectCaching: false,
                    });
                    const { left, top } = this.itemPosition(item.time);
                    // 渲染小方块
                    const rect = new fabric.Rect({
                        left: left,
                        top: top,
                        width: 6,
                        height: RECT_HEIGHT,
                        fill: item.extra?.color ?? this.color,
                    });
                    item_group.add(rect);
                    const nameText = new fabric.Text(item.content, {
                        fontWeight: "100",
                        stroke: "#aaa",
                        left: left,
                        top: top - 16,
                        fontSize: 12,
                    });
                    let digits = {
                        15: 2,
                        30: 1,
                        45: 1,
                        60: 0,
                    };
                    let time = item.time.toFixed(digits[this.linetime]) + "s";
                    const timeText = new fabric.Text(time, {
                        stroke: this.color,
                        left: left,
                        top: top + 14,
                        fontSize: 12,
                        selectable: false,
                        objectCaching: false,
                    });
                    item_group.add(nameText);
                    item_group.add(timeText);
                    item_group.addWithUpdate();
                    if (
                        this.canvas.getObjects().some((obj) => {
                            return (
                                obj.top == item_group.top &&
                                obj.left < item_group.left + 32 &&
                                obj.left > item_group.left - 32
                            );
                        })
                    ) {
                        item_group.remove(nameText);
                        item_group.remove(timeText);
                    }
                    item_group.addWithUpdate();
                    item_group[Symbol("item")] = item;
                    this.canvas.add(item_group);
                }
            }

            this.canvas.renderAll();
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
            this.canvas.renderAll();
            window.canvas = this.canvas;
        },
        initCanvas: function () {
            this.canvas = new fabric.Canvas("timeline-canvas", {
                hoverCursor: "pointer",
                renderOnAddRemove: false,
                selectable: false,
            });
            this.canvas.on("mouse:wheel", ({ e }) => {
                if (!e.altKey) return;
                var delta = e.deltaY;
                var zoom = this.canvas.getZoom();
                zoom *= 0.999 ** delta;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                this.canvas.setZoom(zoom);
                e.preventDefault();
                e.stopPropagation();
            });
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
            let x = Math.max(0, Math.min(pointer.x - 80, 1100));
            let y = Math.max(40, pointer.y - height - 48);
            tooltip.style.left = x + "px";
            tooltip.style.top = y + "px";
        },
    },
    computed: {
        lines: function () {
            return Math.ceil(this.time / this.linetime);
        },
        height: function () {
            return this.lines * 60;
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
    max-width: 1440px;
    overflow: hidden;
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
