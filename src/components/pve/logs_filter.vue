<template>
    <div class="m-logs-filter w-card">
        <div class="u-export-button" @click="exportBox.open()">
            <el-icon><CopyDocument /></el-icon>
            导出Excel文件
        </div>
        <div class="w-card-title">建议过滤</div>
        <div class="u-filters">
            <check-button v-model="logFilter.hideReact">
                隐藏反击事件
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="主要是龙血磨石等附魔产生的吸血事件，对分析无太大作用"
                    placement="top"
                >
                    <el-icon :size="16"><info-filled></info-filled></el-icon>
                </el-tooltip>
            </check-button>
            <check-button v-model="logFilter.hideNoValue"> 隐藏没有数值的技能效果 </check-button>
        </div>
        <div class="w-card-title">时间筛选</div>
        <div class="u-filters u-time-range">
            <el-input type="number" v-model.number="logFilter.timeRange[0]" size="large"></el-input>
            <span>~</span>
            <el-input type="number" v-model.number="logFilter.timeRange[1]" size="large"></el-input>
            <el-slider v-model="logFilter.timeRange" range :max="maxTime" :min="-5" :show-tooltip="false" />
        </div>
        <div class="w-card-title">单位过滤</div>
        <div class="w-card-title">
            <div class="u-filters">
                <div class="u-select-line">
                    <span>只查看：</span>
                    <el-select
                        v-model="logFilter.entities"
                        multiple
                        collapse-tags
                        filterable
                        clearable
                        placeholder="请选择单位"
                        popper-class="m-select-popper"
                        effect="dark"
                        size="large"
                    >
                        <el-option
                            v-for="entity in entities"
                            :key="entity.id"
                            :value="entity.id"
                            :label="getEntityName(entity.id)"
                        >
                            <div class="u-entity">
                                <img class="u-entity-icon" :src="getMountIcon(entity.id)" />
                                <span class="u-entity-name">{{ getEntityName(entity.id) }}</span>
                            </div>
                        </el-option>
                    </el-select>
                </div>

                <check-button v-model="logFilter.selectOnlyName"> 仅显示有名字的实体 </check-button>
                <check-button v-model="logFilter.selectOnlyNoSon"> 仅显示无归属实体 </check-button>
                <check-button v-model="logFilter.selectOnlyNoRepeat"> 仅出现一只的实体 </check-button>
                <check-button v-model="logFilter.onlySource"> 仅显示所选实体为事件来源的事件 </check-button>
            </div>
        </div>
        <div class="w-card-title">事件过滤</div>
        <div class="u-filters">
            <check-button v-model="logFilter.showTypes" type="check" value="scene">单位出现与消失</check-button>
            <check-button v-model="logFilter.showTypes" type="check" value="say">系统信息/NPC喊话</check-button>
            <check-button v-model="logFilter.showTypes" type="check" value="skill">
                技能产生效果
                <el-tooltip class="box-item" effect="dark" content="技能产生的实际效果" placement="top">
                    <el-icon :size="16"><info-filled></info-filled></el-icon>
                </el-tooltip>
            </check-button>
            <check-button v-model="logFilter.showTypes" type="check" value="skillCast">
                技能释放与释放结果
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="技能释放以及释放结果，指的是我读条了，我读条失败了，我偏离了等。而不是说我造成伤害了这种效果！"
                    placement="top"
                >
                    <el-icon :size="16"><info-filled></info-filled></el-icon>
                </el-tooltip>
            </check-button>
            <check-button v-model="logFilter.showTypes" type="check" value="buff">BUFF更新</check-button>
            <check-button v-model="logFilter.showTypes" type="check" value="kill">击杀与死亡</check-button>
            <check-button v-model="logFilter.showTypes" type="check" value="entityStatus">
                单位状态更新
                <el-tooltip class="box-item" effect="dark" content="指的是单位的位置、血量等状态。" placement="top">
                    <el-icon :size="16"><info-filled></info-filled></el-icon>
                </el-tooltip>
            </check-button>
        </div>
        <div class="w-card-title">搜索词</div>
        <el-input
            class="u-search-input"
            v-model="keywordStr"
            size="large"
            placeholder="输入关键词，多个关键词使用空格分隔"
            @change="inputChange"
            :class="{ 'is-fill': keywordStr }"
        ></el-input>
        <div class="w-card-title">过滤词</div>
        <el-input
            class="u-filter-input"
            v-model="hideKeywordStr"
            size="large"
            placeholder="输入关键词，多个关键词使用空格分隔"
            @change="inputChange"
            :class="{ 'is-fill': hideKeywordStr }"
        ></el-input>
        <div class="u-filters-center u-apply">
            <el-button
                class="u-apply-button"
                @click="
                    updateKeyword();
                    emits('apply');
                "
                >应用筛选</el-button
            >
        </div>
        <div class="u-filters-center u-filters-bottom">
            <check-button v-model="logAutoApply">自动应用</check-button>
            <check-button v-model="logDebug">调试模式</check-button>
        </div>
        <export-dialog ref="exportBox"></export-dialog>
    </div>
</template>

<script setup>
import ExportDialog from "@/components/export_dialog.vue";
import { getMountIcon, getEntityName } from "@/utils/common";
import { InfoFilled } from "@element-plus/icons-vue";
import CheckButton from "../common/check_button.vue";
import { usePve } from "@/store/pve";
import { useStore } from "@/store";
import { toRefs, computed, onMounted, ref } from "vue";
import { throttle } from "lodash-es";

// emit
const emits = defineEmits(["apply"]);

// data
const store = useStore();
const { logFilter, logAutoApply, logDebug } = toRefs(usePve());

// computed
const entities = computed(() => Object.values(store.result?.entities).slice(1));
const maxTime = computed(() => store?.result?.end?.sec + 5 || 120);
const keywordStr = ref("");
const hideKeywordStr = ref("");
const exportBox = ref(null);

// methods
const getKeywords = (type) => {
    let target = type === "hide" ? hideKeywordStr.value : keywordStr.value;
    if (!target) return null;
    let keywords = [];
    let resources = store.result.resources;
    let ks = target.split(/\s/);
    for (let k of ks) {
        if (!k) continue;
        const resourceMatch = (resource, k) => {
            if (resource.name && resource.name.includes(k)) return true;
            if (resource.desc && resource.desc.includes(k)) return true;
            if (resource.remark && resource.remark.includes(k)) return true;
            return false;
        };
        let includes = Object.keys(resources).filter((r) => resourceMatch(resources[r], k));
        for (let include of includes) {
            let type = include.split(":")[0];
            let id = include.split(":")[1];
            if (id.split("_").length > 1) id = id.split("_")[0];
            keywords.push({ type, id });
        }
        keywords.push({ type: "str", text: k });
    }
    return keywords;
};
const updateKeyword = () => {
    logFilter.value.keyword = getKeywords();
    logFilter.value.hideKeyword = getKeywords("hide");
};
const inputChange = throttle(() => {
    updateKeyword();
}, 1000);

onMounted(() => {
    logFilter.value.timeRange[1] = maxTime.value;
});
</script>

<style lang="less">
.m-logs-filter {
    .pr;
    width: 490px;

    .u-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .u-select-line {
        display: flex;
        align-items: center;
        width: 100%;

        .el-select {
            flex-grow: 1;
        }
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        appearance: none;
        margin: 0;
    }

    .el-input__inner {
        .bold;
    }

    .u-time-range {
        align-items: center;
        .el-input {
            .size(104px, 32px);
            border-radius: 5px;

            .el-input__inner {
                text-align: center;
            }
        }

        span {
            color: white;
            margin: 0 8px;
        }

        // 滑动条轨道
        .el-slider__runway {
            background-color: #575757;
        }
        // 滑动条覆盖部分
        .el-slider__bar {
            background-color: #0f5773;
        }
        // 滑动条按钮
        .el-slider__button {
            border: none;
            background-color: #0f5773;
        }
    }

    .u-filters-center {
        .mt(10px);
        .flex-center;
    }

    .u-filters-bottom {
        .mb(40px);
        .flex-center;
        gap: 10px;
        .w-check-button {
            .size(150px, 32px);

            &.is-active {
                background: #7650f8;
            }
        }
    }

    .u-apply {
        .mt(40px);
    }

    .u-apply-button {
        .size(228px, 59px);
        .fz(24px, 32px);
        .bold;
        border: none;
        background: #7650f8;
        border-radius: 50px;
        color: white;
    }

    .u-export-button {
        .pa;
        .fz(14px, 18px);
        .bold;
        .flex-center;
        .pointer;
        right: 10px;
        top: 10px;
        gap: 8px;
        padding: 10px;
        border-radius: 8px;
        transition: all 0.2s ease-in-out;
        background-color: #0f5773;

        &:hover {
            filter: brightness(1.5);
        }
    }

    .el-input__wrapper {
        transition: all 0.2s ease-in-out;
    }

    .el-input.is-fill {
        &.u-search-input .el-input__wrapper {
            background: #d45125;
        }
        &.u-filter-input .el-input__wrapper {
            background: #df2b82;
        }
        .el-input__inner {
            color: white;
        }
    }
}

.m-select-popper {
    .u-entity {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .u-entity-icon {
        .size(30px, 30px);
    }

    .u-entity-name {
        display: block;
        flex-grow: 1;
    }
}
</style>
