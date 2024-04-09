import { parseJx3dat } from "luat2json";

import { JCL_TYPE } from "./jclType";
import { formatLine } from "./format";
import { cloneDeep, pick } from "lodash-es";

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
/**
 *
 * 分析器
 * @class Analyzer
 * @param {string} raw JCL文件内容
 * @param {object} options 选项
 * @property {string[]} raw JCL文件内容
 * @property {object} options 选项
 * @property {object} result 分析结果
 * @property {object} tmp 临时数据
 * @property {number} index 当前解析到的行数
 * @property {number} length JCL文件总行数
 * @property {object} prev 上一行解析结果
 * @property {object} current 当前行解析结果
 * @property {import('./adapter').Adapter} adapter 适配器
 */
export class Analyzer {
    constructor(raw, options) {
        this.raw = raw.split("\n").filter((x) => x);
        this.options = options || {};
        this.reset();
    }

    /**
     * 绑定适配器
     * @param {import('./adapter').Adapter} adapter
     */
    bindAdapter(adapter) {
        this.adapter = adapter;
        this.adapter.bindAnalyzer(this);
    }

    /**
     * 将游标指向某一条记录
     * @param {number|"start"|"end"|"next"} index
     * @returns {number} 更换指向之后的游标位置
     */
    cursorTo(index) {
        if (index === "start") return (this.index = 0);
        if (index === "end") return (this.index = this.length - 1);
        if (index === "next") return (this.index += 1);
        return (this.index = index);
    }

    /**
     * 短遍历，找到开始时间
     * @returns
     */
    findStartTime() {
        let _index = 0;
        const line = parseLine(this.raw[_index]);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            _index++;
            const _line = parseLine(this.raw[_index]);
            // 如果是战斗全局信息并且是开始标记，就是战斗开始时间
            if (_line.type === 1 && _line.detail.start) {
                return getRowTime(_line);
            }
            // 如果遍历超过15秒钟没找到就认为是错误的jcl,为了兼容取第一条
            if (_line.micro - line.micro > 1000 * 15 || _index >= this.length) {
                return getRowTime(line);
            }
            continue;
        }
    }

    /**
     * 重置分析器
     */
    reset() {
        this.cursorTo("start");
        this.length = this.raw.length;
        this.prev = undefined;
        this.current = undefined;

        this.result = cloneDeep(defaultResult);
        this.adapter?.updateResult(this.result);
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
        const analyzer = this;
        return (function* () {
            analyzer.reset();
            analyzer.result.start = analyzer.findStartTime();
            while (true) {
                let result = analyzer.nextLine();
                if (result.done) return analyzer.result;
                yield result;
            }
        })();
    }

    // 解析JCL的下一行
    nextLine() {
        const result = (row, done = false, valid = true) => {
            this.cursorTo("next");
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
            this.endStat();
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
        if (this.updateMeta() === false) {
            this.cursorTo("end");
            return;
        }
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
            this.cursorTo("end");
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
            }
        }
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
            const eb = this.result.buff[target][key];
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
                // 适配可能存在的第一个buff是删除的情况
                if (!eb.cur) {
                    eb.logs.push({
                        source,
                        deleteBy: source,
                        start: 0,
                        end: micro,
                        id: key,
                        stack,
                        stackLogs: {
                            0: stack,
                            [micro]: stack,
                        },
                    });
                    return;
                }
                // 删除BUFF
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
        if (!stat[entity]) stat[entity] = { logs: [] };
        // 整理出log
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
        // 塞进统计里面
        stat[entity]["logs"].push(log);
    }
    // 分析结束的时候，将统计数据整理一下
    endStat() {
        for (let type in this.result.stats) {
            for (let entity in this.result.stats[type]) {
                const statItem = this.result.stats[type][entity];
                this.result.stats[type][entity] = {
                    ...statItem,
                    ...this.getLogsStat(statItem.logs, type),
                };
            }
        }
    }

    // 统计一段时间内的数据详情
    getLogsStat(logs, type) {
        const result = {
            count: 0,
            criticalCount: 0,
            value: 0,
            max: Number.MIN_SAFE_INTEGER,
            min: Number.MAX_SAFE_INTEGER,
            total: 0,
        };
        for (let log of logs) {
            result.count += 1;
            result.value += log.value;
            result.max = Math.max(result.max, log.value);
            result.min = Math.min(result.min, log.value);
            if (log.isCritical) result.criticalCount += 1;
            if (type === "treat") result.total += log.T;
        }
        if (result.max == Number.MIN_SAFE_INTEGER) result.max = 0;
        if (result.min == Number.MAX_SAFE_INTEGER) result.min = 0;

        return result;
    }
}
