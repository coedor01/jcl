<template>
    <div class="m-entity-skill-detail">
        <div class="u-card">
            <div class="u-left">
                <div class="u-card-title">技能详情</div>
            </div>
            <div class="u-right">
                <div class="w-card">
                    <div class="w-card-title">携带BUFF列表</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup></script>

<style lang="less" scoped>
.m-entity-skill-detail {
    .u-card {
        display: flex;
        .size(100%, 100%);
        background: #615a76;
        border-radius: 20px;
        padding: 20px;
        .u-card-title {
            .fz(14px, 18px);
            color: #b3b3b3;
            margin: 0;
        }

        & > div {
            flex-grow: 1;
        }
    }
}
</style>
