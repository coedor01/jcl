<template>
    <div class="p-analysis">
        <div class="u-analysis-title">选择你的分析模式</div>
        <subject-list></subject-list>
    </div>
</template>

<script setup>
import { defineComponent } from "vue";
import SubjectList from "@/components/home/subject_list.vue";

defineComponent({
    name: "AnalysisIndex",
});
</script>

<style lang="less">
@import "@/assets/css/views/analysis.less";
</style>
