<template>
    <div class="m-subject-list">
        <div class="m-cards">
            <div v-for="(item, index) in types" :key="index" class="u-card" @click="open(item.subject)">
                <img class="u-card__bg" :src="item.icon" draggable="false" />
                <div class="u-card__inner">
                    <img class="u-icon" svg-inline :src="item.icon" draggable="false" />
                    <p class="u-title">{{ item.title }}</p>
                    <p class="u-tips">{{ item.tips }}</p>
                    <p class="u-tips">*仅支持后缀为 .jcl 的数据</p>
                </div>
            </div>
        </div>
        <div class="m-tips">
            <div class="m-left">
                <p class="u-title">了解更多信息</p>
                <p class="u-subTitle">
                    来使用战斗分析
                    <span class="u-arrow"></span>
                </p>
            </div>
            <div class="m-right">
                <p>【PVE · 团队统计分析】团队/首领/个人的伤害、治疗、承疗、承伤等统计！</p>
                <p>【PVE · 首领行为分析】智能分析首领时间轴、涵盖全小怪神出鬼没与伤害、开荒做数据更轻松！</p>
                <p>【PVE · 团队行为分析】团队每个成员全时间链行为分析，所有buff/debuff获取与技能释放详情一览无余！</p>
                <p>【PVP · 竞技多维分析】完整复盘，重要细节不错过，好师傅带徒儿神器，更有疑似外挂检测！</p>
                <p>
                    <a class="u-link" href="/collection/235" target="_blank">《战斗分析文档合集》</a>
                    .
                    <a class="u-link" href="/tool/22456" target="_blank"> 《茗伊JCL战斗日志获取指南》</a>
                </p>
            </div>
        </div>
        <file-select ref="fileSelect"></file-select>
    </div>
</template>

<script>
import FileSelect from "@/components/file_select";
export default {
    name: "SubjectList",
    components: {
        FileSelect,
    },
    data: () => ({
        current: "team",
        types: [
            {
                icon: require("@/assets/img/home/action.svg"),
                title: "团队行为分析 ",
                tips: "团队成员全时间链行为分析、动作细节",
                subject: "team",
            },
            {
                icon: require("@/assets/img/home/boss.svg"),
                title: "首领行为分析",
                tips: "首领与小怪技能类型/数量/伤害/时间轴等分析",
                subject: "boss",
            },
            {
                icon: require("@/assets/img/home/pvp.svg"),
                title: "竞技多维分析",
                tips: "敌我玩家全时间链行为分析、重要节点标注",
                subject: "pvp",
            },
        ],
    }),
    mounted() {},
    methods: {
        open(subject) {
            this.$refs.fileSelect.open(subject);
        },
    },
};
</script>

<style lang="less" scoped>
.m-subject-list {
    p {
        margin: 0;
    }
    .m-cards {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 80px 90px;
        gap: 30px;

        .u-card {
            .pr;
            .flex-center;
            cursor: pointer;
            box-sizing: border-box;
            height: 300px;
            width: 420px;
            border: 3px dashed #554d77;
            border-radius: 10px;
            color: #8472d2;
            background: rgba(85, 77, 119, 0.2);
            overflow: hidden;
            transition: all 0.1s ease-in-out;

            &:hover {
                transform: scale(1.02);
            }

            .u-icon {
                height: 83px;
            }
            .u-title {
                font-size: 24px;
                margin: 20px 0;
            }
            .u-tips {
                .fz(12px, 26px);
            }

            .u-card__inner {
                .flex-center;
                .size(100%, 100%);
                flex-direction: column;
            }

            .u-card__bg {
                .pa;
                .db;
                .size(240px, 240px);
                left: -14%;
                top: -20%;
                filter: contrast(0) opacity(0.12);
            }
        }
        .m-card:hover {
            background: rgba(85, 77, 119, 0.2);
        }
    }

    .m-tips {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 80px 46px;
        .m-left {
            font-size: 36px;
            font-weight: 700;
            .u-title {
                width: 216px;
                background: linear-gradient(88.56deg, #1d95f8 0.51%, #fa5fa6 101.59%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .u-subTitle {
                display: flex;
                align-items: center;
                margin-top: 6px;
                .u-arrow {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 200px;
                    height: 3px;
                    background: linear-gradient(88.56deg, #1d95f8 0.51%, #fa5fa6 101.59%);
                    margin-left: 29px;
                }
                .u-arrow::before {
                    position: absolute;
                    right: 3px;
                    content: "";
                    width: 33px;
                    height: 33px;
                    margin-left: 29px;
                    border-left: 3px solid #fa5fa6;
                    border-bottom: 3px solid #fa5fa6;
                    transform: rotate(-135deg);
                }
            }
        }
        .m-right {
            line-height: 30px;
            font-size: 16px;
            .u-link {
                color: #31a6fa;
            }
            .u-link:hover {
                text-decoration: underline;
            }
        }
    }
}
</style>
