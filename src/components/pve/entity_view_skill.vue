<template>
    <div class="m-entity-view-skill">
        <div class="u-left w-card">
            <div class="w-card-title">技能列表</div>
        </div>
        <div class="u-right">
            <entity-skill-log></entity-skill-log>
            <entity-skill-log-detail></entity-skill-log-detail>
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
        .size(900px, 800px);
    }
    .u-right {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 520px;

        & > div:first-of-type {
            height: 420px;
        }
        & > div:last-of-type {
            flex-grow: 1;
        }
    }
}
</style>
