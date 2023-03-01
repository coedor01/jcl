<template>
    <div class="m-entity-view-skill">
        <div class="u-left">
            <div class="w-card">
                <div class="w-card-title">技能列表</div>
            </div>
            <entity-skill-log-detail></entity-skill-log-detail>
        </div>
        <div class="u-right">
            <entity-skill-log></entity-skill-log>
        </div>
    </div>
</template>

<script setup>
import EntitySkillLog from "./entity_skill_log.vue";
import EntitySkillLogDetail from "./entity_skill_log_detail.vue";
</script>

<style lang="less" scoped>
.m-entity-view-skill {
    display: flex;
    gap: 20px;
    .size(1440px, 800px);

    .u-left {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .size(810px, 760px);

        & > div:first-of-type {
            height: 420px;
        }

        & > div:last-of-type {
            flex-grow: 1;
        }
    }

    .u-right {
        .size(610px, 760px);
    }
}
</style>
