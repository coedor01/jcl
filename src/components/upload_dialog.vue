<template>
    <el-dialog
        v-model="dialogVisible"
        :append-to-body="true"
        :show-close="false"
        :close-on-click-modal="false"
        :align-center="true"
        :lock-scroll="false"
        class="m-upload-dialog"
    >
        <div class="m-dialog-body">
            <el-button class="u-close" link @click="dialogVisible = false">×</el-button>
            <!-- 标题 -->
            <div class="u-title">上传当前数据</div>
            <!-- 上传组件 -->
            <el-progress :show-text="false" :percentage="progress" :stroke-width="10" />
            <div class="u-progress-desc" v-for="(item, key) in statusMap" :key="key">
                <el-icon><component :is="statusIcon[item.status]"></component></el-icon>
                {{ item.desc }}
            </div>
        </div>
    </el-dialog>
</template>

<script setup></script>

<style lang="less"></style>
