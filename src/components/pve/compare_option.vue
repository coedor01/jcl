<template>
    <div class="m-compare-option">
        <div class="w-card m-compare-entity">
            <div class="w-card-title">单位选择</div>
            <div class="w-card-content">
                <el-select
                    v-model="compareEntity[0]"
                    class="u-select u-select-1"
                    :class="{ 'is-fill': compareEntity[0] }"
                    placeholder="选择单位"
                    popper-class="m-select-popper"
                    effect="dark"
                    clearable
                >
                    <el-option
                        v-for="(entity, index) in entities"
                        :key="index"
                        :value="entity.id"
                        :label="getEntityName(entity.id)"
                    >
                        <div class="u-entity">
                            <img class="u-entity-icon" :src="getMountIcon(entity.id)" />
                            <span class="u-entity-name">{{ getEntityName(entity.id) }}</span>
                        </div>
                    </el-option>
                </el-select>
                <span class="u-vs">VS</span>
                <el-select
                    v-model="compareEntity[1]"
                    class="u-select u-select-2"
                    :class="{ 'is-fill': compareEntity[1] }"
                    placeholder="选择单位"
                    popper-class="m-select-popper"
                    effect="dark"
                    clearable
                >
                    <el-option
                        v-for="(entity, index) in entities"
                        :key="index"
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
        </div>
        <div class="w-card m-compare-mode">
            <div class="w-card-title">对比模式</div>
            <div class="u-tabs">
                <div
                    v-for="(item, index) in tabs"
                    :key="index"
                    class="u-tab"
                    :class="{ 'is-active': compareMode === item.name }"
                    @click="compareMode = item.name"
                >
                    <div class="u-title">{{ item.title }}</div>
                    <div class="u-subtitle">对比</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getMountIcon, getEntityName } from "@/utils/common";
import { mapWritableState } from "pinia";
import { useGlobal } from "@/store/global";
import { useStore } from "@/store";

export default {
    name: "CompareOption",
    data: () => ({
        tabs: [
            {
                title: "伤害",
                name: "damage",
            },
            {
                title: "治疗",
                name: "treat",
            },
            {
                title: "承伤",
                name: "beDamaged",
            },
            {
                title: "承疗",
                name: "beTreated",
            },
        ],
    }),
    computed: {
        ...mapWritableState(useGlobal, ["compareEntity", "compareMode"]),
        entities() {
            const store = useStore();
            return Object.values(store.result.entities).slice(1);
        },
    },
    methods: {
        getMountIcon,
        getEntityName,
    },
};
</script>

<style lang="less">
.m-compare-option {
    .size(360px, 480px);
    display: flex;
    flex-direction: column;
    gap: 20px;

    .m-compare-entity {
        .size(360px, 230px);

        .el-select .el-input.is-focus .el-input__wrapper {
            box-shadow: none;
        }
        .el-select .el-input .el-input__wrapper {
            height: 40px;
            background-color: transparent;
            box-shadow: none;

            &:hover {
                box-shadow: none;
            }

            &.is-focus {
                box-shadow: none !important;
            }
        }

        .el-input__inner {
            .bold;
            text-align: center;
        }

        .el-input__suffix {
            display: none;
        }

        .u-select {
            .size(320px, 40px);
        }

        .u-select-1 {
            .el-input__wrapper {
                border: 3px solid #27b4e1;
                border-radius: 20px;

                .el-input__inner::placeholder {
                    .fz(14px, 18px);
                    color: #27b4e1;
                }
            }

            &.is-fill {
                .el-input__wrapper {
                    background-color: #27b4e1;

                    .el-input__inner {
                        color: white;
                    }
                }
            }
        }

        .u-select-2 {
            .el-input__wrapper {
                border: 3px solid #a50852;
                border-radius: 20px;

                .el-input__inner::placeholder {
                    .fz(14px, 18px);
                    .bold;
                    color: #a50852;
                }
            }

            &.is-fill {
                .el-input__wrapper {
                    background-color: #a50852;

                    .el-input__inner {
                        color: white;
                    }
                }
            }
        }

        .u-vs {
            .fz(14, 18px);
            color: #fff;
            .bold;
        }
    }

    .w-card-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        gap: 10px;
    }

    .m-compare-mode {
        .size(360px, 230px);

        .u-tabs {
            flex-grow: 1;
            display: flex;
            gap: 10px;
            padding: 15px 0;

            .u-tab {
                .pointer;
                .flex-center;
                .bold;
                gap: 10px;
                padding: 10px;
                flex-shrink: 0;
                flex-grow: 1;
                background: #000000;
                border-radius: 10px;
                color: #b3b3b3;
                transition: all 0.3s ease-in-out;

                &:not(.is-active) .u-title {
                    .size(17px, 42px);
                }
                &:not(.is-active) .u-subtitle {
                    display: none;
                }

                &.is-active {
                    transition: flex-grow 0.3s ease-in-out;
                    flex-grow: 1.4;
                    background: #7650f8;
                    color: white;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;

                    .u-title {
                        .fz(30px, 40px);
                    }

                    .u-subtitle {
                        .fz(16px, 21px);
                    }
                }
            }
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
