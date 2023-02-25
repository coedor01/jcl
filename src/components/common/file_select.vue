<template>
    <el-dialog v-model="dialogVisible" width="50%" :append-to-body="true" :show-close="false" class="m-file-select">
        <div class="m-dialog-body">
            <el-button class="u-close" link>
                <el-icon :size="size" :color="color">
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { Close } from "@element-plus/icons-vue";
import { ref } from "vue";

const dialogVisible = ref(true);
const subject = ref("team");

const open = (sub) => {
    dialogVisible.value = true;
    subject.value = sub;
};

defineExpose({
    open,
});
</script>

<style lang="less">
.m-file-select {
    .m-dialog-body {
        .pr;
        .flex-center;
        flex-direction: column;

        .u-close {
            .pa;
            right: 10px;
            top: -10px;
            .size(48px, 48px);
            background: ;
        }
    }
}
</style>
