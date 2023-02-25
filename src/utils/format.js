/**
 * 这个文件负责log到rows层，计划在解析完用户提交的文件使用
 */
import { JCL_TYPE, SKILL_RESULT_TYPE } from "./jclType";
import xfid from "@jx3box/jx3box-data/data/xf/xfid.json";
import { getEnchantByItemID, getResource } from "@/service/resource";

export const defaultRow = {
    time: 0, //时间(秒)
    frame: 0, //逻辑帧
    micro: 0, //毫秒
    type: 0, //事件类型，枚举整数
    typeDesc: "", //事件类型，描述
    subtype: "", //事件子类型
    source: "", //事件来源
    content: "", //事件内容
    target: "", //事件目标
    value: {}, //事件值
    remark: "", //备注
    __log: "", //原始log的detail
};

// 把一个实体的详情转变为一个给表格展示的，可读的对象
export function entityFormat(entity) {
    const keyMap = {
        npc: {
            i: "id",
            n: "name",
            t: "templateID",
            b: "belongID",
        },
        player: {
            i: "id",
            n: "name",
            s: "school",
            m: "mount",
            e: "equipScore",
            E: "equips",
            t: "talents",
            g: "guid",
        },
    };
    let type = entity.type;
    for (let key in entity) {
        if (keyMap[type][key]) {
            entity[keyMap[type][key]] = entity[key];
            delete entity[key];
        }
    }
    return entity;
}

// 将一条log转换为一个用于表格展示的对象
export function singleLogFormat(log) {
    let { s: time, f: frame, m: micro, t: type, d: detail } = log;
    let typeDesc = JCL_TYPE[type]?.[0] ?? "未知事件"; //事件类型的描述
    let subtype = subtypeFormat(type, detail); //事件子类型的描述
    let source = sourceFormat(type, detail); //事件来源
    let content = contentFormat(type, detail); //事件内容的描述
    let target = targetFormat(type, detail); //事件目标
    let value = valuesFormat(type, detail); //事件值
    return {
        time,
        frame,
        micro,
        type,
        typeDesc,
        subtype,
        source,
        content,
        target,
        value,
        __log: detail,
    };
}

// 展示单位名字
export function entityName(entity, showMount = false) {
    if (!entity) return "天外来客";
    let appearOrder = entity.appearOrder;
    let templateID = entity.templateID;
    let mount = xfid?.[entity.mount];
    let name = entity.name;
    if (templateID) name += `#${templateID}`;
    if (appearOrder) name += `@${appearOrder}`;
    if (showMount && mount) name += `#${mount}`;
    return name;
}

// 展示资源名称
export function resourceName(resource, showID = true) {
    let name = resource.name || `(${resource.remark})`;
    let { id, level } = resource;
    let idKey = showID ? `#${id}_${level}` : "";
    return `${name}${idKey}`;
}

// 角色信息 -> JBBB
export async function entityToJBBB(entityID) {
    const WXS_LEVEL = {
        "5_24423": 1,
        "5_24424": 2,
        "5_24425": 3,
        "5_24426": 4,
        "5_24427": 5,
        "5_24428": 6,
        "5_24429": 7,
        "5_24430": 8,
        "5_24442": 1,
        "5_24443": 2,
        "5_24444": 3,
        "5_24445": 4,
        "5_24446": 5,
        "5_24447": 6,
        "5_24448": 7,
        "5_24449": 8,
    };
    const POSITION_MAP = {
        0: "PRIMARY_WEAPON",
        1: "TERTIARY_WEAPON",
        2: "SECONDARY_WEAPON",
        3: "JACKET",
        4: "HAT",
        5: "NECKLACE",
        6: "RING_1",
        7: "RING_2",
        8: "BELT",
        9: "PENDANT",
        10: "BOTTOMS",
        11: "SHOES",
        12: "WRIST",
    };

    const entities = window.$store.entities[entityID];
    if (!entities) return "{}";
    let { equips, talents, name, mount } = entities;
    console.log(equips);
    const singleTransform = async (equip) => {
        if (!equip) return {};
        let {
            e: embedding,
            i: id,
            p: position,
            s: strength,
            E: [enchant_1 = "", enchant_2 = ""],
            c: stone,
        } = equip;
        embedding = embedding.map((e) => WXS_LEVEL[e] ?? e);
        if (stone) {
            let res = await getEnchantByItemID({ id: stone, client: window.$store.client });
            let enchant = res.data;
            stone = enchant.ID;
        }
        const position_name = POSITION_MAP[position];
        return {
            [position_name]: {
                id,
                stone,
                enhance: enchant_1,
                enchant: enchant_2,
                strength,
                embedding,
            },
        };
    };
    equips = await Promise.all(equips.filter((e) => e.p <= 12).map(singleTransform));
    equips = equips.reduce((a, b) => ({ ...a, ...b }), {});
    let talentSkills = talents.map((t) => t.s);
    let res = await getResource({
        client: window.$store.client,
        type: "skill",
        ids: talentSkills,
        fields: ["SkillID", "Level", "Name"],
    });
    let skills = res.data;
    if (skills.length) {
        skills = skills.reduce((a, b) => ({ ...a, [b.SkillID]: b.Name }), {});
    } else {
        skills = {};
    }
    talents = talents
        .map((t) => {
            let [id, level] = t?.s?.split("_") ?? [];
            level;
            if (id) {
                return {
                    id,
                    name: skills[id],
                };
            }
            return {};
        })
        .filter((t) => ~~t.id);
    return {
        Title: `${name}`,
        EquipList: equips,
        TalentCode: talents,
        Mount: mount,
        Client: window.$store.client,
    };
}

function subtypeFormat(type, d) {
    if (type === 1) return d.i ? "开始战斗" : "结束战斗";

    if (type === 13) {
        //BUFF更新时间
        if (d.d) return "卸除BUFF";
        else return "添加BUFF";
    }
    if (type === 17) {
        //团队成员掉线/离线
        if (d.o) return "上线";
        else return "离线";
    }
    if (type === 21) {
        //技能效果生效事件
        return {
            1: "技能",
            2: "Buff",
        }[d.T];
    }
    if ([5, 9].includes(type)) {
        //技能效果生效事件
        return d.f ? "进战" : "脱战";
    }
}

function sourceFormat(type, d) {
    if ([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 19, 20, 27, 29].includes(type))
        //玩家进入/离开, NPC进入/离开, 交互物品进入/离开
        return {
            t: "entity",
            v: d.i,
        };
    if ([17].includes(type))
        //source, BUFF来源
        return {
            t: "entity",
            v: d.m,
        };
    if ([13].includes(type))
        //source, BUFF来源
        return {
            t: "entity",
            v: d.s,
        };
    if ([21, 22, 23, 24, 25, 26].includes(type))
        //caster，技能释放者
        return {
            t: "entity",
            v: d.c,
        };
    if ([28].includes(type))
        //killer，击杀者
        return {
            t: "entity",
            v: d.k,
        };
    return "";
}

function contentFormat(type, d) {
    if (type == 13)
        //BUFF更新
        return {
            t: "buff",
            v: `${d.b}_${d.l}`,
            n: d.n,
        };
    if ([14, 15, 18].includes(type))
        //NPC喊话,系统警告,系统信息
        return {
            t: "str",
            v: d.c,
        };
    if ([19, 20].includes(type))
        //技能释放,技能释放结果
        return {
            t: "skill",
            v: `${d.s}_${d.l}`,
        };
    if ([21, 22, 23, 24, 25, 26].includes(type))
        if (d.T === 1)
            //技能效果生效
            return {
                t: "skill",
                v: `${d.i}_${d.l}`,
            };
        else
            return {
                t: "buff",
                v: `${d.i}_${d.l}`,
            };
    if (type === 29) {
        return {
            t: "str",
            v: `(${d.x}, ${d.y}, ${d.z})`,
        };
    }
    return {};
}

function targetFormat(type, d) {
    if ([13, 21, 22, 23, 24, 25, 26].includes(type))
        //target, 技能目标
        return {
            t: "entity",
            v: d.t,
        };
    if ([28].includes(type))
        //id, 被击杀者ID
        return {
            t: "entity",
            v: d.i,
        };
    return {};
}

function valuesFormat(type, d) {
    if (type === 21) {
        //value, 技能效果值
        let values = {};
        for (let i in d.v) {
            values[SKILL_RESULT_TYPE[i]] = d.v[i];
        }
        return values;
    }
    return {};
}
