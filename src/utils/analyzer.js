import { parseJx3dat } from "luat2json";

import { JCL_TYPE } from "./jclType";
import { formatLine } from "./format";
import { cloneDeep, pick } from "lodash-es";
import {
    getResource,
    getResourceIcon,
    getResourceName,
    getRandomColor,
    getEntityName,
    getEntityColor,
    displayPercent,
    displayDigits,
    displayDuration,
} from "./commonNoStore";
import { iconLink } from "@jx3box/jx3box-common/js/utils";

// 用于解析lua table
const parseLua = (type, lua) => {
    let table = parseJx3dat(`return ${lua}`);
    let parseFunc = JCL_TYPE[type]?.[1];
    return parseFunc ? parseFunc(table) : table;
};
// 用于解析单行日志
const parseLine = (line) => {
    if (!line) return;
    let [frame, sec, micro, type, detail] = line.split("\t").slice(1);
    [frame, sec, micro, type] = [frame, sec, micro, type].map(Number);
    detail = parseLua(type, detail);
    const typeDesc = JCL_TYPE[type]?.[0];
    return {
        frame,
        sec,
        micro,
        type,
        typeDesc,
        detail,
    };
};
// 用于过滤一些没有实际意义的日志
const logFilter = (log) => {
    const sysMsgBlackList = [
        "不经意间触发奇遇",
        "GM公告",
        "因为获得帮会天工树涅槃分支",
        "恭喜大侠，获得 [赞·群龙之首]",
        "身上的装备耐久度降低",
        /“.+”.+在.+对“.+”.+释放了传说中的烟花【.+】/,
        /“.+”.+在.+对“.+”.+使用了传说中的【.+】/,
        /“.+”.+在.+释放了传说中的烟花【.+】/,
        /触发奇遇【.+】/,
    ];

    if (log.type === 18) {
        let content = log.detail.content;
        for (let sb of sysMsgBlackList) {
            if (typeof sb === "string" && content.includes(sb)) return false;
            if (typeof sb === "object" && sb.test(content)) return false;
        }
    }
    if (log.type === 13) {
        if (log.detail.id === 0) return false;
    }
    return true;
};
// 获的一行日志的时间
const getRowTime = (row) => {
    const result = pick(row, ["frame", "sec", "micro"]);
    return result;
};
const defaultResult = {
    start: {},
    end: {},
    client: "std",
    map: null,
    server: null,

    rows: [],
    entities: {
        0: {
            id: 0,
            name: "天外来客",
            type: "npc",
            templateID: -1,
        },
    },
    stats: {
        damage: {},
        treat: {},
        beDamaged: {},
        beTreated: {},
    },
    buff: {},
    skill: {},
    say: {},
    scene: {},
    death: {},
    resources: {
        skill: [],
        buff: [],
    },
};
// 分析器
export class Analyzer {
    constructor(raw) {
        this.raw = raw.split("\n").filter((x) => x);
        this.reset();
    }

    // 重置分析器
    reset() {
        this.index = 0;
        this.length = this.raw.length;
        this.prev = undefined;
        this.current = undefined;

        this.result = cloneDeep(defaultResult);
        this.tmp = {
            enterSceneCount: {},
            firstAppearTimeUpdated: {},
            globalSays: [],
        };
    }
    // 到下一个时间节点
    nextStep() {}
    // 直接解析到头，获取整个JCL文件的结果，返回一个生成器
    getAll() {
        let that = this;
        return (function* (analyzer) {
            analyzer.reset();
            while (true) {
                let result = analyzer.nextLine();
                if (result.done) return that.result;
                yield result;
            }
        })(this);
    }
    getPveOverviewList(params) {
        const { statType } = params;
        const { entities, stats, end } = this.result;
        if (!stats) return [];
        const source = stats[statType];
        if (!source) return [];
        let result = [];
        let teamTotal = 0;
        let maxValue = 0;
        for (let entity in source) {
            let entityData = {
                ...pick(source[entity].all, ["count", "value", "max", "min", "criticalCount"]),
                ...pick(entities[entity], ["name", "id", "mount"]),
            };
            entityData.vps = entityData.value / end.sec;
            if (entityData.mount) {
                teamTotal += entityData.value;
                maxValue = Math.max(maxValue, entityData.value);
            }
            result.push(entityData);
        }
        for (let entity of result) {
            if (entity.mount) {
                entity["rate"] = (entity.value / teamTotal) * 100;
                entity["length"] = (entity.value / maxValue) * 100;
            } else {
                entity["rate"] = 0;
                entity["length"] = 0;
            }
        }
        return result;
    }
    getPveOverviewPie(params) {
        const { statType } = params;
        const { entities, stats } = this.result;
        let result = [];
        let total = 0;
        const source = stats[statType];
        for (let entity in source) {
            total += source[entity].all.value;
            let _data = {
                ...pick(entities[entity], ["id", "name", "color"]),
                value: source[entity].all.value,
            };
            if (!_data.name) _data.name = "#" + _data.id;
            result.push(_data);
        }
        result = result.filter((x) => x.value / total > 0.02);
        return { result, total };
    }
    getPveOverviewChart(params) {
        const { statType } = params;
        const { entities, stats, end } = this.result;
        // xData
        const xData = [];
        {
            let max = Math.ceil(end.sec / 5) * 5;
            let min = 0;
            while (min <= max) {
                xData.push(min);
                min += 5;
            }
        }
        // yData
        let yData = {};
        {
            const defaultSeries = {
                type: "line",
                smooth: true,
                showSymbol: false,
            };
            const source = stats?.[statType];
            // 已有数据的统计
            for (let id in source) {
                if (!entities[id]) continue;
                const { name, color } = entities[id];
                if (!name || id == 0) continue;
                if (yData[name]) {
                    // 同名单位，合并数据
                    let newData = [];
                    for (let x of xData) newData.push(yData[name].data[x] + source[id].windows[x]?.value ?? 0);
                    yData[name].data = newData;
                    yData[name].total += source[id].all.value;
                } else {
                    // 新单位，纳入统计
                    let newData = [];
                    for (let x of xData) newData.push(source[id].windows[x]?.value ?? 0);
                    yData[name] = {
                        ...defaultSeries,
                        itemStyle: { color },
                        name,
                        data: newData,
                        total: source[id].all.value,
                    };
                }
            }
            yData = Object.values(yData).filter((item) => item.data.some((v) => v > 0));
            // 全局统计
            let r = {
                ...defaultSeries,
                name: "【全局】",
                data: [],
            };
            let datas = yData.map((item) => item.data);
            for (let i = 0; i < xData.length; i++) {
                let sum = 0;
                for (let d of datas) {
                    if (Number(d[i])) sum += d[i];
                }
                r.data.push(sum);
            }
            yData.unshift(r);
            yData.sort((a, b) => b.total - a.total);
        }
        return { xData, yData };
    }
    getPveOverviewFocus(params) {
        const { statType, entityID } = params;
        const source = this.result.stats?.[statType]?.[entityID]?.all?.details;
        if (!source) return [];
        let result = {};
        let total = 0;
        for (let log of source) {
            const key = log.effect;
            if (!result[key]) {
                const resource = getResource(key, this.result);
                const name = resource.name ?? resource.remark ?? key;
                result[key] = {
                    name,
                    value: 0,
                    count: 0,
                    criticalCount: 0,
                    rate: 0,
                };
            }
            total += log.value;
            result[key].count += 1;
            result[key].value += log.value;
            result[key].criticalCount += log.isCritical ? 1 : 0;
        }
        for (let key in result) {
            result[key].rate = (result[key].value / total) * 100;
        }
        return Object.values(result).sort((a, b) => b.value - a.value);
    }
    getPveEntityStatChart(params) {
        const defaultReturn = { overview: {}, xData: [], yData: [] };
        const { entityTab, entity } = params;
        const { entities, stats, end } = this.result;

        const entityObj = entities[entity];
        let overview = { ...pick(entityObj, ["name", "id"]) };
        {
            const source = stats[entityTab]?.[entity]?.all;
            if (!source) return defaultReturn;
            const duration = end.sec;
            const vps = source.value / duration;
            const critRate = source.criticalCount / source.count;
            const displayValue = source.value ? source.value.toLocaleString() : "-";
            overview = {
                ...overview,
                ...pick(source, ["count"]),
                value: displayValue,
                duration,
                vps,
                critRate,
            };
        }

        let xData = [];
        let yData = [];
        {
            const source = stats?.[entityTab]?.[entity]?.windows;
            if (!source) return defaultReturn;
            // 构造横轴
            let max = Math.ceil(end.sec / 5) * 5;
            let min = 0;
            while (min <= max) {
                xData.push(min);
                min += 5;
            }
            // 构造纵轴
            for (let x of xData) {
                let y = source[x]?.value / 5 || 0;
                yData.push(y);
            }
        }
        return { overview, xData, yData };
    }
    getPveEntityViewEffect(params) {
        const { entityTab, entity, currentWindow } = params;
        const { stats } = this.result;
        const source =
            currentWindow === null
                ? stats[entityTab]?.[entity]?.all
                : stats[entityTab]?.[entity]?.windows?.[currentWindow];
        if (!source) {
            return [];
        }
        let result = {};
        let total = 0;
        for (let detail of source.details) {
            //这个target不一定是目标的ID，在承伤/承疗的时候表现为来源ID
            const effect = detail.effect;
            if (!result[effect])
                result[effect] = {
                    count: 0, // 伤害次数
                    criticalCount: 0, //会心次数
                    value: 0, //总伤害量
                    min: 1e10, //最小伤害值
                    max: -1e10, //最大伤害值
                    logs: [], // 详细伤害日志
                };
            result[effect].count++;
            result[effect].value += detail.value;
            total += detail.value;
            result[effect].min = Math.min(result[effect].min, detail.value);
            result[effect].max = Math.max(result[effect].max, detail.value);
            if (detail.isCritical) result[effect].criticalCount++;
            result[effect].logs.push(detail);
        }
        for (let effect in result) {
            let r = result[effect];
            r.criticalRate = (r.criticalCount / r.count) * 100;
            r.valueRate = (r.value / total) * 100;
            r.avg = r.value / r.count;
            r.effect = effect;
        }
        return Object.values(result).sort((a, b) => b.value - a.value);
    }
    getPveEntityViewTarget(params) {
        const { entityTab, entity, currentWindow, skipNoNameTarget = true } = params;
        const { stats, entities } = this.result;
        const source =
            currentWindow === null
                ? stats[entityTab]?.[entity]?.all
                : stats[entityTab]?.[entity]?.windows?.[currentWindow];
        if (!source) {
            return [];
        }
        let result = {};

        let total = 0;
        for (let detail of source.details) {
            //这个target不一定是目标的ID，在承伤/承疗的时候表现为来源ID
            const target = ["damage", "treat"].includes(entityTab) ? detail.target : detail.caster;
            const entity = entities[target];
            if (skipNoNameTarget && !entity.name) continue;
            if (!result[target])
                result[target] = {
                    count: 0, // 伤害次数
                    criticalCount: 0, //会心次数
                    value: 0, //总伤害量
                    min: 1e10, //最小伤害值
                    max: -1e10, //最大伤害值
                    logs: [], // 详细伤害日志
                };
            result[target].count++;
            result[target].value += detail.value;
            total += detail.value;
            result[target].min = Math.min(result[target].min, detail.value);
            result[target].max = Math.max(result[target].max, detail.value);
            if (detail.isCritical) result[target].criticalCount++;
            result[target].logs.push(detail);
        }
        for (let k in result) {
            let r = result[k];
            r.criticalRate = (r.criticalCount / r.count) * 100;
            r.valueRate = (r.value / total) * 100;
            r.avg = r.value / r.count;
            r.target = Number(k);
        }
        return Object.values(result).sort((a, b) => b.value - a.value);
    }
    getPveEntityBuff(params) {
        const { entity } = params;
        const { buff, end } = this.result;
        const source = buff[entity];
        if (!source) return [];
        let result = [];
        for (let key in source) {
            const buff = source[key];
            let getCount = 0;
            let deleteCount = 0;
            let maxStack = 0;
            let maxDuration = Number.MIN_SAFE_INTEGER;
            let minDuration = Number.MAX_SAFE_INTEGER;
            let totalDuration = 0;
            for (let log of buff.logs) {
                const duration = (log.end - log.start) / 1000;
                getCount += 1;
                maxStack = Math.max(maxStack, log.stack, ...Object.values(log.stackLogs ?? {}));
                maxDuration = Math.max(maxDuration, duration);
                minDuration = Math.min(minDuration, duration);
                totalDuration += duration;
                if (log.end != log.shouldEnd) deleteCount += 1;
            }
            let aveDuration = totalDuration / getCount;
            let coverage = (totalDuration / (end.micro / 1000)) * 100;
            result.push({
                id: key,
                icon: getResourceIcon("buff:" + key, this.result, { url: false }),
                getCount,
                deleteCount,
                maxStack,
                maxDuration,
                minDuration,
                aveDuration,
                coverage,
            });
        }
        return result.sort((a, b) => b.coverage - a.coverage);
    }
    getPveEntityBuffChart(params) {
        const { entity, selectedBuffs } = params;
        const { end, buff } = this.result;
        // datas
        const data = [];
        {
            const colorGenerator = getRandomColor();
            const source = buff?.[entity] || {};
            for (let id of selectedBuffs) {
                let buffLogs = source[id]?.logs;
                if (!buffLogs) continue;
                data.push({
                    info: {
                        ...getResource("buff:" + id, this.result),
                        key: id,
                        color: colorGenerator.next().value,
                        name: getResourceName("buff:" + id, this.result),
                    },
                    times: buffLogs,
                });
            }
        }
        // iconStyles
        const iconStyles = {
            paddingRight: {
                padding: [0, 10, 0, 0],
            },
        };
        {
            for (let k in data) {
                const info = data[k].info;
                iconStyles["icon" + k] = {
                    backgroundColor: {
                        image: iconLink(info.icon),
                    },
                    height: 32,
                    width: 32,
                };
            }
        }
        // categories
        const categories = data.map((d) => d.info.name);
        // items
        const items = [];
        {
            let index = 0;
            for (let { info, times } of data) {
                for (let time of times) {
                    const isDelete = time.end != time.shouldEnd && time.end != end.micro;
                    items.push({
                        index,
                        name: info.name,
                        value: [info.key, time.start, time.end, index, JSON.stringify(time.stackLogs), isDelete],
                        detail: time,
                        itemStyle: {
                            color: info.color,
                        },
                    });
                }
                index++;
            }
        }
        return {
            data,
            iconStyles,
            categories,
            items,
        };
    }
    getPveEntitySkill(params) {
        const { entity } = params;
        const data = [];
        const selectedSkills = {};
        {
            const source = this.result.skill?.[entity]?.skills;
            if (!source) {
                return { data, selectedSkills };
            }
            const colorGenerator = getRandomColor();
            let result = {};
            for (let id in source) {
                const resource = getResource("skill:" + id, this.result);
                if (!resource || !resource.name) continue;
                const name = resource.name;
                if (result[name] === undefined) {
                    result[name] = {
                        name,
                        ids: [id],
                        color: colorGenerator.next().value,
                        icon: resource.icon,
                    };
                    selectedSkills[name] = {
                        name,
                        ...result[name],
                        stat: [],
                    };
                } else {
                    if (!result[name].icon) result[name].icon = resource.icon;
                    result[name].ids.push(id);
                    selectedSkills[name].ids.push(id);
                }
            }
            data.push(...Object.values(result));
        }
        return { data, selectedSkills };
    }
    getPveCompare(params) {
        const { compareMode, entity } = params;
        const { stats, end } = this.result;

        const source = stats?.[compareMode]?.[entity]?.all;
        if (!source) return { overview: [], data: [] };
        const fightTime = end.sec;
        const displayTime = displayDuration(fightTime);
        const overview = [
            {
                title: "战斗时长",
                value: displayTime,
            },
            {
                title: "总次数",
                value: source.count,
            },
            {
                title: "总伤害",
                value: source.value ? source.value.toLocaleString() : 0,
            },
            {
                title: "每秒数值",
                value: displayDigits(source.value / fightTime),
            },
            {
                title: "会心率",
                value: displayPercent((source.criticalCount / source.count) * 100),
            },
        ];
        const data = [];
        {
            if (!source || !source.details) return [];
            let result = {};
            for (let detail of source.details) {
                const effect = detail.effect;
                if (!result[effect]) {
                    result[effect] = {
                        count: 0, // 伤害次数
                        criticalCount: 0, //会心次数
                        value: 0, //总伤害量
                        min: 1e10, //最小伤害值
                        max: 1e-10, //最大伤害值
                        logs: [], // 详细伤害日志
                        effect,
                    };
                }
                result[effect].count++;
                result[effect].value += detail.value;
                result[effect].min = Math.min(result[effect].min, detail.value);
                result[effect].max = Math.max(result[effect].max, detail.value);
                result[effect].logs.push(detail);
                if (detail.isCritical) result[effect].criticalCount++;
            }
            result = Object.values(result).sort((a, b) => b.value - a.value);
            //计算结果->给表格展示的数据
            for (let res of result) {
                res.criticalRate = (res.criticalCount / res.count) * 100;
                res.valueRate = (res.value / source.value.value) * 100;
                res.avg = res.value / res.count;
            }
            data.push(...result);
        }
        return { overview, data };
    }
    getPveCompareChart(params) {
        const { compareEntity, compareMode } = params;
        const { stats, end } = this.result;
        const xData = [];
        {
            const max = Math.ceil(end.sec / 5) * 5;
            let min = 0;
            while (min <= max) {
                xData.push(min);
                min += 5;
            }
        }
        const yData = [];
        {
            const defaultSeries = {
                type: "line",
                smooth: true,
                showSymbol: false,
            };
            const source = stats[compareMode];
            for (let id of compareEntity) {
                if (!id) continue;
                const name = getEntityName(id, this.result);
                const color = getEntityColor(id, this.result);
                let data = [];
                const windows = source?.[id]?.windows;
                for (let x of xData) {
                    data.push(windows?.[x]?.value ?? 0);
                }
                yData.push({
                    name,
                    data,
                    ...defaultSeries,
                    itemStyle: { color },
                });
            }
        }
        return { xData, yData };
    }
    getPveLogs(params) {
        const { logFilter } = params;
        const { rows } = this.result;
        if (!rows) return [];
        const { keyword: keywords, hideKeyword: hideKeywords, entities, showTypes } = logFilter;
        const timeRange = [logFilter.timeRange[0] * 1000, logFilter.timeRange[1] * 1000];

        const typeMap = {
            say: [14, 15, 18],
            scene: [2, 3, 6, 7, 10, 11],
            buff: [13],
            skill: [21],
            skillCast: [19, 20],
            skillResult: [22, 23, 24, 25, 26],
            kill: [28],
            status: [29],
        };
        const showEventValue = (row) => {
            if (row.type != 21) return false;
            if (Object.values(row.value).every((x) => !x)) return false;
            return true;
        };

        let index = 0;
        const result = rows.filter((row) => {
            // 妹什么用的东西直接过滤
            if ([4, 8, 10, 11, 12].includes(row.type)) return false;
            // 事件类型过滤
            for (let type in typeMap) {
                // 如果显示类型里不包含这个类型,并且当前事件处于这个类型，则不显示
                if (!showTypes.includes(type) && typeMap[type].includes(row.type)) {
                    return false;
                }
            }
            // 相关单位过滤
            if (entities.length) {
                if (row.source.t == "entity" || row.target.t == "entity") {
                    // 过滤雨我无瓜的单位
                    if (!entities.includes(row.source.v) && !entities.includes(row.target.v)) {
                        return false;
                    }
                    // 开启了只显示选择单位为来源单位后
                    if (logFilter.onlySource && row.source && row.source.t == "entity") {
                        if (!entities.includes(row.source.v)) return false;
                    }
                }
            }
            // 时间范围过滤
            if (row.micro < timeRange[0] || row.micro > timeRange[1]) return false;

            // 关键词过滤
            if (hideKeywords && row.content) {
                for (let keyword of hideKeywords) {
                    if (keyword.type == "str" && row.content.t === "str" && row.content.v.includes(keyword.text))
                        return false;
                    if (keyword.type == "skill" && row.content.t === "skill" && row.content.v.startsWith(keyword.id))
                        return false;
                    if (keyword.type == "buff" && row.content.t === "buff" && row.content.v.startsWith(keyword.id))
                        return false;
                }
            }
            // 事件内容搜索,逻辑有些复杂Orz
            if (keywords && row.content) {
                let conform = false;
                for (let keyword of keywords) {
                    if (conform) {
                        row.index = ++index;
                        return true;
                    }
                    if (keyword.type == "str" && row.content.t === "str") {
                        conform = row.content.v.includes(keyword.text);
                    }
                    if (keyword.type == "skill" && row.content.t === "skill")
                        conform = row.content.v.startsWith(keyword.id);
                    if (keyword.type == "buff" && row.content.t === "buff")
                        conform = row.content.v.startsWith(keyword.id);
                }
                if (!conform) return false;
            }
            // 隐藏反击
            if (logFilter.hideReact && row.type == 21) {
                if (row.detail.isReact) return false;
            }
            // 隐藏无数值事件
            if (logFilter.hideNoValue && row.type == 21 && !showEventValue(row)) return false;

            row.index = ++index;
            return true;
        });
        return result;
    }
    // 解析JCL的下一行
    nextLine() {
        const result = (row, done = false, valid = true) => {
            this.index++;
            return {
                row,
                done,
                valid,
                index: this.index,
                length: this.length,
            };
        };
        // 解析结束
        if (this.index === this.length) {
            this.endBuff();
            return result(null, true);
        }
        this.prev = this.current;
        let line = parseLine(this.raw[this.index]);
        // 无效日志直接跳过
        let valid = logFilter(line);
        if (!valid) return result(null, false, valid);
        // 格式化日志
        let row = formatLine(line, this.result, this.tmp);
        this.result.rows.push(row);
        this.current = row;
        this.updateResult();
        return result(row, false, valid);
    }
    // 更新分析结果，执行下述的updateXX方法
    updateResult() {
        if (!this.updateMeta()) return;
        this.updateResources();
        this.updateEntities();
        this.updateScene();
        this.updateBuff();
        this.updateSkillCount();
        this.updateDeath();
        this.updateSay();
        this.updateTeam();
        this.updateStat();
    }
    // 更新JCL文件元信息
    updateMeta() {
        // frame=0，一般是JJC过完图了，直接截断，处理完毕
        if (this.current.frame === 0) {
            this.index = this.length - 1;
            this.result.end = getRowTime(this.prev);
            return false;
        }
        // 更新日志时间
        if (this.current && this.result.start.micro) {
            this.current.micro -= this.result.start.micro;
            this.current.sec -= this.result.start.sec;
            this.current.frame -= this.result.start.frame;
        }
        // type=1,是战斗全局信息，可以用来更新各种
        if (this.current.type === 1) {
            let { start, client, map, server } = this.current.detail;
            // JCL文件所属的客户端
            if (["classic_yq", "classic_exp"].includes(client)) this.result.client = "origin";
            // 地图
            this.result.map = map;
            this.result.server = server.split("_")[1];
            // 战斗结束时间
            if (!start) {
                this.result.end = getRowTime(this.current);
            } else {
                this.result.start = getRowTime(this.current);
                let cur = this.result.rows.pop();
                this.result.rows = this.result.rows.map((row) => {
                    this.current = row;
                    this.updateResult();
                    return row;
                });
                cur.micro = 0;
                cur.sec = 0;
                cur.frame = 0;
                this.current = cur;
            }
        }
        if (!this.result.start.micro) return false;
        return true;
    }
    // 更新JCL文件涉及到的资源列表
    updateResources() {
        let row = this.current;
        let resources = this.result.resources;
        if (row.content.t == "skill") resources.skill.push(row.content.v);
        if (row.content.t == "buff") resources.buff.push(row.content.v);
    }
    // 更新单位信息
    updateEntities() {
        const { type, detail } = this.current;
        let entities = this.result.entities;
        // 玩家信息
        if (type === 4) {
            const { id, mount } = detail;
            // 无效的玩家信息,可能是焚影隐身导致的
            if (mount === -1) return;
            if (entities[id]) {
                // 已经记录的玩家不再记录，但是可以用于刷新原来没有的数据。比如奇穴啥的
                let oldEntity = entities[id];
                let newEntity = Object.assign({}, { type: "player" }, detail);
                if (Object.values(oldEntity.talents).length == 0) oldEntity.talents = newEntity.talents;
                if (!oldEntity.equips?.length) oldEntity.equips = newEntity.equips;
                return;
            }
            let firstAppear = getRowTime(this.current);
            // 记录玩家信息
            let entity = Object.assign({}, { type: "player", firstAppear }, detail);
            entities[id] = entity;
        }
        // NPC信息
        if (type === 8) {
            const { id, templateID } = detail;
            if (entities[id]) return;
            // 记录NPC的首次出现时间
            let firstAppear = this.tmp.firstAppearTimeUpdated[id] ?? getRowTime(this.current);
            // 记录同模板NPC的出现顺序
            if (this.tmp.enterSceneCount[templateID] === undefined) this.tmp.enterSceneCount[templateID] = 1;
            let appearOrder = this.tmp.enterSceneCount[templateID]++;
            // 记录NPC信息
            let entity = Object.assign({}, { type: "npc", firstAppear, appearOrder }, detail);
            entities[id] = entity;
        }
        if ([2, 6].includes(type)) {
            const { id } = detail;
            if (!this.tmp.firstAppearTimeUpdated[id]) {
                let time = getRowTime(this.current);
                this.tmp.firstAppearTimeUpdated[id] = time;
                if (entities[id]) entities[id].firstAppear = time;
            }
        }
    }
    // 更新单位进出场景
    updateScene() {
        const { micro, type: t, detail } = this.current;
        if (![2, 3, 6, 7].includes(t)) return;
        const { id } = detail;
        const type = [2, 6].includes(detail.type) ? "出现" : "消失";
        if (!this.result.scene[id]) this.result.scene[id] = [];
        this.result.scene[id].push({
            type,
            time: micro / 1000,
        });
    }
    // 更新单位buff
    updateBuff() {
        const { micro, type, detail } = this.current;
        if (type === 13) {
            const { source, target, isDelete, id, level, stackNum: stack, endFrame } = detail;
            const key = `${id}_${level}`;
            if (!this.result.buff[target]) this.result.buff[target] = {};
            // 结算一遍这个单位身上的buff
            for (let bi in this.result.buff[target]) {
                let buff = this.result.buff[target][bi];
                if (buff.cur && buff.cur.end < micro) {
                    buff.logs.push(buff.cur);
                    buff.cur = null;
                }
            }
            if (!this.result.buff[target][key]) this.result.buff[target][key] = { cur: null, logs: [] };
            let eb = this.result.buff[target][key];
            if (!isDelete) {
                // 添加BUFF
                let battleStartFrame = this.result.start.frame;
                let buffEndMicro = ((endFrame - battleStartFrame) / 16) * 1000;
                if (!eb.cur) {
                    // 如果身上没这个buff
                    eb.cur = {
                        source,
                        deleteBy: null,
                        start: micro,
                        end: buffEndMicro,
                        shouldEnd: buffEndMicro,
                        id: key,
                        stack,
                        stackLogs: {
                            [micro]: stack,
                        },
                    };
                } else {
                    // 如果身上已经有这个buff了
                    eb.cur.end = buffEndMicro;
                    eb.cur.shouldEnd = buffEndMicro;
                    if (stack != eb.cur.stack) {
                        eb.cur.stack = stack;
                        eb.cur.stackLogs[micro] = stack;
                    }
                }
            } else {
                // 删除BUFF
                if (!eb.cur) return;
                let buff = eb.cur;
                buff.end = micro;
                buff.deleteBy = source;
                eb.logs.push(buff);
                eb.cur = null;
            }
        }
    }
    // 分析结束时将buff的cur丢进logs
    endBuff() {
        const { micro } = this.current;
        for (let eid in this.result.buff) {
            for (let bid in this.result.buff[eid]) {
                let buff = this.result.buff[eid][bid];
                if (buff.cur) {
                    buff.cur.end = micro;
                    buff.logs.push(buff.cur);
                    buff.cur = null;
                }
            }
        }
    }
    updateEntityBuff(entity) {
        const { micro } = this.current;
        if (!this.result.buff[entity]) return;
        for (let bid in this.result.buff[entity]) {
            let buff = this.result.buff[entity][bid];
            if (buff.cur && buff.cur.end < micro) {
                buff.logs.push(buff.cur);
                buff.cur = null;
            }
        }
    }
    // 获取单位的buff
    getBuff(entity) {
        if (!this.result.buff[entity]) return [];
        this.updateEntityBuff(entity);
        let result = [];
        for (let bid in this.result.buff[entity]) {
            let buff = this.result.buff[entity][bid];
            if (buff.cur) result.push(`${bid}*${buff.cur.stack}`);
        }
        return result;
    }
    // 技能数统计
    updateSkillCount() {
        const { micro, type, detail } = this.current;
        if (![19, 21, 22, 23, 24, 25, 26].includes(type)) return;
        if (type === 21 && detail.eventType === 2) return;
        const { caster, target, id, level } = detail;
        const key = `${id}_${level}`;
        if (!this.result.skill[caster])
            this.result.skill[caster] = {
                skills: {},
                logs: [],
            };
        let data = this.result.skill[caster];
        const typeMap = { 19: "cast", 24: "miss" };
        const skillType = typeMap[type] ?? "hit";
        // 如果这个技能还没有记录过，就初始化一个
        if (!data.skills[key]) {
            data.skills[key] = {
                last: {
                    hit: null,
                    cast: null,
                    miss: null,
                },
            };
        }
        let skillData = data.skills[key];
        // 如果上一次同类型的事件发生在0.5s内，认为是同一次事件的AOE/闪避之类的触发的事件，不计数
        if (skillData.last[skillType] && Math.abs(skillData.last[skillType].time * 500 - micro) < 1000) {
            skillData.last[skillType].count += 1;
            skillData.last[skillType].targets.push(target);
            return;
        }
        // 如果不是同一次事件，就另起一个对象，并且技能计数+1；
        // 这个对象会同时放进logs里面以及作为skills里的last
        const log = {
            time: micro / 1000,
            skillType,
            id: key,
            targets: [target],
            count: 1,
        };
        skillData.last[skillType] = log;
        data.logs.push(log);
    }
    // 死亡统计
    updateDeath() {
        const { micro, type, detail } = this.current;
        if (type !== 28) return;
        const { id, killer } = detail;
        let entities = this.result.entities;
        let entity = entities[id];
        let killerEntity = entities[killer];

        if (!this.result.death[id] && entity) {
            this.result.death[id] = {
                kill: 0,
                death: 0,
                logs: [],
            };
        }
        if (!this.result.death[killer] && killerEntity) {
            this.result.death[killer] = {
                kill: 0,
                death: 0,
                logs: [],
            };
        }
        // =====
        if (entity) {
            this.result.death[id].death += 1;
            this.result.death[id].logs.push({
                time: micro / 1000,
                type: "death",
                id: killer,
            });
        }
        if (killerEntity) {
            this.result.death[killer].kill += 1;
            this.result.death[killer].logs.push({
                time: micro / 1000,
                type: "kill",
                id,
            });
        }
    }
    // 喊话统计
    updateSay() {
        const { micro, type, detail } = this.current;
        if (![14, 15].includes(type)) return;
        let { content, id } = detail;
        if (!id) id = "_system";
        const typeMap = {
            14: "NPC喊话",
            15: "系统警告框",
        };

        if (!this.result.say[id]) {
            this.result.say[id] = [];
        }
        const log = {
            type: typeMap[type],
            time: micro / 1000,
            content,
        };
        this.result.say[id].push(log);
    }
    // 分队更新
    updateTeam() {
        const { type, detail } = this.current;
        if (type !== 21) return;
        let { caster, target, values } = detail;
        [caster, target] = [caster, target].map((id) => this.result.entities[id]);
        // 只有两个单位都拿到了，并且都是玩家，并且其中至少一个人的队伍还不确定才可以判断
        if (!caster || !target) return;
        if (caster.type != "player" || target.type != "player") return;
        if (caster.team != undefined && target.team != undefined) return;
        // 如果事件来源没有队伍
        if (caster.team != undefined) {
            // 如果事件目标没队伍，需要先给目标一个初始的队伍
            if (target.team === undefined) {
                target.team = true;
            }
            // 事件目标有队伍，可以根据伤害判断出来源的队伍
            if (values["治疗"] > 0) caster.team = target.team;
            if (values["有效伤害"] > 0) {
                caster.team = !target.team;
            }
        } else {
            // 事件来源有队伍，只需要判断目标的队伍
            if (values["治疗"] > 0) target.team = caster.team;
            if (values["有效伤害"] > 0) {
                target.team = !caster.team;
            }
        }
    }
    // 更新数据统计/DPS统计等
    updateStat() {
        const { type, detail } = this.current;
        if (type !== 21) return;
        const { caster, target, values } = detail;
        if (values[13]) {
            this.updateStatItem("damage", caster);
            this.updateStatItem("beDamaged", target);
        }
        if (values[6]) {
            this.updateStatItem("treat", caster);
            if (values[14]) {
                this.updateStatItem("beTreated", target);
            }
        }
    }
    updateStatItem(type, entity) {
        const stat = this.result.stats[type];
        if (!stat[entity]) {
            stat[entity] = {
                all: {
                    value: 0,
                    count: 0,
                    criticalCount: 0,
                    time: 0,
                    max: Number.MIN_SAFE_INTEGER,
                    min: Number.MAX_SAFE_INTEGER,
                    details: [],
                },
                windows: {},
            };
            if (type == "treat") {
                stat[entity].all.total = 0;
            }
        }
        // ========= 先准备好要用的数据，避免后面重复计算 ==========
        const {
            micro,
            detail: { caster, target, eventType, id, level, values, isCritical },
        } = this.current;
        let value = 0;
        let total = 0;
        if (["damage", "beDamaged"].includes(type)) {
            value = values[13];
        } else if (["treat", "beTreated"].includes(type)) {
            value = values[14];
            total = values[6];
        }
        // 技能效果id
        const effectID = `${eventType === 1 ? "skill" : "buff"}:${id}_${level}`;
        // 统计细节
        let log = {
            caster,
            target,
            value: value,
            buffs: this.getBuff(entity),
            micro,
            isCritical: isCritical,
            effect: effectID,
        };
        if (type == "treat") log.T = total;
        // ========= 更新统计
        let all = stat[entity].all;
        all.value += value;
        all.count += 1;
        all.time = micro;
        all.max = Math.max(all.max, value);
        all.min = Math.min(all.min, value);
        all.details.push(log);
        if (isCritical) all.criticalCount += 1;
        if (type == "treat") all.total += total;
        // ========= 更新窗口统计
        let windowId = Math.ceil(micro / 5000) * 5;
        if (!stat[entity].windows[windowId]) {
            stat[entity].windows[windowId] = {
                value: 0,
                count: 0,
                criticalCount: 0,
                max: Number.MIN_SAFE_INTEGER,
                min: Number.MAX_SAFE_INTEGER,
                details: [],
            };
            if (type == "treat") {
                stat[entity].windows[windowId].total = 0;
            }
        }
        let window = stat[entity].windows[windowId];
        window.value += value;
        window.count += 1;
        window.max = Math.max(window.max, value);
        window.min = Math.min(window.min, value);
        window.details.push(log);
        if (isCritical) window.criticalCount += 1;
        if (type == "treat") window.total += total;
    }
}
