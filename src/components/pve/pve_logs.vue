<template>
    <div class="m-pve-logs">
        <logs-filter></logs-filter>
        <logs-list></logs-list>
    </div>
</template>

<script setup>
import LogsFilter from "./logs_filter.vue";
import LogsList from "./logs_list.vue";
</script>

<style lang="less">
.m-pve-logs {
    .mt(20px);
    width: 1440px;
    display: flex;
    gap: 20px;
}
</style>
